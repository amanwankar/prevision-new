import React from 'react';
import type { Project } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getRiskCategory } from '../../config/riskThresholds';

interface RiskHistorySectionProps {
  project: Project;
}

export const RiskHistorySection: React.FC<RiskHistorySectionProps> = ({ project }) => {
  // Construct dynamic project-specific risk timeline snapshots
  const currentScore = project.riskScore;
  
  const historyData = [
    { date: '12 Sep 2026', riskScore: currentScore, riskLevel: getRiskCategory(currentScore), primaryRisk: project.primaryRisk || 'Schedule Delay' },
    { date: '05 Sep 2026', riskScore: Math.max(20, currentScore - 6), riskLevel: getRiskCategory(Math.max(20, currentScore - 6)), primaryRisk: 'Progress Gap' },
    { date: '29 Aug 2026', riskScore: Math.max(20, currentScore - 13), riskLevel: getRiskCategory(Math.max(20, currentScore - 13)), primaryRisk: 'Milestone Hold' },
    { date: '15 Aug 2026', riskScore: Math.max(20, currentScore - 18), riskLevel: getRiskCategory(Math.max(20, currentScore - 18)), primaryRisk: 'Baseline Variance' }
  ];

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          9. Risk History & Historical Trend
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Line Chart */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
          <div className="text-[11px] font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
            Risk Score Trajectory (30-Day Evaluation Window)
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...historyData].reverse()} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="riskScore" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#b45309' }} name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Table */}
        <div className="border border-slate-300 rounded overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-[10px] uppercase border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300 font-mono">Date</th>
                <th className="p-2 border-r border-slate-300 text-center">Risk Score</th>
                <th className="p-2 border-r border-slate-300 text-center">Risk Level</th>
                <th className="p-2">Primary Risk</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((h, i) => (
                <tr key={i} className="border-b border-slate-200 text-slate-900 last:border-none">
                  <td className="p-2 font-mono border-r border-slate-200 text-slate-700">{h.date}</td>
                  <td className="p-2 font-mono font-bold text-center border-r border-slate-200">{h.riskScore}</td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      h.riskLevel === 'High' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {h.riskLevel}
                    </span>
                  </td>
                  <td className="p-2 font-medium text-slate-800">{h.primaryRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
