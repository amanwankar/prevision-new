import React from 'react';
import { Activity } from 'lucide-react';
import type { DataQualityResult } from '../../services/dataQualityService';

interface DataQualityScoreProps {
  result: DataQualityResult;
  showDimensions?: boolean;
}

export const DataQualityScore: React.FC<DataQualityScoreProps> = ({
  result,
  showDimensions = true,
}) => {
  const { overallScore, status, dimensions, explanation } = result;

  const getStatusBadge = () => {
    switch (status) {
      case 'DATA READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'NEEDS REVIEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INCOMPLETE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'VALIDATION ERROR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/50 stroke-emerald-400';
    if (val >= 70) return 'text-cyan-400 border-cyan-500/50 stroke-cyan-400';
    if (val >= 50) return 'text-amber-400 border-amber-500/50 stroke-amber-400';
    return 'text-rose-400 border-rose-500/50 stroke-rose-400';
  };

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            DATA QUALITY METRICS
          </h4>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold border uppercase tracking-wider ${getStatusBadge()}`}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Radial Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-slate-800">
          <div className="relative flex items-center justify-center h-28 w-28">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreColor(overallScore)} transition-all duration-1000 ease-out`}
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-extrabold font-mono ${getScoreColor(overallScore).split(' ')[0]}`}>
                {overallScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400">/ 100</span>
            </div>
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-300">OVERALL QUALITY</span>
        </div>

        {/* Explanation text */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            {explanation}
          </p>

          {showDimensions && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">COMPLETE</span>
                  <span className="font-mono font-bold text-slate-200">{dimensions.completeness}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${dimensions.completeness}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">CONSISTENT</span>
                  <span className="font-mono font-bold text-slate-200">{dimensions.consistency}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-500"
                    style={{ width: `${dimensions.consistency}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">VALID</span>
                  <span className="font-mono font-bold text-slate-200">{dimensions.validity}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${dimensions.validity}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">TIMELY</span>
                  <span className="font-mono font-bold text-slate-200">{dimensions.timeliness}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${dimensions.timeliness}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
