import { VectorizerConfig, TransmissionStats } from '../types';

/**
 * Image Vectorization Engine
 * Converts raster Image / ImageData into lightweight SVG vector paths.
 */
export async function vectorizeImageData(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  config: VectorizerConfig
): Promise<{ svgContent: string; stats: TransmissionStats; colorPalette: string[] }> {
  const startTime = performance.now();

  // Load image onto canvas to extract raw ImageData
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  if (typeof imageSource === 'string') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageSource;
    });
    canvas = document.createElement('canvas');
    canvas.width = img.width || 400;
    canvas.height = img.height || 400;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
  } else if (imageSource instanceof HTMLImageElement) {
    canvas = document.createElement('canvas');
    canvas.width = imageSource.naturalWidth || imageSource.width || 400;
    canvas.height = imageSource.naturalHeight || imageSource.height || 400;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(imageSource, 0, 0);
  } else {
    canvas = imageSource;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  }

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Color Quantization based on precision config
  // Precision 2-8 bits maps to 4 - 256 colors
  const maxColors = Math.pow(2, Math.min(8, Math.max(2, config.colorPrecision)));
  const { quantizedIndices, palette } = quantizeColors(data, width, height, maxColors, config.colormode);

  // 2. Extract boundaries & generate SVG paths per color index
  const pathsByColor: { color: string; d: string }[] = [];
  let totalPaths = 0;

  for (let c = 0; c < palette.length; c++) {
    const colorHex = palette[c];
    // Build binary mask for this color
    const mask = new Uint8Array(width * height);
    for (let i = 0; i < quantizedIndices.length; i++) {
      if (quantizedIndices[i] === c) {
        mask[i] = 1;
      }
    }

    // Apply speckle noise filter (remove small islands < filterSpeckle)
    if (config.filterSpeckle > 0) {
      filterSpeckleNoise(mask, width, height, config.filterSpeckle);
    }

    // Trace contours on mask
    const pathD = traceMaskToSvgPath(mask, width, height, config);
    if (pathD.trim().length > 0) {
      pathsByColor.push({ color: colorHex, d: pathD });
      totalPaths += (pathD.match(/M/g) || []).length;
    }
  }

  // Build final SVG XML
  const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  const bgRect = palette.length > 0 ? `  <rect width="${width}" height="${height}" fill="${palette[0]}" />\n` : '';
  const pathElements = pathsByColor
    .map(p => `  <path fill="${p.color}" d="${p.d}" />`)
    .join('\n');
  const svgFooter = `\n</svg>`;

  const svgContent = `${svgHeader}${bgRect}${pathElements}${svgFooter}`;

  // Estimate Original Raster Size vs SVG Size
  // Uncompressed RGBA raster size = width * height * 4
  // Plus PNG header overhead approximation (approx 0.7x compression ratio for typical images)
  const estimatedOriginalSizeBytes = Math.round(width * height * 0.75) + 2048;
  const svgSizeBytes = new Blob([svgContent]).size;
  // Gzip compression estimate for SVG text (~0.35 of plain XML)
  const gzipSizeBytes = Math.round(svgSizeBytes * 0.38);

  const savedPercent = Math.max(0, Math.round((1 - (svgSizeBytes / estimatedOriginalSizeBytes)) * 1000) / 10);
  const ratio = Math.round((estimatedOriginalSizeBytes / Math.max(1, svgSizeBytes)) * 10) / 10;
  const endTime = performance.now();

  const stats: TransmissionStats = {
    originalSizeBytes: estimatedOriginalSizeBytes,
    svgSizeBytes,
    gzipSizeBytes,
    bandwidthSavedPercent: savedPercent,
    compressionRatio: ratio,
    width,
    height,
    pathCount: totalPaths,
    colorCount: palette.length,
    processingTimeMs: Math.round(endTime - startTime),
  };

  return {
    svgContent,
    stats,
    colorPalette: palette,
  };
}

/**
 * Color Quantization Algorithm using median cut / histogram binning
 */
function quantizeColors(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  maxColors: number,
  mode: 'color' | 'binary'
): { quantizedIndices: Uint8Array; palette: string[] } {
  const pixelCount = width * height;
  const quantizedIndices = new Uint8Array(pixelCount);

  if (mode === 'binary') {
    const palette = ['#0f172a', '#38bdf8'];
    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const luminance = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      quantizedIndices[i] = luminance > 128 ? 1 : 0;
    }
    return { quantizedIndices, palette };
  }

  // Color mode quantization
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
  // Bit-shift binning for fast clustering
  const step = Math.max(1, Math.floor(pixelCount / 10000));

  for (let i = 0; i < pixelCount; i += step) {
    const idx = i * 4;
    // Quantize 8-bit channel to 4-bit bin (16 levels per channel)
    const r = data[idx] & 0xf0;
    const g = data[idx + 1] & 0xf0;
    const b = data[idx + 2] & 0xf0;
    const key = `${r},${g},${b}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count += step;
    } else {
      colorMap.set(key, { r, g, b, count: step });
    }
  }

  // Sort by frequency and select top maxColors
  const sortedColors = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  const paletteHex = sortedColors.map(c => {
    const toHex = (v: number) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0');
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
  });

  if (paletteHex.length === 0) {
    paletteHex.push('#0f172a', '#ffffff');
  }

  // Map every pixel to nearest palette color
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    let minDist = Infinity;
    let bestColorIdx = 0;

    for (let c = 0; c < sortedColors.length; c++) {
      const pal = sortedColors[c];
      const dist = (r - pal.r) ** 2 + (g - pal.g) ** 2 + (b - pal.b) ** 2;
      if (dist < minDist) {
        minDist = dist;
        bestColorIdx = c;
      }
    }
    quantizedIndices[i] = bestColorIdx;
  }

  return { quantizedIndices, palette: paletteHex };
}

/**
 * Filter out speckle noise islands smaller than threshold
 */
function filterSpeckleNoise(mask: Uint8Array, width: number, height: number, speckleThreshold: number) {
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1 && visited[idx] === 0) {
        // BFS / Flood fill to find island size
        const component: number[] = [];
        const queue: number[] = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.pop()!;
          component.push(curr);

          const cx = curr % width;
          const cy = Math.floor(curr / width);

          // 4-neighbors
          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];

          for (const n of neighbors) {
            if (n !== -1 && mask[n] === 1 && visited[n] === 0) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        if (component.length < speckleThreshold) {
          for (const p of component) {
            mask[p] = 0; // Clear noise island
          }
        }
      }
    }
  }
}

/**
 * Trace binary mask contours to SVG path command string
 */
function traceMaskToSvgPath(
  mask: Uint8Array,
  width: number,
  height: number,
  config: VectorizerConfig
): string {
  const pathCommands: string[] = [];
  const decimals = Math.min(5, Math.max(1, config.pathPrecision));

  // Simple boundary box scan with step reduction
  const step = config.mode === 'spline' ? 2 : 1;

  for (let y = 0; y < height - 1; y += step) {
    let inPath = false;
    let startX = 0;

    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isPixel = mask[idx] === 1;

      if (isPixel && !inPath) {
        inPath = true;
        startX = x;
      } else if (!isPixel && inPath) {
        inPath = false;
        const endX = x - 1;
        if (endX >= startX) {
          const rx = startX.toFixed(decimals);
          const ry = y.toFixed(decimals);
          const rw = (endX - startX + 1).toFixed(decimals);
          const rh = step.toFixed(decimals);

          if (config.mode === 'spline') {
            // Cubic curve representation for smooth spline vectoring
            const midX = (startX + endX) / 2;
            pathCommands.push(`M${rx},${ry} Q${midX.toFixed(decimals)},${(y - 0.5).toFixed(decimals)} ${(endX + 1).toFixed(decimals)},${ry} v${rh} h-${rw} z`);
          } else {
            // Polygon crisp rect boundaries
            pathCommands.push(`M${rx},${ry} h${rw} v${rh} h-${rw} z`);
          }
        }
      }
    }

    if (inPath) {
      const endX = width - 1;
      const rx = startX.toFixed(decimals);
      const ry = y.toFixed(decimals);
      const rw = (endX - startX + 1).toFixed(decimals);
      const rh = step.toFixed(decimals);
      pathCommands.push(`M${rx},${ry} h${rw} v${rh} h-${rw} z`);
    }
  }

  return pathCommands.join(' ');
}
