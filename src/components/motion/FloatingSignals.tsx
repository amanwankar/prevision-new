import React from 'react';

interface SignalItem {
  id: string;
  label: string;
  dotColor: string;
  positionClass: string;
  delayMs: number;
}

const SIGNALS: SignalItem[] = [
  { id: '1', label: 'PROJECT DATA', dotColor: 'bg-cyan-400', positionClass: '-top-6 -left-12 sm:-top-8 sm:-left-24', delayMs: 0 },
  { id: '2', label: 'RISK SIGNAL', dotColor: 'bg-amber-400', positionClass: '-top-6 -right-12 sm:-top-8 sm:-right-24', delayMs: 1200 },
  { id: '3', label: 'PREDICTIVE MODEL', dotColor: 'bg-purple-400', positionClass: 'top-1/2 -left-20 sm:-left-36 -translate-y-1/2', delayMs: 2400 },
  { id: '4', label: 'MILESTONE VARIANCE', dotColor: 'bg-indigo-400', positionClass: 'top-1/2 -right-20 sm:-right-36 -translate-y-1/2', delayMs: 3600 },
  { id: '5', label: 'EARLY WARNING', dotColor: 'bg-emerald-400', positionClass: '-bottom-6 left-1/2 -translate-x-1/2', delayMs: 4800 }
];

export const FloatingSignals: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
      {SIGNALS.map((sig) => (
        <div
          key={sig.id}
          className={`absolute ${sig.positionClass} transition-all duration-700 ease-out`}
          style={{ animation: `floatingSignal 8s ease-in-out infinite ${sig.delayMs}ms` }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/90 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
            <span className={`w-2 h-2 rounded-full ${sig.dotColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
            <span>{sig.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
