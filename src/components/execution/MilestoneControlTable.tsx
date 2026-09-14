import React from 'react';
import type { Milestone } from '../../types';
import { Calendar, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

interface MilestoneControlTableProps {
  milestones: Milestone[];
  projectId: string;
}

export const MilestoneControlTable: React.FC<MilestoneControlTableProps> = ({ milestones, projectId }) => {
  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>MILESTONE CONTROL</span>
          </h3>
          <p className="text-xs text-slate-400">Critical phase milestones & execution status</p>
        </div>

        <a
          href={`#/projects/${projectId}/milestones`}
          className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition"
        >
          VIEW FULL TIMELINE →
        </a>
      </div>

      <div className="table-scroll-container">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
              <th className="py-2 px-3">Milestone</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Progress</th>
              <th className="py-2 px-3">Planned Date</th>
              <th className="py-2 px-3">Actual / Expected</th>
              <th className="py-2 px-3">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {milestones.map((m) => {
              const isDelayed = m.status === 'Delayed';
              const isCompleted = m.status === 'Completed';

              return (
                <tr 
                  key={m.id}
                  className={`hover:bg-slate-800/40 transition ${
                    isDelayed ? 'bg-red-500/05' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-extrabold text-white">
                    {m.name}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isDelayed
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      {isDelayed && <AlertOctagon className="w-3 h-3" />}
                      {!isCompleted && !isDelayed && <Clock className="w-3 h-3" />}
                      <span>{m.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${isCompleted ? 'bg-emerald-400' : isDelayed ? 'bg-red-400' : 'bg-cyan-400'}`}
                        style={{ width: `${m.progressPercentage ?? m.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                      {m.progressPercentage ?? m.progress ?? 0}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {m.plannedEndDate || m.expectedDate || '2025-12-31'}
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {m.actualDate || m.actualEndDate || m.expectedDate || 'Pending'}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.risk === 'High' || m.risk === 'Critical' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {m.risk || 'Normal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
