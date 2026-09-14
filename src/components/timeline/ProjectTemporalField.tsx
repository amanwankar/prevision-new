import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, Sparkles, Flag } from 'lucide-react';
import type { Project, Milestone } from '../../types';

interface ProjectTemporalFieldProps {
  project: Project;
  milestones: Milestone[];
  onSelectMilestone: (milestone: Milestone) => void;
  selectedMilestoneId?: string;
}

export const ProjectTemporalField: React.FC<ProjectTemporalFieldProps> = ({
  project,
  milestones,
  onSelectMilestone,
  selectedMilestoneId,
}) => {
  const actualProg = project.actualPhysicalProgress ?? 55;
  const targetProg = project.targetPhysicalProgress ?? 70;

  const getMilestoneStyle = (m: Milestone) => {
    if (m.status === 'Completed') {
      return {
        bg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
      };
    }
    if (m.status === 'Delayed') {
      return {
        bg: 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: AlertOctagon,
        iconColor: 'text-rose-400',
      };
    }
    if (m.status === 'In Progress') {
      return {
        bg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        icon: Clock,
        iconColor: 'text-cyan-400',
      };
    }
    return {
      bg: 'bg-slate-900 border-slate-700 text-slate-400',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Flag,
      iconColor: 'text-slate-500',
    };
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/70 p-6 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Ambient glowing atmosphere */}
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              PROJECT TEMPORAL EXECUTION FIELD
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            {project.name} • Timeline Canvas
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="text-slate-300">ACTUAL: {actualProg}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="text-slate-400">TARGET: {targetProg}%</span>
          </div>
        </div>
      </div>

      {/* Main Temporal Line Track */}
      <div className="relative py-8 overflow-x-auto no-scrollbar">
        {/* Background Target Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 -translate-y-1/2 bg-slate-800 rounded-full" />

        {/* Animated Actual Progress Line */}
        <div
          className="absolute top-1/2 left-8 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
          style={{ width: `${Math.max(10, Math.min(92, actualProg))}%` }}
        />

        {/* Current Execution Position Pulse Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-1000"
          style={{ left: `${Math.max(10, Math.min(92, actualProg))}%` }}
        >
          <div className="h-5 w-5 rounded-full bg-cyan-400 border-2 border-black shadow-[0_0_16px_#22d3ee] animate-ping" />
          <div className="absolute -top-7 px-2 py-0.5 rounded bg-cyan-500 text-black font-mono text-[9px] font-extrabold whitespace-nowrap shadow-lg">
            CURRENT: {actualProg}%
          </div>
        </div>

        {/* Milestone Nodes Sequence */}
        <div className="relative flex items-center justify-between min-w-[750px] px-4">
          {milestones.map((m, idx) => {
            const style = getMilestoneStyle(m);
            const Icon = style.icon;
            const isSelected = m.id === selectedMilestoneId;

            return (
              <div
                key={m.id || idx}
                onClick={() => onSelectMilestone(m)}
                className="flex flex-col items-center group relative z-10 cursor-pointer"
              >
                {/* Node Box */}
                <div
                  className={`relative flex items-center justify-center h-12 w-12 rounded-2xl border transition-all duration-300 ${style.bg} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-115' : 'hover:scale-105'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${style.iconColor}`} />
                </div>

                {/* Milestone Info */}
                <div className="mt-3 text-center max-w-[130px]">
                  <span
                    className={`block font-mono text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'Completed'
                        ? 'text-emerald-300'
                        : m.status === 'Delayed'
                        ? 'text-rose-300'
                        : 'text-cyan-300'
                    }`}
                  >
                    {m.status}
                  </span>
                  <h5 className="text-xs font-bold text-white leading-tight truncate" title={m.name}>
                    {m.name}
                  </h5>
                  <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                    {m.plannedEndDate || m.expectedDate || 'Target Unset'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Instructions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> COMPLETED
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> IN PROGRESS
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" /> DELAYED / AT RISK
          </span>
        </div>
        <span className="text-slate-500">CLICK ANY MILESTONE NODE TO INSPECT DETAILED SCHEDULE SIGNALS</span>
      </div>
    </div>
  );
};
