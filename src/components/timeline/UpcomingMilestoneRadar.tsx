import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import type { Project, Milestone } from '../../types';
import { detectUpcomingMilestones } from '../../services/scheduleIntelligenceService';

interface UpcomingMilestoneRadarProps {
  project: Project;
  onSelectMilestone: (milestone: Milestone) => void;
}

export const UpcomingMilestoneRadar: React.FC<UpcomingMilestoneRadarProps> = ({
  project,
  onSelectMilestone,
}) => {
  const radar = detectUpcomingMilestones(project);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            UPCOMING MILESTONE RADAR
          </h4>
        </div>
        <span className="font-mono text-[10px] text-slate-400">URGENCY HORIZON</span>
      </div>

      <div className="space-y-4 font-sans text-xs">
        {/* Next 7 Days */}
        <div>
          <span className="block font-mono text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" /> NEXT 7 DAYS ({radar.next7Days.length})
          </span>
          {radar.next7Days.length === 0 ? (
            <p className="text-slate-500 text-[11px] font-mono italic">No critical milestone deadlines in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {radar.next7Days.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMilestone(m)}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 flex items-center justify-between hover:bg-rose-950/40 cursor-pointer transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{m.name}</h5>
                    <span className="font-mono text-[10px] text-rose-300">
                      Target: {m.plannedEndDate || m.expectedDate}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-rose-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next 30 Days */}
        <div>
          <span className="block font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
            NEXT 30 DAYS ({radar.next30Days.length})
          </span>
          {radar.next30Days.length === 0 ? (
            <p className="text-slate-500 text-[11px] font-mono italic">No milestone deadlines in the next 30 days.</p>
          ) : (
            <div className="space-y-2">
              {radar.next30Days.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMilestone(m)}
                  className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between hover:bg-amber-950/40 cursor-pointer transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{m.name}</h5>
                    <span className="font-mono text-[10px] text-amber-300">
                      Target: {m.plannedEndDate || m.expectedDate}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Later */}
        <div>
          <span className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            FUTURE MILESTONES ({radar.later.length})
          </span>
          {radar.later.length > 0 && (
            <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-400">
              {radar.later.length} milestone(s) scheduled for later execution periods.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
