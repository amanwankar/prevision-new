import React from 'react';
import type { ControlLoopStage } from '../../services/executionIntelligenceService';

interface ExecutionControlLoopProps {
  currentStage: ControlLoopStage;
}

const STAGES: { stage: ControlLoopStage; label: string; description: string }[] = [
  { stage: 'PLAN', label: 'PLAN', description: 'Baseline target & sanctioned budget' },
  { stage: 'EXECUTE', label: 'EXECUTE', description: 'On-site physical construction' },
  { stage: 'MEASURE', label: 'MEASURE', description: 'Field sensor & telemetry data' },
  { stage: 'DEVIATION', label: 'DEVIATION', description: 'Physical progress vs target gap' },
  { stage: 'RISK', label: 'RISK', description: 'AI Risk Engine prediction' },
  { stage: 'WARNING', label: 'WARNING', description: 'Automated early warning alert' },
  { stage: 'ACTION', label: 'ACTION', description: 'Officer mitigation protocol' },
  { stage: 'REASSESS', label: 'REASSESS', description: 'Post-intervention feedback' }
];

export const ExecutionControlLoop: React.FC<ExecutionControlLoopProps> = ({ currentStage }) => {
  const activeIndex = STAGES.findIndex(s => s.stage === currentStage);

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-5 shadow-2xl space-y-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-black text-cyan-400 tracking-widest uppercase flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>PRAEVISIO EXECUTION CONTROL LOOP</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Continuous telemetry feedback & predictive risk cycle</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
          CURRENT STATE: {currentStage}
        </div>
      </div>

      {/* Control Loop Sequence Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 relative">
        {STAGES.map((s, idx) => {
          const isActive = s.stage === currentStage;
          const isPast = idx < activeIndex;

          return (
            <div
              key={s.stage}
              className={`p-3 rounded-xl border text-center transition-all duration-300 relative ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-500/20 to-teal-600/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105 z-10'
                  : isPast
                  ? 'bg-slate-950/60 border-slate-700/80 text-slate-300'
                  : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
              }`}
            >
              {/* Animated pulse indicator for active stage */}
              {isActive && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              )}

              <div className="text-[9px] font-mono font-bold text-slate-500 mb-1">0{idx + 1}</div>
              <div className={`text-xs font-extrabold font-mono tracking-wider ${isActive ? 'text-cyan-300 glow-text-cyan' : isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                {s.label}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {s.description}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
