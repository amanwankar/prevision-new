import React from 'react';
import type { PortfolioHealthDimensions } from '../../services/portfolioIntelligenceService';

interface PortfolioHealthIndexProps {
  overallHealthStatus: 'HEALTHY' | 'WATCH' | 'AT RISK' | 'CRITICAL' | 'INSUFFICIENT DATA';
  healthDimensions: PortfolioHealthDimensions;
}

export const PortfolioHealthIndex: React.FC<PortfolioHealthIndexProps> = ({
  overallHealthStatus,
  healthDimensions
}) => {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'AT RISK': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'WATCH': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'HEALTHY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>PORTFOLIO HEALTH INDEX</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">Aggregated execution & risk indicators across monitored national portfolio</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">OVERALL STATUS:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(overallHealthStatus)}`}>
            {overallHealthStatus}
          </span>
        </div>
      </div>

      {/* Grid of 6 Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {Object.entries(healthDimensions).map(([key, dim]) => {
          const isInsuff = dim.status === 'insufficient';

          return (
            <div
              key={key}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                isInsuff
                  ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                  : dim.status === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : dim.status === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950/70 border-slate-800 text-slate-200'
              }`}
            >
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                  {key}
                </span>
                <span className="text-sm font-extrabold text-white block mt-1">
                  {dim.state}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block line-clamp-1">
                {dim.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
