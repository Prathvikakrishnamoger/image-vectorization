import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  FileText,
  Award,
  Wifi,
  Download,
  Zap,
  Sparkles,
  Sliders,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { TransmissionResult, QualityMetrics, NetworkBenchmarkItem } from '../types';
import { ComparisonSlider } from './ComparisonSlider';
import { PayloadInspector } from './PayloadInspector';
import { MetricsCard } from './MetricsCard';
import { NetworkBenchmark } from './NetworkBenchmark';

interface ReceiverPanelProps {
  result: TransmissionResult | null;
  originalImage: string | null;
  loading: boolean;
  onOpenEnlargedViewer?: () => void;
}

export const ReceiverPanel: React.FC<ReceiverPanelProps> = ({
  result,
  originalImage,
  loading,
  onOpenEnlargedViewer,
}) => {
  const [activeTab, setActiveTab] = useState<
    'compare' | 'output' | 'vector' | 'code' | 'metrics' | 'network'
  >('compare');

  const handleDownloadReconstructed = () => {
    if (!result?.reconstructedImageBase64) return;
    const a = document.createElement('a');
    a.href = result.reconstructedImageBase64;
    a.download = `reconstructed_ai_output_${Date.now()}.png`;
    a.click();
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col justify-between shadow-xl shadow-slate-950/40 min-h-[500px]">
      <div>
        {/* Stage Header & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-base">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Stage 2: Receiver Node & AI Reconstruction</span>
          </div>

          {/* View Tabs */}
          {result && (
            <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'compare'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 inline mr-1" /> Compare
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'output'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" /> Reconstructed
              </button>
              <button
                onClick={() => setActiveTab('vector')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'vector'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Transmitted Vector
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'code'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" /> Payload Code
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'metrics'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 inline mr-1" /> Metrics
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === 'network'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 inline mr-1" /> Latency
              </button>
            </div>
          )}
        </div>

        {/* Processing State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <div className="p-4 bg-cyan-950/60 border border-cyan-800 rounded-2xl animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-cyan-300">
              Vectorizing image & rendering AI reconstructed bitmap...
            </p>
            <p className="text-xs text-slate-400">
              Running contour quantization, bilateral edge smoothing, and PSNR quality assessment.
            </p>
          </div>
        )}

        {/* Main Transmitted Result View */}
        {!loading && result && (
          <div className="space-y-5">
            {/* Analytics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/90 border border-slate-800 p-4 rounded-xl text-center">
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Original Target Size</div>
                <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">
                  {(result.stats.originalSizeBytes / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Transmitted Vector SVG</div>
                <div className="text-base font-extrabold text-cyan-400 font-mono mt-0.5">
                  {(result.stats.svgSizeBytes / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Bandwidth Saved</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                  {result.stats.bandwidthSavedPercent}%
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Compression Factor</div>
                <div className="text-base font-extrabold text-sky-300 font-mono mt-0.5">
                  {result.stats.compressionRatio}x smaller
                </div>
              </div>
            </div>

            {/* AI Notes Banner */}
            {result.aiNotes && (
              <div className="bg-cyan-950/40 border border-cyan-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-cyan-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300">AI Reconstruction Engine Note: </span>
                  <span>{result.aiNotes}</span>
                </div>
              </div>
            )}

            {/* Tab 1: Interactive Split-Curtain Comparison */}
            {activeTab === 'compare' && originalImage && (
              <ComparisonSlider
                originalImage={originalImage}
                reconstructedImage={result.reconstructedImageBase64}
                renderedSvgImage={result.renderedSvgBase64}
              />
            )}

            {/* Tab 2: Reconstructed HD Output */}
            {activeTab === 'output' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    AI-Reconstructed Bitmap Output (Receiver Rendered)
                  </span>
                  <div className="flex items-center gap-2">
                    {onOpenEnlargedViewer && (
                      <button
                        onClick={onOpenEnlargedViewer}
                        className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Enlarge View
                      </button>
                    )}
                    <button
                      onClick={handleDownloadReconstructed}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download HD PNG
                    </button>
                  </div>
                </div>
                <div
                  onClick={onOpenEnlargedViewer}
                  className="h-80 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3 relative group cursor-pointer overflow-hidden"
                >
                  <img
                    src={result.reconstructedImageBase64}
                    alt="AI Reconstructed HD"
                    className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs backdrop-blur-[2px]">
                    <Maximize2 className="w-5 h-5 text-cyan-400" />
                    <span>Click to view enlarged reconstruction</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Transmitted Vector Preview */}
            {activeTab === 'vector' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 font-semibold">
                  Transmitted Lightweight SVG Frame (Direct Vector Render)
                </div>
                <div className="h-80 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3">
                  <div
                    className="max-h-full max-w-full flex items-center justify-center [&>svg]:max-h-72 [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: result.transmittedVectorSvg }}
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Code Inspector */}
            {activeTab === 'code' && (
              <PayloadInspector
                svgContent={result.transmittedVectorSvg}
                stats={result.stats}
                colorPalette={result.colorPalette}
              />
            )}

            {/* Tab 5: Quality Metrics */}
            {activeTab === 'metrics' && <MetricsCard metrics={result.metrics} />}

            {/* Tab 6: Network Latency */}
            {activeTab === 'network' && (
              <NetworkBenchmark benchmarks={result.networkBenchmarks} />
            )}
          </div>
        )}

        {/* Empty State when no image transmitted yet */}
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <Zap className="w-10 h-10 text-slate-600 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Awaiting vector transmission payload</p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Select or upload a target image on Stage 1, adjust vector precision, and click "Vectorize & Transmit".
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
