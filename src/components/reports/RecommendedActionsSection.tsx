import React from 'react';
import type { Project, RecommendedAction } from '../../types';

interface RecommendedActionsSectionProps {
  project: Project;
  actions: RecommendedAction[];
}

export const RecommendedActionsSection: React.FC<RecommendedActionsSectionProps> = ({ project, actions }) => {
  const projectActions = actions.filter(a => a.projectId === project.id);

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          8. Recommended Actions
        </h2>
      </div>

      {projectActions.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-4 text-center text-xs text-slate-600 rounded font-medium">
          No prescriptive actions assigned for this project.
        </div>
      ) : (
        <div className="border border-slate-300 rounded overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-[10px] uppercase border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300">Action Title</th>
                <th className="p-2 border-r border-slate-300 w-20 text-center">Priority</th>
                <th className="p-2 border-r border-slate-300">Reason / Rationale</th>
                <th className="p-2 border-r border-slate-300">Assigned To</th>
                <th className="p-2 border-r border-slate-300 w-24 font-mono text-center">Due Date</th>
                <th className="p-2 w-20 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {projectActions.map((act) => (
                <tr key={act.id} className="border-b border-slate-200 text-slate-900 last:border-none">
                  <td className="p-2 font-bold border-r border-slate-200">{act.title}</td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      act.priority === 'Urgent' ? 'bg-red-100 text-red-900 border border-red-300' :
                      act.priority === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {act.priority}
                    </span>
                  </td>
                  <td className="p-2 text-slate-700 border-r border-slate-200 text-[11px]">
                    {act.rationale || act.reason}
                  </td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                    {act.assignedTo} ({act.assignedRole})
                  </td>
                  <td className="p-2 font-mono text-center border-r border-slate-200 text-[11px]">
                    {act.targetResolutionDate}
                  </td>
                  <td className="p-2 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      act.status === 'Completed' || act.status === 'Executed' 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                        : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    }`}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
