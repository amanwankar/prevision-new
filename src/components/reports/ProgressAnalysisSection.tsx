import React from 'react';
import type { Project } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ProgressAnalysisSectionProps {
  project: Project;
}

export const ProgressAnalysisSection: React.FC<ProgressAnalysisSectionProps> = ({ project }) => {
  const planned = project.targetPhysicalProgress;
  const actual = project.actualPhysicalProgress;
  const gap = Number((planned - actual).toFixed(1));
  const isBehind = gap > 0;

  const data = [
    { name: 'Physical Progress (%)', Planned: planned, Actual: actual }
  ];

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          3. Progress Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        
        {/* Left Stats Cards */}
        <div className="space-y-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Planned Progress</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{planned}%</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Actual Progress</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{actual}%</div>
          </div>

          <div className={`p-2.5 rounded border ${isBehind ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-300'}`}>
            <div className="text-[10px] font-bold text-slate-600 uppercase">Progress Gap</div>
            <div className={`text-sm font-black mt-0.5 ${isBehind ? 'text-amber-800 font-bold' : 'text-emerald-800'}`}>
              {isBehind ? `-${gap}% (Behind Target)` : `+${Math.abs(gap)}% (Ahead of Target)`}
            </div>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded p-3 text-xs">
          <div className="text-[11px] font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
            Planned vs Actual Physical Progress Breakdown
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis type="number" domain={[0, 100]} stroke="#475569" />
                <YAxis type="category" dataKey="name" stroke="#475569" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="Planned" fill="#0284c7" name="Planned Target (%)" radius={[0, 4, 4, 0]} barSize={24} />
                <Bar dataKey="Actual" fill="#0d9488" name="Actual Physical (%)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Explanation text */}
      {isBehind && (
        <div className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded border border-slate-200">
          <span className="font-bold text-slate-900">Progress Assessment: </span>
          Actual progress is currently below planned progress by {gap}%. Accelerating work packages for critical milestones is required to prevent further timeline expansion.
        </div>
      )}
    </section>
  );
};
