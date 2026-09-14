import React from 'react';
import type { Project, EarlyWarning, RecommendedAction } from '../../types';
import { calculateRiskAnalysis } from '../../services/riskEngine';
import { calculateDataQuality } from '../../services/dataQualityService';
import { X, ArrowUpRight, Activity } from 'lucide-react';

interface ProjectComparisonDrawerProps {
  project: Project | null;
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onOpenExecution: (id: string) => void;
}

export const ProjectComparisonDrawer: React.FC<ProjectComparisonDrawerProps> = ({
  project,
  alerts = [],
  actions = [],
  onClose,
  onOpenProject,
  onOpenExecution
}) => {
  if (!project) return null;

  const riskAnalysis = calculateRiskAnalysis(project);
  const dqResult = calculateDataQuality(project);
  const pAlerts = alerts.filter(a => a.projectId === project.id);
  const pActions = actions.filter(ac => ac.projectId === project.id);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-y-auto font-mono text-xs text-slate-100 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">PROJECT INTELLIGENCE DRAWER</span>
          <h2 className="text-base font-extrabold text-white mt-0.5">{project.name}</h2>
          <span className="text-[10px] text-slate-400">{project.code} • {project.sector}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            onOpenProject(project.id);
            onClose();
          }}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition flex items-center justify-center space-x-1"
        >
          <span>OPEN PROJECT DETAILS</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            onOpenExecution(project.id);
            onClose();
          }}
          className="p-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-bold transition flex items-center justify-center space-x-1"
        >
          <span>EXECUTION CONTROL</span>
          <Activity className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Risk Summary */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Risk Assessment</span>
          <span className="text-sm font-extrabold text-red-400">{riskAnalysis.riskScore}/100 ({riskAnalysis.riskLevel})</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">{riskAnalysis.explanation.summary}</p>
      </div>

      {/* Key Dimensions Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Actual Physical Progress</span>
          <span className="text-sm font-extrabold text-cyan-300 mt-1 block">{project.actualPhysicalProgress}%</span>
          <span className="text-[9px] text-slate-400">Target: {project.targetPhysicalProgress}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Data Readiness</span>
          <span className="text-sm font-extrabold text-purple-300 mt-1 block">{dqResult.overallScore}%</span>
          <span className="text-[9px] text-slate-400">{dqResult.status}</span>
        </div>
      </div>

      {/* Warnings & Actions Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-300">Active Early Warnings</span>
          <span className="font-bold text-amber-400">{pAlerts.length} Active</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-300">Pending Recommended Actions</span>
          <span className="font-bold text-cyan-400">{pActions.length} Pending</span>
        </div>
      </div>

    </div>
  );
};
