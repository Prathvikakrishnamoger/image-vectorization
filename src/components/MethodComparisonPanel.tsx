import React from 'react';
import { BarChart3, Clock, Zap, ArrowDownRight, Wifi, Image as ImageIcon, FileCode } from 'lucide-react';
import { TransmissionStats, RawPixelResult, NetworkBenchmarkItem } from '../types';

interface MethodComparisonPanelProps {
  vectorStats: TransmissionStats;
  rawPixelResult: RawPixelResult;
  vectorNetworkBenchmarks: NetworkBenchmarkItem[];
}

export const MethodComparisonPanel: React.FC<MethodComparisonPanelProps> = ({
  vectorStats,
  rawPixelResult,
  vectorNetworkBenchmarks,
}) => {
  const rawSizeKB = rawPixelResult.payloadSizeBytes / 1024;
  const vectorSizeKB = vectorStats.svgSizeBytes / 1024;
  const maxSizeKB = Math.max(rawSizeKB, vectorSizeKB);
  const rawBarWidth = (rawSizeKB / maxSizeKB) * 100;
  const vectorBarWidth = (vectorSizeKB / maxSizeKB) * 100;
  const savingsPercent = Math.round((1 - vectorSizeKB / rawSizeKB) * 1000) / 10;
  const compressionFactor = Math.round((rawSizeKB / Math.max(0.01, vectorSizeKB)) * 10) / 10;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Raw Pixel vs Vector — Payload & Latency Comparison</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">METHOD BENCHMARK</span>
      </div>

      {/* Payload Size Comparison Visual Bars */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          Payload Size Comparison
        </div>

        {/* Raw Pixel Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <ImageIcon className="w-3 h-3" />
              Raw Pixels (Base64 PNG)
            </span>
            <span className="font-mono font-bold text-rose-400">{rawSizeKB.toFixed(1)} KB</span>
          </div>
          <div className="h-6 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-orange-500 rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
              style={{ width: `${rawBarWidth}%` }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-md">
                {rawSizeKB.toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>

        {/* Vector SVG Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <FileCode className="w-3 h-3" />
              Vectorized SVG
            </span>
            <span className="font-mono font-bold text-cyan-400">{vectorSizeKB.toFixed(1)} KB</span>
          </div>
          <div className="h-6 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
              style={{ width: `${Math.max(vectorBarWidth, 3)}%` }}
            >
              {vectorBarWidth > 8 && (
                <span className="text-[10px] font-bold text-white drop-shadow-md">
                  {vectorSizeKB.toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Savings Banner */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              Bandwidth Saved
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 font-mono mt-1">
              {savingsPercent}%
            </div>
          </div>
          <div className="bg-sky-950/60 border border-sky-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
              Compression Factor
            </div>
            <div className="text-2xl font-extrabold text-sky-300 font-mono mt-1">
              {compressionFactor}x
            </div>
            <div className="text-[10px] text-sky-400 mt-0.5">smaller payload</div>
          </div>
        </div>
      </div>

      {/* Network Latency Comparison Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Wifi className="w-4 h-4" />
            <span>Latency Comparison Across Networks</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">TRANSMISSION TIME</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-2 px-3 font-semibold">Network</th>
                <th className="py-2 px-3 font-semibold text-right text-rose-400">
                  Raw Pixel Time
                </th>
                <th className="py-2 px-3 font-semibold text-right text-cyan-400">
                  Vector Time
                </th>
                <th className="py-2 px-3 font-semibold text-right text-emerald-400">
                  Time Saved
                </th>
                <th className="py-2 px-3 font-semibold text-center">Speedup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rawPixelResult.networkBenchmarks.map((rawItem, idx) => {
                const vecItem = vectorNetworkBenchmarks[idx];
                const timeSaved = rawItem.rasterTimeMs - (vecItem?.vectorTimeMs || 0);
                const speedup =
                  Math.round(
                    (rawItem.rasterTimeMs / Math.max(1, vecItem?.vectorTimeMs || 1)) * 10
                  ) / 10;

                return (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans flex items-center gap-2">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      {rawItem.network}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-300 font-medium">
                      {rawItem.rasterTimeMs >= 1000
                        ? `${(rawItem.rasterTimeMs / 1000).toFixed(2)}s`
                        : `${rawItem.rasterTimeMs}ms`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                      {(vecItem?.vectorTimeMs || 0) >= 1000
                        ? `${((vecItem?.vectorTimeMs || 0) / 1000).toFixed(2)}s`
                        : `${vecItem?.vectorTimeMs || 0}ms`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {timeSaved >= 1000
                        ? `-${(timeSaved / 1000).toFixed(2)}s`
                        : `-${timeSaved}ms`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        {speedup}x faster
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Time Comparison */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          Processing Time (Client-Side Encoding)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-center">
            <div className="text-[10px] text-rose-400 font-semibold uppercase">Raw Pixel</div>
            <div className="text-lg font-extrabold text-rose-300 font-mono mt-1">
              {rawPixelResult.processingTimeMs}ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">No encoding needed</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-center">
            <div className="text-[10px] text-cyan-400 font-semibold uppercase">Vectorization</div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono mt-1">
              {vectorStats.processingTimeMs}ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Color quantization + SVG tracing
            </div>
          </div>
        </div>
      </div>

      {/* Summary Verdict */}
      <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 text-center">
        <div className="text-xs font-bold text-emerald-300 mb-1">
          ✅ Vector Transmission Verdict
        </div>
        <p className="text-[11px] text-emerald-200 leading-relaxed">
          Vectorized SVG payload is <span className="font-bold text-emerald-100">{compressionFactor}x smaller</span> than
          raw pixel data, saving <span className="font-bold text-emerald-100">{savingsPercent}%</span> bandwidth.
          {vectorStats.processingTimeMs > 0 && (
            <> The vectorization overhead of {vectorStats.processingTimeMs}ms is negligible compared to the
            network transmission savings, especially on low-bandwidth networks like 2G/3G.</>
          )}
        </p>
      </div>
    </div>
  );
};
