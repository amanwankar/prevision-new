import React, { useState } from 'react';
import type { Project } from '../../types';
import { calculateRiskAnalysis } from '../../services/riskEngine';
import { ArrowUpRight, Layers } from 'lucide-react';

interface ProjectComparisonToolProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export const ProjectComparisonTool: React.FC<ProjectComparisonToolProps> = ({
  projects,
  onSelectProject
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    projects[0]?.id || '',
    projects[1]?.id || '',
    projects[2]?.id || ''
  ].filter(Boolean));

  const selectedProjects = projects.filter(p => selectedIds.includes(p.id));

  const handleSlotChange = (index: number, id: string) => {
    setSelectedIds(prev => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERACTIVE COMPARISON ENGINE</span>
          </div>
          <h3 className="text-lg font-black text-white">Multi-Project Risk & Performance Benchmark</h3>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Comparing {selectedProjects.length} Selected Projects
        </div>
      </div>

      {/* Project Selector Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        {[0, 1, 2].map((slotIdx) => (
          <div key={slotIdx} className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase">
              SELECT PROJECT #{slotIdx + 1}
            </label>
            <select
              value={selectedIds[slotIdx] || ''}
              onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="">-- Choose Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        {selectedProjects.map((proj) => {
          const risk = calculateRiskAnalysis(proj);
          const gap = (proj.actualPhysicalProgress || 0) - (proj.targetPhysicalProgress || 0);

          return (
            <div 
              key={proj.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold">{proj.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    risk.riskScore >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    risk.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {risk.riskScore}/100 RISK
                  </span>
                </div>

                <div className="font-extrabold text-white text-sm font-sans truncate" title={proj.name}>
                  {proj.name}
                </div>

                <div className="text-[10px] text-slate-400">
                  {proj.department} • {proj.state}
                </div>
              </div>

              {/* Comparison Data Table */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ACTUAL PROGRESS:</span>
                  <span className="text-white font-bold">{proj.actualPhysicalProgress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TARGET PROGRESS:</span>
                  <span className="text-cyan-300 font-bold">{proj.targetPhysicalProgress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PROGRESS GAP:</span>
                  <span className={`font-bold ${gap < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {gap}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">BUDGET EXPENDITURE:</span>
                  <span className="text-slate-200 font-bold">₹{proj.expenditureToDateCr || 0} Cr</span>
                </div>
              </div>

              {/* CTA Link */}
              <button
                onClick={() => onSelectProject(proj.id)}
                className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold rounded-xl flex items-center justify-center space-x-1 transition text-xs"
              >
                <span>OPEN PROJECT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
