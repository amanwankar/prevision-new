import React from 'react';
import type { Project } from '../../types';
import { getExecutionIntelligence } from '../../services/executionIntelligenceService';
import { Activity, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface ExecutionPreviewCardProps {
  project: Project;
  onOpenFullControlCenter?: () => void;
}

export const ExecutionPreviewCard: React.FC<ExecutionPreviewCardProps> = ({
  project,
  onOpenFullControlCenter
}) => {
  const intel = getExecutionIntelligence(project);

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'HEALTHY': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'WATCH': return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
      case 'HIGH RISK': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'CRITICAL': return 'text-red-400 border-red-500/40 bg-red-500/10';
      default: return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-5 shadow-2xl space-y-4 hover:border-cyan-400/60 transition group">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>EXECUTION INTELLIGENCE CONTROL</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Live physical & financial execution signals</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onOpenFullControlCenter) onOpenFullControlCenter();
            else window.location.hash = `#/projects/${project.id}/execution`;
          }}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition flex items-center space-x-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <span>CONTROL CENTER</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Execution Health</span>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(intel.overallHealthState)}`}>
            {intel.overallHealthState}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Progress Gap</span>
          <span className={`text-sm font-extrabold block mt-0.5 ${intel.scorecard.progressGap < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {intel.scorecard.progressGap > 0 ? '+' : ''}{intel.scorecard.progressGap}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Schedule Status</span>
          <span className="text-sm font-extrabold text-white block mt-0.5 truncate">
            {intel.dimensions.schedule.state}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Financial Status</span>
          <span className="text-sm font-extrabold text-white block mt-0.5 truncate">
            {intel.dimensions.financial.state}
          </span>
        </div>

      </div>

      {/* Primary Execution Signal */}
      {intel.executionSignals.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-mono truncate">{intel.executionSignals[0].title}: {intel.executionSignals[0].explanation}</span>
          </div>
        </div>
      )}

    </div>
  );
};
