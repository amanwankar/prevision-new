import React from 'react';
import type { RadarProjectNode } from '../../services/portfolioIntelligenceService';
import type { Project } from '../../types';
import { Target } from 'lucide-react';

interface ProjectPriorityRadarProps {
  radarNodes: RadarProjectNode[];
  onSelectProject: (project: Project) => void;
}

export const ProjectPriorityRadar: React.FC<ProjectPriorityRadarProps> = ({
  radarNodes,
  onSelectProject
}) => {
  if (radarNodes.length === 0) {
    return (
      <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-8 text-center text-slate-400 font-mono text-xs">
        No project telemetry available to render Project Priority Radar.
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>PROJECT PRIORITY RADAR</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">2D Risk vs Physical Execution positioning matrix</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span>Critical</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500" /><span>High</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /><span>Normal</span></span>
        </div>
      </div>

      {/* Interactive 2D Scatter Field */}
      <div className="relative w-full h-72 bg-slate-950/90 rounded-xl border border-slate-800 p-6 overflow-hidden">
        
        {/* Axes Labels */}
        <div className="absolute left-3 top-3 text-[10px] font-mono text-red-400 font-bold tracking-widest uppercase">
          HIGH RISK (100) ↑
        </div>
        <div className="absolute right-3 bottom-3 text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
          PHYSICAL EXECUTION (100%) →
        </div>

        {/* Quadrant Lines */}
        <div className="absolute inset-0 pointer-events-none border-b border-r border-slate-800/80" style={{ top: '50%', left: 0, right: 0 }} />
        <div className="absolute inset-0 pointer-events-none border-r border-slate-800/80" style={{ left: '50%', top: 0, bottom: 0 }} />

        {/* Quadrant Labels */}
        <div className="absolute top-6 left-6 text-[9px] font-mono text-red-500/50 uppercase font-extrabold">
          HIGH RISK / LOW PROGRESS (URGENT ATTENTION)
        </div>
        <div className="absolute top-6 right-6 text-[9px] font-mono text-amber-500/50 uppercase font-extrabold text-right">
          HIGH RISK / HIGH PROGRESS (MONITOR COST)
        </div>

        {/* Project Nodes */}
        {radarNodes.map((node) => {
          // Map xExecution (0-100) to left% (8% to 92%)
          const leftPercent = 8 + (node.xExecution / 100) * 84;
          // Map yRisk (0-100) to bottom% (8% to 92%)
          const bottomPercent = 8 + (node.yRisk / 100) * 84;

          const color = node.riskCategory === 'Critical' ? '#ef4444' 
            : node.riskCategory === 'High' ? '#f59e0b'
            : '#06b6d4';

          return (
            <div
              key={node.project.id}
              onClick={() => onSelectProject(node.project)}
              style={{
                left: `${leftPercent}%`,
                bottom: `${bottomPercent}%`,
              }}
              className="absolute transform -translate-x-1/2 translate-y-1/2 cursor-pointer group z-20"
            >
              <div 
                className="rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-white shadow-lg transition-all duration-300 group-hover:scale-125 border border-white/20"
                style={{
                  width: `${node.bubbleRadius * 2}px`,
                  height: `${node.bubbleRadius * 2}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 15px ${color}80`
                }}
              >
                {node.project.code.slice(-3)}
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-white font-mono text-[10px] shadow-2xl z-30 pointer-events-none">
                <div className="font-bold text-cyan-300">{node.project.name}</div>
                <div className="text-slate-400">Code: {node.project.code}</div>
                <div className="flex justify-between text-slate-300 mt-1">
                  <span>Risk: <strong className="text-red-400">{node.yRisk}/100</strong></span>
                  <span>Progress: <strong className="text-cyan-400">{node.xExecution}%</strong></span>
                </div>
                <div className="text-amber-400 text-[9px] mt-1 line-clamp-2">{node.primaryAttentionReason}</div>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};
