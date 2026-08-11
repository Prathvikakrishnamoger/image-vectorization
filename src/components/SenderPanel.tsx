import React, { useRef } from 'react';
import { Upload, Cpu, ArrowRight, Sliders, Image as ImageIcon, Zap, FileCode, CheckCircle2, UserCheck, Send, Sparkles } from 'lucide-react';
import { VectorizerConfig, PresetSample, User } from '../types';

interface SenderPanelProps {
  originalImage: string | null;
  vectorPreviewSvg?: string | null;
  onFileSelected: (file: File) => void;
  config: VectorizerConfig;
  onChangeConfig: (newConfig: VectorizerConfig) => void;
  onTransmit: () => void;
  loading: boolean;
  onSelectPreset: (preset: PresetSample) => void;
  presets: PresetSample[];
  currentUser: User | null;
  users: User[];
  recipientId: string;
  onSelectRecipient: (id: string) => void;
  sentSuccess: boolean;
}

export const SenderPanel: React.FC<SenderPanelProps> = ({
  originalImage,
  vectorPreviewSvg,
  onFileSelected,
  config,
  onChangeConfig,
  onTransmit,
  loading,
  onSelectPreset,
  presets,
  currentUser,
  users,
  recipientId,
  onSelectRecipient,
  sentSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const recipientUsers = users.filter((u) => u.id !== currentUser?.id);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col justify-between shadow-xl shadow-slate-950/40">
      <div>
        {/* Stage Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-base">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800">
              <Cpu className="w-5 h-5" />
            </div>
            <span>Stage 1: Sender Node Vectorizer</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">ENCODER ROUTE</span>
        </div>

        {/* Logged in Sender Badge */}
        {currentUser && (
          <div className="mb-4 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full border border-cyan-500/50 bg-slate-800"
              />
              <div>
                <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.email}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md">
              Sender Active
            </span>
          </div>
        )}

        {/* Drag & Drop File Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 bg-slate-950/50 hover:bg-slate-900/50 transition-all rounded-xl p-4 text-center cursor-pointer group mb-4"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileSelected(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2.5 bg-slate-800/80 group-hover:bg-cyan-950 group-hover:text-cyan-400 text-slate-400 rounded-xl transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                Click to upload image or drag & drop
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, WebP, SVG (Logos, Schematics, Diagrams)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Presets Pills */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Or select instant sample preset:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="px-2.5 py-1 text-[11px] bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-3 h-3 text-cyan-400" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Image Previews: Original Raster & Vector Output in Sender Node */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Original Raster Preview */}
          {originalImage ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-cyan-400" />
                  Raster Input
                </span>
                <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                </span>
              </div>
              <div className="h-40 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-2 relative overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original Target"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="h-40 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
              No input image loaded
            </div>
          )}

          {/* Sender-Side Generated SVG Vector Preview */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Sender Vector Preview
              </span>
              {vectorPreviewSvg ? (
                <span className="text-cyan-400 text-[10px] font-mono font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  Vectorized SVG
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">Pending transmit</span>
              )}
            </div>
            <div className="h-40 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-2 relative overflow-hidden">
              {vectorPreviewSvg ? (
                <div
                  className="max-h-full max-w-full flex items-center justify-center [&>svg]:max-h-36 [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: vectorPreviewSvg }}
                />
              ) : (
                <div className="text-center p-3 text-slate-500 text-[11px]">
                  <FileCode className="w-6 h-6 mx-auto mb-1 opacity-50 stroke-[1.5]" />
                  <span>Click "Vectorize & Transmit" to render SVG vector here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipient Selection Dropdown */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Select Recipient Terminal Node
          </label>
          <select
            value={recipientId}
            onChange={(e) => onSelectRecipient(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {recipientUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
        </div>

        {/* Vectorization Parameters Controls */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-3 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Vectorization Engine Configuration
            </span>
          </div>

          {/* Color Precision Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Color Precision</span>
              <span className="font-mono text-cyan-400 font-bold">
                {config.colorPrecision} bits ({Math.pow(2, config.colorPrecision)} colors)
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={config.colorPrecision}
              onChange={(e) =>
                onChangeConfig({ ...config, colorPrecision: Number(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Speckle Noise Filter & Curve Mode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-300 block mb-1">
                Speckle Noise Filter
              </label>
              <select
                value={config.filterSpeckle}
                onChange={(e) =>
                  onChangeConfig({ ...config, filterSpeckle: Number(e.target.value) })
                }
                className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg p-1.5"
              >
                <option value={0}>0px (All detail)</option>
                <option value={4}>4px (Standard)</option>
                <option value={12}>12px (High denoise)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-300 block mb-1">Curve Fitting</label>
              <select
                value={config.mode}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    mode: e.target.value as VectorizerConfig['mode'],
                  })
                }
                className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg p-1.5"
              >
                <option value="spline">Spline (Smooth Bezier)</option>
                <option value="polygon">Polygon (Crisp Rects)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transmit Action Button */}
      <button
        onClick={onTransmit}
        disabled={!originalImage || loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/60 cursor-pointer disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Vectorizing & Transmitting Payload...</span>
          </div>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Vectorize & Transmit to Recipient</span>
          </>
        )}
      </button>

      {sentSuccess && (
        <div className="mt-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-2 rounded-lg flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Vector payload saved & transmitted to recipient!
        </div>
      )}
    </section>
  );
};

