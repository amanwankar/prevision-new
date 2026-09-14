import React from 'react';
import type { SingleHealthDimension, ExecutionHealthState } from '../../services/executionIntelligenceService';

interface ProjectHealthRingProps {
  overallHealthState: ExecutionHealthState;
  overallScore: number | null;
  dimensions: {
    schedule: SingleHealthDimension;
    progress: SingleHealthDimension;
    financial: SingleHealthDimension;
    milestones: SingleHealthDimension;
    dataQuality: SingleHealthDimension;
    risk: SingleHealthDimension;
  };
}

export const ProjectHealthRing: React.FC<ProjectHealthRingProps> = ({
  overallHealthState,
  overallScore,
  dimensions
}) => {
  const getBadgeColor = (state: ExecutionHealthState) => {
    switch (state) {
      case 'HEALTHY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'WATCH': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'HIGH RISK': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'DATA ISSUE': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const ringColor = overallHealthState === 'CRITICAL' ? '#ef4444' 
    : overallHealthState === 'HIGH RISK' ? '#f59e0b'
    : overallHealthState === 'WATCH' ? '#38bdf8'
    : '#10b981';

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
      
      {/* Central Radial Ring Visual */}
      <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {overallScore !== null && (
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke={ringColor}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - overallScore / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        <div className="absolute text-center flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-mono text-white tracking-tight">
            {overallScore !== null ? `${overallScore}%` : 'N/A'}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
            PROJECT HEALTH
          </span>
          <div className={`mt-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(overallHealthState)}`}>
            {overallHealthState}
          </div>
        </div>
      </div>

      {/* Grid of 6 Dimension Breakdown Quick Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
        {Object.entries(dimensions).map(([key, dim]) => {
          const isInsuff = dim.status === 'insufficient';

          return (
            <a
              key={key}
              href={dim.deepLinkHash}
              className={`p-3 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
                isInsuff 
                  ? 'bg-slate-950/40 border-slate-800 text-slate-500' 
                  : dim.status === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/60 text-red-300'
                  : dim.status === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 text-slate-200'
              }`}
            >
              <div>
                <div className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase group-hover:text-cyan-300 transition-colors">
                  {dim.title}
                </div>
                <div className="text-sm font-extrabold font-mono text-white mt-1">
                  {dim.state}
                </div>
              </div>

              <div className="mt-2 text-[10px] font-mono text-cyan-400 group-hover:underline flex items-center justify-between">
                <span>{dim.deepLinkLabel}</span>
              </div>
            </a>
          );
        })}
      </div>

    </div>
  );
};
