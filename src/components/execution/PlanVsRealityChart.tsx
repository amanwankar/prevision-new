import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import type { PlanVsRealityPoint } from '../../services/executionIntelligenceService';

interface PlanVsRealityChartProps {
  data: PlanVsRealityPoint[];
}

export const PlanVsRealityChart: React.FC<PlanVsRealityChartProps> = ({ data }) => {
  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>PLAN VS REALITY EXECUTION</span>
          </h3>
          <p className="text-xs text-slate-400">Baseline target vs actual physical progress trajectory</p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-cyan-400 rounded-full" />
            <span className="text-cyan-300 font-bold">PLAN</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-teal-400 rounded-full" />
            <span className="text-teal-300 font-bold">ACTUAL</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-purple-400 rounded-full" />
            <span className="text-purple-300 font-bold">EXPECTED</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#06b6d4',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px'
              }}
            />

            <Area type="monotone" dataKey="plannedProgress" name="Planned Target" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#planGradient)" />
            <Area type="monotone" dataKey="actualProgress" name="Actual Physical" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#actualGradient)" />
            <Area type="monotone" dataKey="expectedProgress" name="AI Expected" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#expectedGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
