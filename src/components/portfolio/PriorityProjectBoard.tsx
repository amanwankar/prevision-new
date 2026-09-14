import React from 'react';
import type { RankedPriorityProject } from '../../services/portfolioIntelligenceService';
import type { Project } from '../../types';
import { AlertOctagon, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface PriorityProjectBoardProps {
  priorityProjects: RankedPriorityProject[];
  onSelectProject: (project: Project) => void;
  onOpenExecution: (projectId: string) => void;
}

export const PriorityProjectBoard: React.FC<PriorityProjectBoardProps> = ({
  priorityProjects,
  onSelectProject,
  onOpenExecution
}) => {
  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>PROJECTS REQUIRING ATTENTION</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">Prioritized project list derived from risk engines & schedule telemetry</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-bold">
          {priorityProjects.length} Projects Queued
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priorityProjects.map((prio) => {
          const { project } = prio;

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 cursor-pointer border border-slate-800 hover:border-cyan-500/50 transition shadow-xl space-y-3 group font-mono"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    {project.sector} • {project.department}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                    {project.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">{project.code}</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  prio.riskScore >= 75 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : prio.riskScore >= 50 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {prio.riskScore}/100 Risk
                </span>
              </div>

              {/* Attention Reason Banner */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="line-clamp-2">{prio.primaryAttentionReason}</span>
              </div>

              {/* Progress & Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-t border-slate-800/80 pt-2">
                <div>
                  <span className="text-slate-500 block">Actual Progress</span>
                  <span className="font-extrabold text-white">{prio.actualProgress}%</span>
                  <span className="text-slate-400"> (Plan: {prio.targetProgress}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Schedule Status</span>
                  <span className="font-extrabold text-white">{prio.scheduleStatus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenExecution(project.id);
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                >
                  <span>EXECUTION CONTROL →</span>
                </button>

                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
