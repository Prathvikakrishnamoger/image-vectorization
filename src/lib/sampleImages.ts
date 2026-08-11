import { PresetSample } from '../types';

// Helper to convert SVG string to Base64 data URL
function svgToDataUrl(svgString: string): string {
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const SAMPLE_PRESETS: PresetSample[] = [
  {
    id: 'tech-logo',
    name: 'Quantum Core Logo',
    category: 'Logo',
    description: 'High-contrast tech logo with bold geometric shapes and gradient accents.',
    recommendedPrecision: 6,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#0f172a"/>
        <circle cx="300" cy="300" r="220" fill="none" stroke="#06b6d4" stroke-width="12"/>
        <circle cx="300" cy="300" r="160" fill="none" stroke="#3b82f6" stroke-width="8" stroke-dasharray="20 10"/>
        <polygon points="300,140 430,370 170,370" fill="#0284c7" opacity="0.85"/>
        <polygon points="300,460 170,230 430,230" fill="#38bdf8" opacity="0.85"/>
        <circle cx="300" cy="300" r="45" fill="#f43f5e"/>
        <circle cx="300" cy="300" r="20" fill="#ffffff"/>
        <text x="300" y="550" font-family="sans-serif" font-weight="900" font-size="28" fill="#e2e8f0" text-anchor="middle" letter-spacing="4">QUANTUM CORE</text>
      </svg>
    `),
  },
  {
    id: 'circuit-diagram',
    name: 'Processor Chip Schematic',
    category: 'Schematic',
    description: 'Microprocessor architectural layout with circuit traces and IC nodes.',
    recommendedPrecision: 5,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#022c22"/>
        <rect x="150" y="150" width="300" height="300" rx="20" fill="#064e3b" stroke="#10b981" stroke-width="6"/>
        <rect x="220" y="220" width="160" height="160" rx="10" fill="#047857" stroke="#34d399" stroke-width="4"/>
        <path d="M50,180 H150 M50,220 H150 M50,260 H150 M50,340 H150 M50,380 H150 M50,420 H150" stroke="#10b981" stroke-width="6"/>
        <path d="M450,180 H550 M450,220 H550 M450,260 H550 M450,340 H550 M450,380 H550 M450,420 H550" stroke="#10b981" stroke-width="6"/>
        <path d="M180,50 V150 M220,50 V150 M260,50 V150 M340,50 V150 M380,50 V150 M420,50 V150" stroke="#10b981" stroke-width="6"/>
        <path d="M180,450 V550 M220,450 V550 M260,450 V550 M340,450 V550 M380,450 V550 M420,450 V550" stroke="#10b981" stroke-width="6"/>
        <circle cx="250" cy="250" r="12" fill="#f59e0b"/>
        <circle cx="350" cy="250" r="12" fill="#f59e0b"/>
        <circle cx="250" cy="350" r="12" fill="#f59e0b"/>
        <circle cx="350" cy="350" r="12" fill="#f59e0b"/>
        <text x="300" y="305" font-family="monospace" font-weight="bold" font-size="20" fill="#a7f3d0" text-anchor="middle">ARM-V9 SYSTEM</text>
      </svg>
    `),
  },
  {
    id: 'line-art-gear',
    name: 'Mechanical System Blueprint',
    category: 'Line Art',
    description: 'Precision engineering gear assembly with dimensions and vector contours.',
    recommendedPrecision: 4,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#1e293b"/>
        <g stroke="#94a3b8" stroke-width="3" fill="none">
          <circle cx="300" cy="280" r="180"/>
          <circle cx="300" cy="280" r="130" stroke-dasharray="8 6"/>
          <circle cx="300" cy="280" r="80"/>
          <circle cx="300" cy="280" r="30" fill="#334155"/>
          <path d="M300,60 V500 M80,280 H520 M144,124 L456,436 M144,436 L456,124" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
          <!-- Gear teeth -->
          <rect x="280" y="80" width="40" height="40" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="280" y="440" width="40" height="40" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="80" y="260" width="40" height="40" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="440" y="260" width="40" height="40" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
        </g>
        <text x="300" y="550" font-family="sans-serif" font-size="18" fill="#38bdf8" text-anchor="middle">CAD MECHANICAL SCHEMATIC - 1:1 SCALE</text>
      </svg>
    `),
  },
  {
    id: 'network-topology',
    name: 'Satellite Relay Network',
    category: 'Technical Diagram',
    description: 'Global communications satellite relay nodes and telemetry connections.',
    recommendedPrecision: 6,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#090d16"/>
        <circle cx="300" cy="300" r="240" fill="#1e1b4b" opacity="0.5"/>
        <circle cx="300" cy="300" r="140" fill="#312e81"/>
        <path d="M300,60 L480,200 L420,440 L180,440 L120,200 Z" stroke="#818cf8" stroke-width="3" fill="none" stroke-dasharray="10 5"/>
        <circle cx="300" cy="60" r="22" fill="#6366f1"/>
        <circle cx="480" cy="200" r="22" fill="#6366f1"/>
        <circle cx="420" cy="440" r="22" fill="#6366f1"/>
        <circle cx="180" cy="440" r="22" fill="#6366f1"/>
        <circle cx="120" cy="200" r="22" fill="#6366f1"/>
        <circle cx="300" cy="300" r="35" fill="#a855f7"/>
        <text x="300" y="306" font-family="sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">HUB</text>
        <text x="300" y="530" font-family="sans-serif" font-size="18" fill="#c084fc" text-anchor="middle">SATELLITE MESH NODE TELEMETRY</text>
      </svg>
    `),
  },
];
