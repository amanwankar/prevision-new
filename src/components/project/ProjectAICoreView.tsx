import React from 'react';
import { AICore } from '../motion/AICore';

interface ProjectAICoreViewProps {
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  progressGap: number;
  expenditurePercent: number;
  riskScore: number;
}

export const ProjectAICoreView: React.FC<ProjectAICoreViewProps> = ({
  isAnalyzing,
  onRunAnalysis,
  progressGap,
  expenditurePercent,
  riskScore
}) => {
  return (
    <div className="relative bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden glass-reflection flex flex-col items-center justify-center min-h-[320px]">
      
      {/* Laser Scanning Overlay during Analysis */}
      {isAnalyzing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 animate-ai-scan z-20" />
      )}

      {/* SVG Connection Network Lines behind nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4" className={isAnalyzing ? 'animate-pulse' : ''} />
        <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" className={isAnalyzing ? 'animate-pulse' : ''} />
        <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" className={isAnalyzing ? 'animate-pulse' : ''} />
        <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" className={isAnalyzing ? 'animate-pulse' : ''} />
      </svg>

      {/* Central AI Core */}
      <div className="relative z-10 my-4 flex flex-col items-center">
        <AICore 
          size="lg" 
          state={isAnalyzing ? 'ANALYZING' : riskScore >= 80 ? 'WARNING' : 'IDLE'}
          onClick={onRunAnalysis}
        />
        <div className="mt-3 text-center">
          <div className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>PROJECT AI ENGINE</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {isAnalyzing ? 'RUNNING TELEMETRY AGGREGATION...' : 'TELEMETRY SYNCED • ACTIVE'}
          </p>
        </div>
      </div>

      {/* Orbiting Satellite Data Nodes */}
      
      {/* Top Left: Progress Satellite */}
      <div className="absolute top-6 left-6 bg-slate-950/80 border border-cyan-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-lg text-[11px] font-mono">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>PROGRESS</span>
        </div>
        <div className="text-white font-bold text-xs mt-0.5">
          {progressGap < 0 ? `${progressGap}% GAP` : 'ON SCHEDULE'}
        </div>
      </div>

      {/* Top Right: Schedule Satellite */}
      <div className="absolute top-6 right-6 bg-slate-950/80 border border-purple-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-lg text-[11px] font-mono">
        <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>SCHEDULE</span>
        </div>
        <div className="text-purple-300 font-bold text-xs mt-0.5">
          90-DAY SLIPPAGE
        </div>
      </div>

      {/* Bottom Left: Cost Satellite */}
      <div className="absolute bottom-6 left-6 bg-slate-950/80 border border-amber-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-lg text-[11px] font-mono">
        <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>COST UTILIZATION</span>
        </div>
        <div className="text-amber-300 font-bold text-xs mt-0.5">
          {expenditurePercent}% SPENT
        </div>
      </div>

      {/* Bottom Right: Risk Score Satellite */}
      <div className="absolute bottom-6 right-6 bg-slate-950/80 border border-rose-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-lg text-[11px] font-mono">
        <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>RISK INDEX</span>
        </div>
        <div className="text-rose-300 font-bold text-xs mt-0.5">
          {riskScore}/100 HIGH
        </div>
      </div>

    </div>
  );
};
