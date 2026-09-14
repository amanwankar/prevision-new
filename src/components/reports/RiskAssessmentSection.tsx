import React from 'react';
import type { Project } from '../../types';
import { calculateRiskAnalysis } from '../../services/riskEngine';

interface RiskAssessmentSectionProps {
  project: Project;
}

export const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({ project }) => {
  const analysis = calculateRiskAnalysis(project);

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          5. AI-Powered Risk Assessment
        </h2>
      </div>

      {/* Main Score & Level Card */}
      <div className="bg-slate-900 text-white p-4 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:bg-slate-900 print:text-white">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-teal-400 uppercase">
            PRAEVISIO Analytical Engine Assessment
          </div>
          <div className="text-xl font-extrabold mt-0.5">
            Overall Risk Score: <span className="text-amber-400 font-mono font-black">{analysis.riskScore} / 100</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Primary Risk Driver: <span className="font-semibold text-white">{analysis.primaryRisk}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Classification</div>
            <div className={`text-base font-black px-3 py-1 rounded text-white mt-0.5 ${
              analysis.riskLevel === 'Critical' ? 'bg-red-700' :
              analysis.riskLevel === 'High' ? 'bg-amber-600' :
              analysis.riskLevel === 'Medium' ? 'bg-yellow-600' : 'bg-emerald-600'
            }`}>
              {analysis.riskLevel} Risk
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Indices Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <div className="border border-slate-300 bg-slate-50 p-2.5 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700">Schedule Risk</span>
            <span className="font-mono font-bold text-slate-900">{analysis.scheduleRisk}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full" style={{ width: `${analysis.scheduleRisk}%` }} />
          </div>
        </div>

        <div className="border border-slate-300 bg-slate-50 p-2.5 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700">Cost Risk</span>
            <span className="font-mono font-bold text-slate-900">{analysis.costRisk}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full" style={{ width: `${analysis.costRisk}%` }} />
          </div>
        </div>

        <div className="border border-slate-300 bg-slate-50 p-2.5 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700">Progress Risk</span>
            <span className="font-mono font-bold text-slate-900">{analysis.progressRisk}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-700 h-full" style={{ width: `${analysis.progressRisk}%` }} />
          </div>
        </div>

        <div className="border border-slate-300 bg-slate-50 p-2.5 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700">Milestone Risk</span>
            <span className="font-mono font-bold text-slate-900">{analysis.milestoneRisk}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${analysis.milestoneRisk}%` }} />
          </div>
        </div>

      </div>
    </section>
  );
};
