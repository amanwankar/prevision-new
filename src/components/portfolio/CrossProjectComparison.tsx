import React, { useState } from 'react';
import type { Project } from '../../types';
import { compareProjects } from '../../services/portfolioIntelligenceService';
import { Layers, Plus, X } from 'lucide-react';

interface CrossProjectComparisonProps {
  allProjects: Project[];
}

export const CrossProjectComparison: React.FC<CrossProjectComparisonProps> = ({ allProjects }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    allProjects.slice(0, 3).map(p => p.id)
  );

  const compResult = compareProjects(allProjects, selectedIds);

  const handleToggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(prev => prev.filter(pId => pId !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5 font-mono">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>CROSS-PROJECT COMPARISON</span>
          </h3>
          <p className="text-xs text-slate-400">Select up to 3 projects for multi-dimensional telemetry comparison</p>
        </div>

        {/* Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {allProjects.map((p) => {
            const isSelected = selectedIds.includes(p.id);

            return (
              <button
                key={p.id}
                onClick={() => handleToggleProject(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{p.code}</span>
                {isSelected ? <X className="w-3 h-3 text-cyan-400" /> : <Plus className="w-3 h-3 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-2.5 px-3">Metric Dimension</th>
              {compResult.projects.map((p) => (
                <th key={p.id} className="py-2.5 px-3 text-cyan-300 font-bold">
                  {p.name} ({p.code})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {compResult.metrics.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 text-slate-400 font-bold">{m.label}</td>
                {compResult.projects.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-white font-extrabold">
                    {m.values[p.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
