import React from 'react';
import { Database, BarChart2, Cpu, Zap, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DataFlowStreamProps {
  isAnalyzing: boolean;
}

const STAGES = [
  { id: '1', label: 'PROJECT DATA', icon: Database, color: 'text-cyan-400', border: 'border-cyan-500/40' },
  { id: '2', label: 'ANALYTICS', icon: BarChart2, color: 'text-blue-400', border: 'border-blue-500/40' },
  { id: '3', label: 'RISK ENGINE', icon: Cpu, color: 'text-purple-400', border: 'border-purple-500/40' },
  { id: '4', label: 'EXPLANATION', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/40' },
  { id: '5', label: 'EARLY WARNING', icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-500/40' },
  { id: '6', label: 'ACTION', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/40' }
];

export const DataFlowStream: React.FC<DataFlowStreamProps> = ({ isAnalyzing }) => {
  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm font-mono text-xs">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
        <span>PRAEVISIO TELEMETRY PIPELINE STREAM</span>
        <span className="text-cyan-400 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DATA FLOW ACTIVE</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto py-1">
        {STAGES.map((stg, idx) => (
          <React.Fragment key={stg.id}>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/80 border ${stg.border} transition-all duration-300 ${
              isAnalyzing ? 'animate-pulse scale-105 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : ''
            }`}>
              <stg.icon className={`w-3.5 h-3.5 ${stg.color}`} />
              <span className="font-bold text-slate-200">{stg.label}</span>
            </div>

            {idx < STAGES.length - 1 && (
              <span className={`text-slate-600 font-bold ${isAnalyzing ? 'text-cyan-400 animate-pulse' : ''}`}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
