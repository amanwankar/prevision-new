import React from 'react';
import { 
  AlertOctagon, 
  Search, 
  ShieldAlert, 
  Lightbulb, 
  UserCheck, 
  History,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface AlertActionFlowTrackerProps {
  currentStage?: 'detection' | 'warning' | 'explanation' | 'severity' | 'recommendation' | 'response' | 'audit';
  className?: string;
}

export const AlertActionFlowTracker: React.FC<AlertActionFlowTrackerProps> = ({
  currentStage = 'warning',
  className = ''
}) => {
  const steps = [
    { id: 'detection', label: 'RISK DETECTED', icon: ShieldAlert, color: 'text-red-400' },
    { id: 'warning', label: 'EARLY WARNING', icon: AlertOctagon, color: 'text-amber-400' },
    { id: 'explanation', label: 'XAI EXPLANATION', icon: Search, color: 'text-cyan-400' },
    { id: 'severity', label: 'SEVERITY TIER', icon: ShieldAlert, color: 'text-purple-400' },
    { id: 'recommendation', label: 'RECOMMENDED ACTION', icon: Lightbulb, color: 'text-yellow-400' },
    { id: 'response', label: 'OFFICER RESPONSE', icon: UserCheck, color: 'text-teal-400' },
    { id: 'audit', label: 'AUDIT TRAIL', icon: History, color: 'text-emerald-400' },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStage);

  return (
    <div className={`p-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3 font-mono text-[10px]">
        <span className="text-slate-400 font-extrabold tracking-wider uppercase flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>INTELLIGENCE WORKFLOW PIPELINE (PREDICT &rarr; EXPLAIN &rarr; ACT)</span>
        </span>
        <span className="text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
          STAGE {currentIdx >= 0 ? currentIdx + 1 : 1} OF {steps.length} ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx <= (currentIdx >= 0 ? currentIdx : 1);
          const isCurrent = step.id === currentStage;

          return (
            <div 
              key={step.id} 
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                isCurrent ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40' :
                isActive ? 'bg-slate-900/90 border-slate-700/80' :
                'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] font-mono text-slate-500 font-bold">0{idx + 1}</span>
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                )}
              </div>

              <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-slate-600'}`} />
              <span className={`text-[9px] font-mono font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
