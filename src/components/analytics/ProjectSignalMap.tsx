import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectSignalMapProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenQuickDrawer: (project: Project) => void;
}

export const ProjectSignalMap: React.FC<ProjectSignalMapProps> = ({
  projects,
  onSelectProject,
  onOpenQuickDrawer
}) => {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Position nodes along an organic infrastructure network grid
  const nodePositions = [
    { x: 18, y: 30 },
    { x: 42, y: 22 },
    { x: 70, y: 28 },
    { x: 28, y: 58 },
    { x: 55, y: 50 },
    { x: 82, y: 62 },
    { x: 38, y: 80 },
    { x: 68, y: 82 }
  ];

  const hoveredProject = projects.find(p => p.id === hoveredProjectId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl font-mono text-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
              DIGITAL INFRASTRUCTURE SIGNAL MAP
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Abstract telemetry network mapping project nodes, risk severity pulses, and sector interconnections.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono shrink-0">
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>High Risk (75+)</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Medium Risk (50-74)</span>
          </span>
          <span className="flex items-center space-x-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Low Risk (&lt;50)</span>
          </span>
        </div>
      </div>

      {/* Interactive Network Canvas Container */}
      <div className="h-[420px] w-full relative mt-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Subtle Network Grid Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="signalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signalGrid)" />

          {/* Sector Connection Lines */}
          {projects.map((p1, i) => {
            const pos1 = nodePositions[i % nodePositions.length];
            return projects.map((p2, j) => {
              if (i < j && p1.sector === p2.sector) {
                const pos2 = nodePositions[j % nodePositions.length];
                return (
                  <line
                    key={`link-${p1.id}-${p2.id}`}
                    x1={`${pos1.x}%`}
                    y1={`${pos1.y}%`}
                    x2={`${pos2.x}%`}
                    y2={`${pos2.y}%`}
                    stroke={p1.riskScore >= 75 || p2.riskScore >= 75 ? '#f43f5e' : '#06b6d4'}
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    className="opacity-50"
                  />
                );
              }
              return null;
            });
          })}
        </svg>

        {/* Floating Infrastructure Nodes */}
        {projects.map((proj, idx) => {
          const pos = nodePositions[idx % nodePositions.length];
          const isHigh = proj.riskScore >= 75;
          const isMed = proj.riskScore >= 50 && proj.riskScore < 75;
          const isHovered = hoveredProjectId === proj.id;

          return (
            <div
              key={proj.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
              onMouseEnter={() => setHoveredProjectId(proj.id)}
              onMouseLeave={() => setHoveredProjectId(null)}
              onClick={() => onOpenQuickDrawer(proj)}
            >
              {/* Outer Pulse Ring for High Risk */}
              {isHigh && (
                <div className="absolute -inset-3 rounded-full border border-rose-500/60 animate-ping pointer-events-none" />
              )}

              {/* Node Center Badge */}
              <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-xs transition-all duration-300 ${
                isHovered ? 'scale-125 ring-4 ring-cyan-400/40 bg-slate-900 text-white' : 'bg-slate-950 text-white'
              }`}>
                <span className={isHigh ? 'text-rose-400' : isMed ? 'text-amber-300' : 'text-cyan-400'}>
                  {proj.riskScore}
                </span>
              </div>

              {/* Node Label */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-center pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[9px] font-bold text-slate-300 block shadow-md">
                  {proj.code}
                </span>
              </div>
            </div>
          );
        })}

        {/* Hover Inspection Card Overlay */}
        {hoveredProject && (
          <div className="absolute bottom-4 left-4 z-30 p-4 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/60 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] max-w-sm space-y-2 font-sans animate-fade-in">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-cyan-400 font-bold">{hoveredProject.code}</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                hoveredProject.riskScore >= 75 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                hoveredProject.riskScore >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                Risk Score: {hoveredProject.riskScore}
              </span>
            </div>

            <div className="font-bold text-white text-xs">{hoveredProject.name}</div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 pt-1">
              <div>Progress: <strong className="text-cyan-400">{hoveredProject.actualPhysicalProgress}%</strong></div>
              <div>Gap: <strong className="text-rose-400">-{Math.max(0, hoveredProject.targetPhysicalProgress - hoveredProject.actualPhysicalProgress)}%</strong></div>
              <div>Sector: <strong className="text-slate-200">{hoveredProject.sector}</strong></div>
              <div>Status: <strong className="text-amber-400">{hoveredProject.status}</strong></div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[10px] font-mono border-t border-slate-800">
              <span className="text-slate-400">Click node for Quick Drawer</span>
              <button 
                onClick={() => onSelectProject(hoveredProject.id)}
                className="text-cyan-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>Full XAI Page →</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
