import React from 'react';
import { X, ShieldAlert, ArrowUpRight, Lightbulb, Edit } from 'lucide-react';
import type { Milestone, Project } from '../../types';

interface MilestoneDetailDrawerProps {
  milestone: Milestone | null;
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEditMilestone?: (milestone: Milestone) => void;
  onNavigateAlert?: () => void;
  onNavigateAction?: () => void;
}

export const MilestoneDetailDrawer: React.FC<MilestoneDetailDrawerProps> = ({
  milestone,
  project,
  isOpen,
  onClose,
  onEditMilestone,
  onNavigateAlert,
  onNavigateAction,
}) => {
  if (!isOpen || !milestone) return null;

  const isDelayed = milestone.status === 'Delayed';
  const isCompleted = milestone.status === 'Completed';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-cyan-500/30 p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              MILESTONE INTELLIGENCE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border uppercase ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isDelayed
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {milestone.status}
            </span>
            {project && (
              <span className="font-mono text-xs text-slate-400">
                {project.code}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{milestone.name}</h3>
          {milestone.description && (
            <p className="text-xs text-slate-300 leading-relaxed">{milestone.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 uppercase">PHYSICAL PROGRESS</span>
            <span className="text-cyan-300 font-bold">{milestone.progressPercentage ?? milestone.progress ?? 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-400' : isDelayed ? 'bg-rose-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${milestone.progressPercentage ?? milestone.progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">PLANNED TARGET</span>
            <span className="font-bold text-white">{milestone.plannedEndDate || milestone.expectedDate || 'Unset'}</span>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">ACTUAL / REVISED</span>
            <span className="font-bold text-cyan-300">{milestone.actualDate || milestone.actualEndDate || 'Pending'}</span>
          </div>
        </div>

        {/* Schedule Signal */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
            SCHEDULE SIGNAL ANALYSIS
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {isCompleted
              ? 'Milestone target achieved. Verified and logged in project telemetry.'
              : isDelayed
              ? 'Milestone has exceeded its planned completion date. Review bottleneck justifications.'
              : 'Milestone is currently executing within expected parameter boundaries.'}
          </p>
        </div>

        {/* Related Systems Links */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] text-slate-400 uppercase font-bold block">
            RELATED SYSTEM CONNECTIONS
          </span>

          {onNavigateAlert && (
            <button
              onClick={onNavigateAlert}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-mono font-bold transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                RELATED EARLY WARNING ALERT
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}

          {onNavigateAction && (
            <button
              onClick={onNavigateAction}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono font-bold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-cyan-400" />
                RECOMMENDED OPERATIONAL RESPONSE
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Action */}
      {onEditMilestone && (
        <div className="pt-4 border-t border-slate-800 mt-6">
          <button
            onClick={() => onEditMilestone(milestone)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 text-black font-mono text-xs font-extrabold hover:bg-cyan-400 transition-colors shadow-lg cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            EDIT MILESTONE DATA
          </button>
        </div>
      )}
    </div>
  );
};
