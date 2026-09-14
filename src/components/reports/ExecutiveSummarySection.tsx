import React from 'react';
import type { Project, EarlyWarning, RecommendedAction } from '../../types';
import { calculateRiskAnalysis } from '../../services/riskEngine';

interface ExecutiveSummarySectionProps {
  project: Project;
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  summaryText?: string;
}

export const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({
  project,
  alerts,
  actions,
  summaryText
}) => {
  const analysis = calculateRiskAnalysis(project);
  const activeWarnings = alerts.filter(a => a.projectId === project.id && a.status !== 'Resolved');
  const pendingActions = actions.filter(a => a.projectId === project.id && a.status !== 'Completed' && a.status !== 'Executed');

  // Dynamic narrative calculation if not explicitly provided
  const dynamicSummary = summaryText || 
    `Project progress (${project.actualPhysicalProgress}%) is currently below the planned schedule baseline (${project.targetPhysicalProgress}%). The current risk assessment indicates elevated ${analysis.primaryRisk.toLowerCase()} risk (Score: ${analysis.riskScore}/100, Level: ${analysis.riskLevel}). Active warnings (${activeWarnings.length}) and recommended actions (${pendingActions.length}) should be reviewed by the concerned officer.`;

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          1. Executive Summary
        </h2>
      </div>

      {/* 8-Card Key Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Project Status</div>
          <div className="text-xs font-black text-slate-900 mt-1">{project.status}</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Overall Progress</div>
          <div className="text-xs font-black text-slate-900 mt-1">{project.actualPhysicalProgress}%</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Risk Score</div>
          <div className="text-xs font-black text-slate-900 mt-1">{analysis.riskScore} / 100</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</div>
          <div className={`text-xs font-black mt-1 ${
            analysis.riskLevel === 'Critical' || analysis.riskLevel === 'High' ? 'text-red-700 font-bold' :
            analysis.riskLevel === 'Medium' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'
          }`}>
            {analysis.riskLevel}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Schedule Risk</div>
          <div className="text-xs font-black text-slate-900 mt-1">{analysis.scheduleRisk}%</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Cost Risk</div>
          <div className="text-xs font-black text-slate-900 mt-1">{analysis.costRisk}%</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Active Warnings</div>
          <div className="text-xs font-black text-amber-700 mt-1">{activeWarnings.length} Active</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Pending Actions</div>
          <div className="text-xs font-black text-teal-800 mt-1">{pendingActions.length} Actions</div>
        </div>

      </div>

      {/* Human Readable Executive Narrative */}
      <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3 text-xs text-slate-800 font-medium rounded-r leading-relaxed">
        <span className="font-bold text-slate-950">Executive Brief: </span>
        {dynamicSummary}
      </div>
    </section>
  );
};
