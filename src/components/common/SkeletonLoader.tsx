import React from 'react';

export const KPISkeleton: React.FC = () => (
  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-shimmer">
    <div className="flex items-center justify-between mb-2">
      <div className="h-3 w-20 bg-slate-800 rounded" />
      <div className="h-4 w-4 bg-slate-800 rounded-full" />
    </div>
    <div className="h-7 w-28 bg-slate-800/90 rounded mb-1.5" />
    <div className="h-2.5 w-36 bg-slate-800/60 rounded" />
  </div>
);

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-shimmer space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-32 bg-slate-800 rounded" />
      <div className="h-3 w-16 bg-slate-800/60 rounded" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-3.5 bg-slate-800/50 rounded w-full" style={{ width: `${100 - i * 15}%` }} />
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-shimmer space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-4 w-40 bg-slate-800 rounded" />
      <div className="h-3 w-24 bg-slate-800/60 rounded" />
    </div>
    <div className="h-48 w-full bg-slate-800/30 rounded flex items-end justify-between p-4 gap-2">
      <div className="w-1/6 h-1/3 bg-slate-800/50 rounded-t" />
      <div className="w-1/6 h-2/3 bg-slate-800/60 rounded-t" />
      <div className="w-1/6 h-1/2 bg-slate-800/50 rounded-t" />
      <div className="w-1/6 h-5/6 bg-cyan-500/20 rounded-t" />
      <div className="w-1/6 h-3/4 bg-slate-800/60 rounded-t" />
      <div className="w-1/6 h-2/5 bg-slate-800/50 rounded-t" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-shimmer space-y-3">
    <div className="h-8 bg-slate-800/80 rounded w-full mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/40">
        <div className="h-4 bg-slate-800/60 rounded w-1/4" />
        <div className="h-4 bg-slate-800/50 rounded w-1/5" />
        <div className="h-4 bg-slate-800/60 rounded w-1/6" />
        <div className="h-4 bg-slate-800/40 rounded w-1/6" />
      </div>
    ))}
  </div>
);
