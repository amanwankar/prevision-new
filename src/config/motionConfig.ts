// Motion Engine Configuration & Design Tokens for PRAEVISIO Platform

export interface AIStateConfig {
  label: string;
  colorClass: string;
  glowClass: string;
  speedMultiplier: number;
  scanLine: boolean;
  orbitCount: number;
  accentHex: string;
}

export const AI_STATES: Record<string, AIStateConfig> = {
  IDLE: {
    label: 'READY',
    colorClass: 'text-cyan-400 border-cyan-400/80',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    speedMultiplier: 1,
    scanLine: false,
    orbitCount: 2,
    accentHex: '#06b6d4'
  },
  PROCESSING: {
    label: 'PROCESSING',
    colorClass: 'text-teal-300 border-teal-400',
    glowClass: 'shadow-[0_0_25px_rgba(20,184,166,0.6)]',
    speedMultiplier: 2.2,
    scanLine: true,
    orbitCount: 3,
    accentHex: '#14b8a6'
  },
  ANALYZING: {
    label: 'ANALYZING',
    colorClass: 'text-blue-400 border-blue-400',
    glowClass: 'shadow-[0_0_30px_rgba(59,130,246,0.7)]',
    speedMultiplier: 2.8,
    scanLine: true,
    orbitCount: 3,
    accentHex: '#3b82f6'
  },
  PREDICTING: {
    label: 'PREDICTING',
    colorClass: 'text-purple-400 border-purple-400',
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.7)]',
    speedMultiplier: 3.2,
    scanLine: true,
    orbitCount: 4,
    accentHex: '#a855f7'
  },
  EXPLAINING: {
    label: 'EXPLAINING',
    colorClass: 'text-indigo-300 border-indigo-400',
    glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.6)]',
    speedMultiplier: 1.8,
    scanLine: false,
    orbitCount: 3,
    accentHex: '#6366f1'
  },
  WARNING: {
    label: 'RISK SIGNAL',
    colorClass: 'text-amber-400 border-amber-400',
    glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
    speedMultiplier: 2.5,
    scanLine: true,
    orbitCount: 3,
    accentHex: '#f59e0b'
  },
  CRITICAL: {
    label: 'CRITICAL WARNING',
    colorClass: 'text-rose-500 border-rose-500',
    glowClass: 'shadow-[0_0_35px_rgba(244,63,94,0.8)]',
    speedMultiplier: 3.5,
    scanLine: true,
    orbitCount: 4,
    accentHex: '#f43f5e'
  },
  COMPLETE: {
    label: 'COMPLETE',
    colorClass: 'text-emerald-400 border-emerald-400',
    glowClass: 'shadow-[0_0_25px_rgba(52,211,153,0.6)]',
    speedMultiplier: 1,
    scanLine: false,
    orbitCount: 2,
    accentHex: '#34d399'
  }
};

export const TELEMETRY_METRICS = {
  systemStatus: 'OPERATIONAL',
  projectsMonitored: 128,
  activeRiskSignals: 17,
  lastAnalysis: '02:14 AGO',
  aiAccuracyRate: '94.2%',
  telemetrySource: 'MoSPI National Data Stream'
};

export const PARALLAX_RATES = {
  background: 0.02,
  grid: 0.04,
  network: 0.06,
  particles: 0.08,
  lightBeams: 0.1,
  aiCore: 0.03
};
