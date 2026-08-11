import React, { useState } from 'react';
import { X, Download, Sliders, Eye, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { SavedTransmission, TransmissionResult } from '../types';
import { ComparisonSlider } from './ComparisonSlider';

interface EnlargedViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transmission: SavedTransmission | null;
  currentResult: TransmissionResult | null;
  currentOriginalImage: string | null;
}

export const EnlargedViewerModal: React.FC<EnlargedViewerModalProps> = ({
  isOpen,
  onClose,
  transmission,
  currentResult,
  currentOriginalImage,
}) => {
  const [viewMode, setViewMode] = useState<'reconstructed' | 'compare' | 'vector'>('reconstructed');

  if (!isOpen) return null;

  // Use transmission data if available, fallback to currentResult
  const result = transmission ? transmission.result : currentResult;
  const original = transmission ? transmission.originalImage : currentOriginalImage;
  const senderName = transmission ? transmission.senderName : 'Sender Node';
  const recipientName = transmission ? transmission.recipientName : 'Receiver Node';
  const title = transmission ? transmission.title : 'AI Reconstructed Transmission';

  if (!result) return null;

  const handleDownload = () => {
    if (!result.reconstructedImageBase64) return;
    const a = document.createElement('a');
    a.href = result.reconstructedImageBase64;
    a.download = `reconstructed_hd_${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-750 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">{title}</h3>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full font-mono font-bold">
                  {result.stats.bandwidthSavedPercent}% Bandwidth Saved
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>From <strong className="text-cyan-300">{senderName}</strong></span>
                <span>&rarr;</span>
                <span>To <strong className="text-emerald-300">{recipientName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 text-xs">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('reconstructed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'reconstructed'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" /> Reconstructed HD
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'compare'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1.5" /> Split Comparison
            </button>
            <button
              onClick={() => setViewMode('vector')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'vector'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" /> Transmitted Vector
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Original: {(result.stats.originalSizeBytes / 1024).toFixed(1)} KB</span>
            <span>&bull;</span>
            <span className="text-cyan-400">Vector SVG: {(result.stats.svgSizeBytes / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        {/* Main Image Body Viewer */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950/60 flex items-center justify-center min-h-[380px]">
          {viewMode === 'reconstructed' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center space-y-2">
              <div className="max-h-[62vh] max-w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={result.reconstructedImageBase64}
                  alt="AI Reconstructed HD Full"
                  className="max-h-[58vh] w-auto object-contain rounded-xl"
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Receiver AI Edge-Restored Bitmap (High-Fidelity)</span>
              </div>
            </div>
          )}

          {viewMode === 'compare' && original && (
            <div className="w-full">
              <ComparisonSlider
                originalImage={original}
                reconstructedImage={result.reconstructedImageBase64}
                renderedSvgImage={result.renderedSvgBase64}
              />
            </div>
          )}

          {viewMode === 'vector' && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              <div className="max-h-[62vh] max-w-full w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
                <div
                  className="max-h-[56vh] max-w-full flex items-center justify-center [&>svg]:max-h-[52vh] [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: result.transmittedVectorSvg }}
                />
              </div>
              <div className="text-[11px] text-cyan-300 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800 font-mono">
                Payload Size: {(result.stats.svgSizeBytes / 1024).toFixed(2)} KB ({result.stats.compressionRatio}x smaller)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
