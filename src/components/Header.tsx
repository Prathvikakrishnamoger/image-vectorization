import React from 'react';
import { Zap, Cpu, Sparkles, Layers, User as UserIcon, LogIn, Inbox, RefreshCw } from 'lucide-react';
import { PresetSample, User } from '../types';
import { SAMPLE_PRESETS } from '../lib/sampleImages';

interface HeaderProps {
  onSelectPreset: (preset: PresetSample) => void;
  geminiAvailable: boolean;
  selectedPresetId?: string;
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  receivedCount: number;
  showInbox: boolean;
  onToggleInbox: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  geminiAvailable,
  selectedPresetId,
  currentUser,
  users,
  onSelectUser,
  onOpenAuthModal,
  receivedCount,
  showInbox,
  onToggleInbox,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Brand & System Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-950/50 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base lg:text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  Vector Transmission & AI Reconstruction Engine
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-full">
                  v2.4 DB Enabled
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Sender Vectorizer Node &rarr; Ultra-Lightweight SVG Payload &rarr; Receiver AI Reconstruction
              </p>
            </div>
          </div>

          {/* User Profile & Quick Switch Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Quick Demo Accounts Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 px-2 hidden sm:inline">
                Login As:
              </span>
              {users.map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full bg-slate-800" />
                    <span>{u.name.split(' ')[0]}</span>
                  </button>
                );
              })}
              <button
                onClick={onOpenAuthModal}
                className="px-2 py-1 text-slate-400 hover:text-cyan-300 transition-colors ml-1"
                title="Open user management login"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inbox Button */}
            <button
              onClick={onToggleInbox}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showInbox
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inbox DB</span>
              {receivedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full">
                  {receivedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Config & Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sample Preset:</span>
            <select
              value={selectedPresetId || ''}
              onChange={(e) => {
                const preset = SAMPLE_PRESETS.find((p) => p.id === e.target.value);
                if (preset) onSelectPreset(preset);
              }}
              className="bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="" disabled>
                Select Demo Sample...
              </option>
              {SAMPLE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.category}: {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Status Indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800 text-[11px]">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-400">Encoder:</span>
              <span className="text-emerald-400 font-mono font-medium">VTracer JS</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] ${
                geminiAvailable
                  ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Sparkles className={`w-3 h-3 ${geminiAvailable ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-slate-400">AI Recon:</span>
              <span className="font-semibold">{geminiAvailable ? 'Gemini 3.6 AI' : 'Bilateral AI'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

