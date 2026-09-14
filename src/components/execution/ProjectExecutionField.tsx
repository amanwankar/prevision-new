import React from 'react';
import type { Project, Milestone, EarlyWarning, RecommendedAction } from '../../types';

interface ProjectExecutionFieldProps {
  project: Project;
  milestones?: Milestone[];
  warnings?: EarlyWarning[];
  actions?: RecommendedAction[];
  riskScore: number;
}

export const ProjectExecutionField: React.FC<ProjectExecutionFieldProps> = ({
  milestones = [],
  warnings = [],
  actions = [],
  riskScore
}) => {
  const delayedMsCount = milestones.filter(m => m.status === 'Delayed').length;
  const activeWarnCount = warnings.filter(w => w.status !== 'Resolved').length;
  const pendingActCount = actions.filter(a => a.status === 'Pending').length;

  const nodeColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : '#06b6d4';

  return (
    <div className="relative w-full h-44 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 overflow-hidden shadow-xl font-mono text-xs">
      
      {/* Background Atmosphere Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="absolute top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 flex items-center space-x-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>Connected Execution Field Network</span>
      </div>

      {/* Connected Network Graphic */}
      <svg className="w-full h-full">
        {/* Connection Rays from Core */}
        <line x1="20%" y1="50%" x2="45%" y2="25%" stroke={nodeColor} strokeOpacity="0.4" strokeDasharray="3 3" strokeWidth="1.5" />
        <line x1="20%" y1="50%" x2="45%" y2="75%" stroke="#8b5cf6" strokeOpacity="0.4" strokeWidth="1.5" />
        <line x1="45%" y1="25%" x2="75%" y2="25%" stroke={activeWarnCount > 0 ? '#ef4444' : '#06b6d4'} strokeOpacity="0.5" strokeWidth="1.5" />
        <line x1="45%" y1="75%" x2="75%" y2="75%" stroke={pendingActCount > 0 ? '#f59e0b' : '#14b8a6'} strokeOpacity="0.5" strokeWidth="1.5" />

        {/* PROJECT CORE NODE */}
        <g transform="translate(80, 85)" className="cursor-pointer">
          <circle cx="0" cy="0" r="24" fill="rgba(15, 23, 42, 0.9)" stroke={nodeColor} strokeWidth="2" />
          <circle cx="0" cy="0" r="16" fill={`${nodeColor}20`} className="animate-pulse" />
          <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">CORE</text>
        </g>

        {/* TIMELINE / MILESTONES NODE */}
        <g transform="translate(200, 45)">
          <rect x="-40" y="-16" width="80" height="32" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke={delayedMsCount > 0 ? '#f59e0b' : '#06b6d4'} strokeWidth="1.5" />
          <text x="0" y="-1" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">TIMELINE</text>
          <text x="0" y="10" textAnchor="middle" fill="#94a3b8" fontSize="8">{delayedMsCount > 0 ? `${delayedMsCount} Delayed` : 'On Schedule'}</text>
        </g>

        {/* RISK ENGINE NODE */}
        <g transform="translate(200, 125)">
          <rect x="-40" y="-16" width="80" height="32" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="0" y="-1" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold">RISK</text>
          <text x="0" y="10" textAnchor="middle" fill="#e2e8f0" fontSize="8">{riskScore}/100 Score</text>
        </g>

        {/* WARNINGS NODE */}
        <g transform="translate(320, 45)">
          <rect x="-45" y="-16" width="90" height="32" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke={activeWarnCount > 0 ? '#ef4444' : '#64748b'} strokeWidth="1.5" />
          <text x="0" y="-1" textAnchor="middle" fill={activeWarnCount > 0 ? '#fca5a5' : '#94a3b8'} fontSize="9" fontWeight="bold">WARNINGS</text>
          <text x="0" y="10" textAnchor="middle" fill="#cbd5e1" fontSize="8">{activeWarnCount} Active</text>
        </g>

        {/* ACTIONS NODE */}
        <g transform="translate(320, 125)">
          <rect x="-45" y="-16" width="90" height="32" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke={pendingActCount > 0 ? '#f59e0b' : '#14b8a6'} strokeWidth="1.5" />
          <text x="0" y="-1" textAnchor="middle" fill={pendingActCount > 0 ? '#fde047' : '#2dd4bf'} fontSize="9" fontWeight="bold">ACTIONS</text>
          <text x="0" y="10" textAnchor="middle" fill="#cbd5e1" fontSize="8">{pendingActCount} Pending</text>
        </g>
      </svg>
    </div>
  );
};
