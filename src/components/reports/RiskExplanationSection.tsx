import React from 'react';
import type { Project } from '../../types';
import { calculateRiskAnalysis } from '../../services/riskEngine';

interface RiskExplanationSectionProps {
  project: Project;
}

export const RiskExplanationSection: React.FC<RiskExplanationSectionProps> = ({ project }) => {
  const analysis = calculateRiskAnalysis(project);

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          6. Risk Explanation (Why is this project at risk?)
        </h2>
      </div>

      {/* Explanation Narrative Box */}
      <div className="bg-slate-50 border border-slate-300 rounded p-3 text-xs text-slate-800 space-y-2 mb-4">
        <div className="font-extrabold text-slate-950 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
          Key Findings & Root Causes
        </div>
        <p className="leading-relaxed text-slate-900">
          {analysis.explanation.summary}
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-800 pt-1">
          {analysis.explanation.contributingPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      {/* Top Risk Factors Table */}
      <div className="border border-slate-300 rounded overflow-hidden text-xs">
        <div className="bg-slate-100 p-2 font-extrabold text-slate-900 uppercase text-[11px] border-b border-slate-300">
          Top Risk Factors Breakdown
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-slate-300">
              <th className="p-2 border-r border-slate-300 font-bold">Factor</th>
              <th className="p-2 border-r border-slate-300 font-bold w-20 text-center">Score</th>
              <th className="p-2 border-r border-slate-300 font-bold w-24 text-center">Impact</th>
              <th className="p-2 font-bold">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {analysis.riskFactors.map((rf, idx) => (
              <tr key={idx} className="border-b border-slate-200 text-slate-900 last:border-none">
                <td className="p-2 font-bold border-r border-slate-200">{rf.name}</td>
                <td className="p-2 font-mono font-bold text-center border-r border-slate-200">{rf.score}</td>
                <td className="p-2 text-center border-r border-slate-200 font-bold">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    rf.severity === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    rf.severity === 'Medium' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {rf.severity}
                  </span>
                </td>
                <td className="p-2 text-slate-700 text-[11px]">{rf.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
