import React, { useState } from 'react';
import { Eye, Sliders, Maximize2, Layers } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  reconstructedImage: string;
  renderedSvgImage?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  reconstructedImage,
  renderedSvgImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeMode, setActiveMode] = useState<'orig-recon' | 'orig-svg' | 'svg-recon'>('orig-recon');

  const getLeftImage = () => {
    if (activeMode === 'svg-recon') return renderedSvgImage || originalImage;
    return originalImage;
  };

  const getRightImage = () => {
    if (activeMode === 'orig-svg') return renderedSvgImage || reconstructedImage;
    return reconstructedImage;
  };

  const getLeftLabel = () => {
    if (activeMode === 'svg-recon') return 'Transmitted SVG Vector';
    return 'Original Raster Target';
  };

  const getRightLabel = () => {
    if (activeMode === 'orig-svg') return 'Transmitted Vector SVG';
    return 'AI Reconstructed HD Bitmap';
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Interactive Visual Split Curtain Comparison</span>
        </div>

        {/* Comparison Pair Mode Toggle */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMode('orig-recon')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeMode === 'orig-recon' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original vs AI Reconstructed
          </button>
          <button
            onClick={() => setActiveMode('orig-svg')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeMode === 'orig-svg' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original vs Vector SVG
          </button>
        </div>
      </div>

      {/* Split Slider Canvas Container */}
      <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 select-none">
        {/* Right Base Image (e.g. AI Reconstructed) */}
        <img
          src={getRightImage()}
          alt="Right Target"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold bg-slate-950/90 border border-slate-700/80 text-cyan-300 rounded-lg backdrop-blur-md">
          {getRightLabel()}
        </div>

        {/* Left Clipped Image (e.g. Original Raster) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={getLeftImage()}
            alt="Left Target"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none p-2"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-slate-950/90 border border-slate-700/80 text-slate-200 rounded-lg backdrop-blur-md">
            {getLeftLabel()}
          </div>
        </div>

        {/* Vertical Divider Curtain Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-500 text-slate-950 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs">
            &harr;
          </div>
        </div>

        {/* Invisible Range Slider overlay */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
        <span>Slide left/right to compare pixel restoration and edge sharpness</span>
        <span className="font-mono text-cyan-400">{sliderPosition}% Split Ratio</span>
      </div>
    </div>
  );
};
