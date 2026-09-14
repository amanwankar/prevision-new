import React from 'react';
import type { Project } from '../../types';

interface InfrastructureNetworkProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (id: string) => void;
}

export const InfrastructureNetwork: React.FC<InfrastructureNetworkProps> = ({
  projects,
  selectedProjectId,
  onSelectProject
}) => {
  return (
    <div className="relative w-full h-48 bg-slate-950/80 rounded-2xl border border-cyan-500/30 p-4 overflow-hidden shadow-2xl font-mono text-xs">
      
      <div className="absolute top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 flex items-center space-x-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>INFRASTRUCTURE INTELLIGENCE NETWORK</span>
      </div>

      <svg className="w-full h-full">
        {/* Core Hub */}
        <circle cx="50%" cy="50%" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="18" fill="rgba(6, 182, 212, 0.2)" className="animate-pulse" />
        <text x="50%" y="50%" textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="bold">PORTFOLIO</text>

        {/* Project Spokes */}
        {projects.slice(0, 6).map((p, idx) => {
          const angle = (idx / Math.min(6, projects.length)) * 2 * Math.PI - Math.PI / 2;
          const cx = 50 + Math.cos(angle) * 35; // %
          const cy = 50 + Math.sin(angle) * 35; // %

          const isHighRisk = p.riskScore >= 70;
          const color = isHighRisk ? '#ef4444' : '#06b6d4';
          const isSelected = p.id === selectedProjectId;

          return (
            <g key={p.id} className="cursor-pointer" onClick={() => onSelectProject && onSelectProject(p.id)}>
              <line x1="50%" y1="50%" x2={`${cx}%`} y2={`${cy}%`} stroke={color} strokeOpacity={isSelected ? "0.9" : "0.4"} strokeDasharray="2 2" strokeWidth={isSelected ? "2" : "1"} />
              <circle cx={`${cx}%`} cy={`${cy}%`} r={isSelected ? "14" : "10"} fill="#0f172a" stroke={color} strokeWidth="2" />
              <text x={`${cx}%`} y={`${cy}%`} textAnchor="middle" dy="3" fill="#ffffff" fontSize="8" fontWeight="bold">
                {p.code.slice(-3)}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
};
