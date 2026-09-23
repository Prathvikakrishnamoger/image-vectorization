export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface SavedTransmission {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  title: string;
  timestamp: string;
  originalImage: string;
  result: TransmissionResult;
  config: VectorizerConfig;
}

export interface VectorizerConfig {
  colorPrecision: number; // 2 to 8 bits
  colormode: 'color' | 'binary';
  mode: 'spline' | 'polygon' | 'none';
  filterSpeckle: number; // Speckle noise filter threshold (pixels)
  pathPrecision: number; // 1 to 5 decimal places
  hierarchical: 'stacked' | 'cutout';
}

export interface TransmissionStats {
  originalSizeBytes: number;
  svgSizeBytes: number;
  gzipSizeBytes: number;
  rawPixelSizeBytes: number; // Actual base64 raw pixel payload size
  bandwidthSavedPercent: number;
  compressionRatio: number;
  width: number;
  height: number;
  pathCount: number;
  colorCount: number;
  processingTimeMs: number;
}

export interface QualityMetrics {
  psnr: number; // Peak Signal to Noise Ratio in dB
  ssim: number; // Structural Similarity Index 0.0 - 1.0
  mse: number;  // Mean Squared Error
  vif: number;  // Visual Information Fidelity %
  qualityRating: 'Excellent' | 'Good' | 'Moderate' | 'Lossy';
}

export interface NetworkBenchmarkItem {
  network: string;
  speedKbps: number;
  rasterTimeMs: number;
  vectorTimeMs: number;
  timeSavedMs: number;
  speedupFactor: number;
}

export interface TransmissionResult {
  stats: TransmissionStats;
  transmittedVectorSvg: string;
  reconstructedImageBase64: string;
  renderedSvgBase64: string;
  metrics: QualityMetrics;
  networkBenchmarks: NetworkBenchmarkItem[];
  colorPalette: string[];
  extractedText?: string;
  aiNotes?: string;
}

/** Raw pixel transmission result for comparison with vector method */
export interface RawPixelResult {
  payloadSizeBytes: number;
  processingTimeMs: number;
  imageBase64: string;
  networkBenchmarks: NetworkBenchmarkItem[];
}

export type TransmissionMode = 'vector' | 'raw_pixel';

export interface PresetSample {
  id: string;
  name: string;
  category: 'Logo' | 'Technical Diagram' | 'Schematic' | 'Line Art' | 'Photo';
  description: string;
  dataUrl: string;
  recommendedPrecision: number;
}
