import React from 'react';
import { Inbox, Send, ArrowRight, Trash2, Clock, User, ShieldCheck, Sparkles, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { SavedTransmission, User as UserType } from '../types';

interface TransmissionsInboxProps {
  transmissions: SavedTransmission[];
  currentUser: UserType | null;
  onSelectTransmission: (tx: SavedTransmission) => void;
  onDeleteTransmission: (id: string) => void;
  onOpenViewer?: (tx: SavedTransmission) => void;
  selectedTxId?: string | null;
}

export const TransmissionsInbox: React.FC<TransmissionsInboxProps> = ({
  transmissions,
  currentUser,
  onSelectTransmission,
  onDeleteTransmission,
  onOpenViewer,
  selectedTxId,
}) => {
  if (!currentUser) return null;

  const received = transmissions.filter((t) => t.recipientId === currentUser.id);
  const sent = transmissions.filter((t) => t.senderId === currentUser.id);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Terminal Node Message DB & Inbox</span>
              <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full font-mono font-bold">
                {received.length} Received
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Persistent DB inbox for <span className="text-cyan-300 font-semibold">{currentUser.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Received Transmissions Section */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <Inbox className="w-3.5 h-3.5 text-cyan-400" />
          Received Vector Transmissions ({received.length})
        </div>

        {received.length === 0 ? (
          <div className="p-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No received transmissions yet for {currentUser.name}. Switch users or send a vector from another account!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {received.map((tx) => {
              const isSelected = selectedTxId === tx.id;
              const formattedTime = new Date(tx.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransmission(tx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md font-bold text-[10px] flex items-center gap-1">
                        <User className="w-3 h-3" />
                        From {tx.senderName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedTime}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center pt-1">
                      <div className="w-14 h-14 bg-slate-900 rounded-lg border border-slate-800 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={tx.result.reconstructedImageBase64}
                          alt="Reconstructed preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-slate-200 line-clamp-1">{tx.title}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">
                          Saved: {tx.result.stats.bandwidthSavedPercent}% bandwidth
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SVG: {(tx.result.stats.svgSizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransmission(tx);
                        if (onOpenViewer) onOpenViewer(tx);
                      }}
                      className="text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-1.5 px-2 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>View Reconstruction &rarr;</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransmission(tx.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Delete transmission record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sent Transmissions Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-slate-400" />
          Sent Transmissions History ({sent.length})
        </div>

        {sent.length === 0 ? (
          <div className="p-3 bg-slate-950/30 rounded-xl border border-dashed border-slate-800/60 text-center text-xs text-slate-500">
            No vector transmissions sent yet from this account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {sent.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransmission(tx)}
                className="p-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-slate-900 rounded-lg border border-slate-800 p-0.5 flex items-center justify-center shrink-0">
                    <img
                      src={tx.originalImage}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">To {tx.recipientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.result.stats.bandwidthSavedPercent}% saved ({(tx.result.stats.svgSizeBytes / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTransmission(tx.id);
                  }}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
