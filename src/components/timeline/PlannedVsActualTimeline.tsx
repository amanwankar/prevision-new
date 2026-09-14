import React from 'react';
import { Calendar } from 'lucide-react';
import type { Project } from '../../types';
import { calculateTimelineVariance } from '../../services/scheduleIntelligenceService';

interface PlannedVsActualTimelineProps {
  project: Project;
}

export const PlannedVsActualTimeline: React.FC<PlannedVsActualTimelineProps> = ({ project }) => {
  const variance = calculateTimelineVariance(project);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            PLANNED VS ACTUAL TIMELINE COMPARISON
          </h4>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border uppercase ${
            variance.isExtended
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {variance.formattedVariance}
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Planned Target Line */}
        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-slate-400 font-semibold">ORIGINAL PLANNED TARGET:</span>
          </div>
          <span className="font-bold text-white">{variance.originalTargetDate}</span>
        </div>

        {/* Revised Target Line */}
        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-semibold">REVISED TARGET DATE:</span>
          </div>
          <span className="font-bold text-cyan-300">{variance.revisedTargetDate}</span>
        </div>

        {/* Expected Completion Line */}
        <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-purple-300 font-bold">CURRENT EXPECTED COMPLETION:</span>
          </div>
          <span className="font-bold text-purple-300">{variance.expectedCompletionDate}</span>
        </div>
      </div>
    </div>
  );
};
