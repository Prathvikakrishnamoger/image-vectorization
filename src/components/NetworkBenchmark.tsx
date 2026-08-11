import React from 'react';
import { Wifi, ArrowDownRight, Clock, Zap } from 'lucide-react';
import { NetworkBenchmarkItem } from '../types';

interface NetworkBenchmarkProps {
  benchmarks: NetworkBenchmarkItem[];
}

export const NetworkBenchmark: React.FC<NetworkBenchmarkProps> = ({ benchmarks }) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Wifi className="w-4 h-4" />
          <span>Network Latency & Transmission Speed Benchmarks</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">PAYLOAD LATENCY</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
              <th className="py-2 px-3 font-semibold">Network Standard</th>
              <th className="py-2 px-3 font-semibold text-right">Bandwidth</th>
              <th className="py-2 px-3 font-semibold text-right">Raster Time</th>
              <th className="py-2 px-3 font-semibold text-right text-cyan-400">Vector Payload Time</th>
              <th className="py-2 px-3 font-semibold text-right text-emerald-400">Time Saved</th>
              <th className="py-2 px-3 font-semibold text-center">Speedup Factor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {benchmarks.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  {item.network}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400">
                  {item.speedKbps >= 1000 ? `${item.speedKbps / 1000} Mbps` : `${item.speedKbps} Kbps`}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-300 font-medium">
                  {item.rasterTimeMs >= 1000
                    ? `${(item.rasterTimeMs / 1000).toFixed(2)}s`
                    : `${item.rasterTimeMs}ms`}
                </td>
                <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                  {item.vectorTimeMs >= 1000
                    ? `${(item.vectorTimeMs / 1000).toFixed(2)}s`
                    : `${item.vectorTimeMs}ms`}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                  {item.timeSavedMs >= 1000
                    ? `-${(item.timeSavedMs / 1000).toFixed(2)}s`
                    : `-${item.timeSavedMs}ms`}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full inline-flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    {item.speedupFactor}x faster
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
