import React from 'react';
import { TrendingUp } from 'lucide-react';

interface DataQualityHistoryPoint {
  date: string;
  score: number;
  note: string;
}

interface DataQualityHistoryChartProps {
  history?: DataQualityHistoryPoint[];
}

const DEFAULT_HISTORY: DataQualityHistoryPoint[] = [
  { date: 'Jun 2026', score: 62, note: 'Initial intake - missing financial logs' },
  { date: 'Jul 2026', score: 74, note: 'Budget & milestone baseline updated' },
  { date: 'Aug 2026', score: 82, note: 'Physical progress verification completed' },
  { date: 'Sep 2026', score: 89, note: 'All mandatory parameters verified' },
];

export const DataQualityHistoryChart: React.FC<DataQualityHistoryChartProps> = ({
  history = DEFAULT_HISTORY,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            DATA QUALITY HISTORY & TRAJECTORY
          </h4>
        </div>
        <span className="font-mono text-[10px] text-slate-400">HISTORICAL SNAPSHOTS</span>
      </div>

      {/* SVG Line Chart */}
      <div className="relative h-36 w-full pt-4">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="400" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="80" x2="400" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Line Path */}
          <path
            d="M 20 58 L 130 42 L 250 28 L 370 16"
            fill="none"
            stroke="url(#purpleGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Area Fill */}
          <path
            d="M 20 58 L 130 42 L 250 28 L 370 16 L 370 100 L 20 100 Z"
            fill="url(#purpleArea)"
            opacity="0.3"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>

          {/* Points */}
          {[
            { x: 20, y: 58, pt: history[0] },
            { x: 130, y: 42, pt: history[1] },
            { x: 250, y: 28, pt: history[2] },
            { x: 370, y: 16, pt: history[3] },
          ].map((item, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={item.x}
                cy={item.y}
                r="5"
                className="fill-cyan-400 stroke-black stroke-2 group-hover:r-7 transition-all duration-300"
              />
              <text
                x={item.x}
                y={item.y - 10}
                textAnchor="middle"
                className="fill-cyan-300 font-mono text-[10px] font-bold"
              >
                {item.pt?.score || 80}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Timeline Labels */}
      <div className="grid grid-cols-4 gap-2 mt-4 text-center border-t border-slate-800/80 pt-3">
        {history.map((h, idx) => (
          <div key={idx} className="space-y-0.5">
            <span className="block font-mono text-[10px] font-bold text-slate-300">{h.date}</span>
            <span className="block text-[10px] text-slate-400 truncate" title={h.note}>
              {h.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
