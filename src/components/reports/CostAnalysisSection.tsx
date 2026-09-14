import React from 'react';
import type { Project } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface CostAnalysisSectionProps {
  project: Project;
}

export const CostAnalysisSection: React.FC<CostAnalysisSectionProps> = ({ project }) => {
  const approvedBudget = project.revisedBudgetCr || project.originalBudgetCr;
  const amountSpent = project.expenditureToDateCr;
  const remainingBudget = Math.max(0, approvedBudget - amountSpent);
  const costOverrun = project.costOverrunForecastCr || 0;
  const hasCostPressure = costOverrun > 0 || (amountSpent / approvedBudget) > 0.85;

  const costData = [
    { category: 'Financials (₹ Cr)', Approved: approvedBudget, Spent: amountSpent, Remaining: remainingBudget }
  ];

  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          4. Cost & Financial Analysis
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Approved Budget</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">₹{approvedBudget} Cr</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Amount Spent</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">₹{amountSpent} Cr</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Remaining Budget</div>
          <div className="text-sm font-black text-emerald-800 mt-0.5">₹{remainingBudget} Cr</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Forecast Overrun</div>
          <div className={`text-sm font-black mt-0.5 ${costOverrun > 0 ? 'text-amber-800 font-bold' : 'text-slate-700'}`}>
            {costOverrun > 0 ? `+₹${costOverrun} Cr` : '₹0 Cr (Within Budget)'}
          </div>
        </div>
      </div>

      {/* Planned Cost vs Actual Cost Chart */}
      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs mb-3">
        <div className="text-[11px] font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
          Capital Outlay vs Expenditure Comparison (₹ Crores)
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="category" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="Approved" fill="#1e293b" name="Approved Outlay (₹ Cr)" barSize={36} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="#0d9488" name="Expenditure to Date (₹ Cr)" barSize={36} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Remaining" fill="#10b981" name="Remaining Allocation (₹ Cr)" barSize={36} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hasCostPressure && (
        <div className="bg-amber-50 border border-amber-300 p-2.5 rounded text-xs text-amber-900 font-medium">
          <span className="font-bold uppercase tracking-wider text-amber-950">Cost Monitoring Required: </span>
          {costOverrun > 0 
            ? `Current expenditure trend indicates potential cost overrun of +₹${costOverrun} Cr. Expenditure audits are recommended.`
            : `Expenditure has reached ${Math.round((amountSpent / approvedBudget) * 100)}% of total approved allocation. Financial tracking is advised.`}
        </div>
      )}
    </section>
  );
};
