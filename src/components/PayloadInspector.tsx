import React, { useState } from 'react';
import { FileCode, Copy, Download, Check, Layers, Code, Hash } from 'lucide-react';
import { TransmissionStats } from '../types';

interface PayloadInspectorProps {
  svgContent: string;
  stats: TransmissionStats;
  colorPalette: string[];
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  svgContent,
  stats,
  colorPalette,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'xml' | 'layers' | 'hex'>('xml');

  const handleCopy = () => {
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transmitted_vector_payload_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert first 128 characters to Hex Byte Stream string for technical display
  const hexPreview = Array.from(svgContent.slice(0, 200))
    .map((ch: string) => ch.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col h-full space-y-3">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Transmitted SVG Payload Code</span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-emerald-400 rounded-md">
            {(stats.svgSizeBytes / 1024).toFixed(2)} KB
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('xml')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                viewMode === 'xml' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" /> SVG XML
            </button>
            <button
              onClick={() => setViewMode('layers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                viewMode === 'layers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3 inline mr-1" /> Layers ({colorPalette.length})
            </button>
            <button
              onClick={() => setViewMode('hex')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                viewMode === 'hex' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash className="w-3 h-3 inline mr-1" /> Hex Stream
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Copy SVG to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </button>
        </div>
      </div>

      {/* Content Inspector Body */}
      {viewMode === 'xml' && (
        <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] font-mono text-emerald-400 overflow-auto max-h-80 leading-relaxed">
          {svgContent}
        </pre>
      )}

      {viewMode === 'layers' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">Color Quantization Layer Breakdown:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {colorPalette.map((color, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-2.5"
              >
                <div
                  className="w-6 h-6 rounded-md border border-slate-700 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <div className="text-[11px] font-mono font-bold text-slate-200">{color}</div>
                  <div className="text-[10px] text-slate-400">Layer #{idx + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'hex' && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-mono">Binary Stream Header (First 200 Bytes):</div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] font-mono text-sky-300 break-all leading-loose">
            {hexPreview}
          </div>
        </div>
      )}
    </div>
  );
};
