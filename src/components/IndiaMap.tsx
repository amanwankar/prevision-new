import React, { useState } from 'react';
import type { Project } from '../types';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface IndiaMapProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ projects, onSelectProject }) => {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  const getCoords = (lat: number, lng: number) => {
    const x = ((lng - 68) / (97 - 68)) * 100;
    const y = 100 - ((lat - 8) / (36 - 8)) * 100;
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  };

  const getMarkerColor = (level: string) => {
    switch (level) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#eab308';
      default: return '#0d9488';
    }
  };

  return (
    <div className="relative bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between">
      
      <div className="relative w-full md:w-2/3 h-80 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-center p-2">
        
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 pointer-events-none">
          <path
            d="M 35 12 L 45 10 L 50 15 L 60 14 L 68 18 L 85 24 L 92 28 L 88 35 L 75 38 L 78 45 L 82 50 L 70 65 L 55 85 L 45 92 L 40 85 L 35 70 L 25 60 L 15 45 L 20 30 L 30 20 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.5"
          />
        </svg>

        {projects.map((proj) => {
          const { x, y } = getCoords(proj.lat, proj.lng);
          const color = getMarkerColor(proj.riskLevel);
          const isCritical = proj.riskLevel === 'Critical';

          return (
            <div
              key={proj.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onMouseEnter={() => setHoveredProject(proj)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => onSelectProject(proj.id)}
            >
              {isCritical && (
                <div
                  className="absolute -inset-1.5 rounded-full opacity-75 animate-ping"
                  style={{ backgroundColor: color }}
                />
              )}

              <div
                className="relative w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center transition transform group-hover:scale-125"
                style={{ backgroundColor: color }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 z-30 pointer-events-none">
                <div className="font-bold truncate">{proj.name}</div>
                <div className="text-[10px] text-slate-300">{proj.state} • {proj.sector}</div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span>Risk Score:</span>
                  <span className="font-bold" style={{ color }}>{proj.riskScore}/100</span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
          Geographic Risk Distribution • India Infra Corridors
        </div>
      </div>

      <div className="w-full md:w-1/3 md:pl-4 mt-4 md:mt-0 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Project Spotlight</span>
          <span className="text-[10px] text-teal-400 font-normal">Click marker to details</span>
        </h4>

        {hoveredProject ? (
          <div className="bg-slate-800/90 border border-teal-500/40 p-3.5 rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono bg-slate-700 text-teal-300 px-1.5 py-0.5 rounded">
                  {hoveredProject.code}
                </span>
                <h5 className="text-xs font-bold text-white mt-1 leading-tight">{hoveredProject.name}</h5>
              </div>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: getMarkerColor(hoveredProject.riskLevel) }}
              >
                {hoveredProject.riskScore} Risk
              </span>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Sector:</span>
                <span className="font-semibold text-slate-200">{hoveredProject.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Progress:</span>
                <span>{hoveredProject.actualPhysicalProgress}% / {hoveredProject.targetPhysicalProgress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delay Days:</span>
                <span className="text-amber-400 font-bold">+{hoveredProject.delayDays} days</span>
              </div>
            </div>

            <button
              onClick={() => onSelectProject(hoveredProject.id)}
              className="w-full mt-2 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded flex items-center justify-center space-x-1"
            >
              <span>Inspect Full XAI Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-dashed border-slate-700 p-4 rounded-lg text-center text-xs text-slate-400">
            <MapPin className="w-6 h-6 text-slate-500 mx-auto mb-2 animate-bounce" />
            Hover over any project pin on the map to preview risk attribution & delay metrics.
          </div>
        )}
      </div>

    </div>
  );
};
