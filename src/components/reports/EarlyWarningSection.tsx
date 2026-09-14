import React from 'react';
import type { Project, EarlyWarning } from '../../types';

interface EarlyWarningSectionProps {
  project: Project;
  alerts: EarlyWarning[];
}

export const EarlyWarningSection: React.FC<EarlyWarningSectionProps> = ({ project, alerts }) => {
  const projectAlerts = alerts.filter(a => a.projectId === project.id);

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          7. Early Warning Report
        </h2>
      </div>

      {projectAlerts.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 p-4 text-center text-xs text-slate-600 rounded font-medium">
          No early warnings recorded for this project.
        </div>
      ) : (
        <div className="border border-slate-300 rounded overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-[10px] uppercase border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300">Warning Title</th>
                <th className="p-2 border-r border-slate-300 w-20 text-center">Severity</th>
                <th className="p-2 border-r border-slate-300 w-20 text-center">Risk Score</th>
                <th className="p-2 border-r border-slate-300 w-28 font-mono">Generated</th>
                <th className="p-2 border-r border-slate-300 w-24 text-center">Status</th>
                <th className="p-2">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {projectAlerts.map((alt) => (
                <tr key={alt.id} className="border-b border-slate-200 text-slate-900 last:border-none">
                  <td className="p-2 font-bold border-r border-slate-200">
                    <div>{alt.title}</div>
                    <div className="text-[10px] font-normal text-slate-600 mt-0.5">{alt.description}</div>
                  </td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      alt.severity === 'Critical' || alt.severity === 'High' ? 'bg-red-100 text-red-900 border border-red-300' :
                      'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {alt.severity}
                    </span>
                  </td>
                  <td className="p-2 font-mono font-bold text-center border-r border-slate-200">
                    {alt.riskScore || project.riskScore}
                  </td>
                  <td className="p-2 font-mono text-[11px] border-r border-slate-200 text-slate-700">
                    {alt.timestamp || alt.timeAgo}
                  </td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold">
                    <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[10px]">
                      {alt.status}
                    </span>
                  </td>
                  <td className="p-2 text-slate-800 font-medium">{alt.assignedOfficer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
