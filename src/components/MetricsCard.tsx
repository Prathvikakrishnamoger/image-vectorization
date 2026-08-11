import React from 'react';
import { ShieldCheck, Activity, Award, Zap, AlertCircle } from 'lucide-react';
import { QualityMetrics } from '../types';

interface MetricsCardProps {
  metrics: QualityMetrics;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  const getRatingBadgeClass = (rating: QualityMetrics['qualityRating']) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Good':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Moderate':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Lossy':
        return 'bg-rose-950 text-rose-300 border-rose-800';
    }
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Image Fidelity Evaluation Metrics</span>
        </div>
        <div
          className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getRatingBadgeClass(
            metrics.qualityRating
          )}`}
        >
          Rating: {metrics.qualityRating}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PSNR Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">PSNR (Fidelity)</div>
            <div className="text-xl font-black text-cyan-300 mt-1">{metrics.psnr} <span className="text-xs font-normal text-slate-400">dB</span></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Peak Signal-to-Noise Ratio. (&gt;30 dB = High quality)</p>
        </div>

        {/* SSIM Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">SSIM Index</div>
            <div className="text-xl font-black text-emerald-300 mt-1">{metrics.ssim}</div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Structural Similarity Index. (1.0 = Identical structure)</p>
        </div>

        {/* MSE Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">MSE (Error)</div>
            <div className="text-xl font-black text-sky-300 mt-1">{metrics.mse}</div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Mean Squared Error per RGB channel. Lower is better.</p>
        </div>

        {/* VIF Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">VIF Score</div>
            <div className="text-xl font-black text-indigo-300 mt-1">{metrics.vif}%</div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Visual Information Fidelity percentage.</p>
        </div>
      </div>
    </div>
  );
};
