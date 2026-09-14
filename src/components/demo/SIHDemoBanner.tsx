import React from 'react';
import { RefreshCw, X, Eye, EyeOff, Radio } from 'lucide-react';

interface SIHDemoBannerProps {
  currentStepIndex: number;
  totalSteps: number;
  isAudienceView: boolean;
  onToggleAudienceView: () => void;
  onResetDemo: () => void;
  onExitDemo: () => void;
}

export const SIHDemoBanner: React.FC<SIHDemoBannerProps> = ({
  currentStepIndex,
  totalSteps,
  isAudienceView,
  onToggleAudienceView,
  onResetDemo,
  onExitDemo
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-cyan-500/40 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono z-40 sticky top-0 shadow-[0_0_20px_rgba(6,182,212,0.15)] no-print">
      
      {/* Left Branding Tag */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-extrabold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SIH DEMO MODE</span>
          <span className="text-[10px] text-slate-500 font-normal">| PRAEVISIO INTELLIGENCE ENVIRONMENT</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>SCENARIO: NH-44-EXP (RISK 82/100)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Step Indicator */}
        <span className="text-slate-400 text-[10px]">
          STEP <span className="font-bold text-white">{currentStepIndex + 1}</span> OF <span className="font-bold text-slate-300">{totalSteps}</span>
        </span>

        {/* View Toggle */}
        <button
          onClick={onToggleAudienceView}
          className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center space-x-1 transition text-[10px]"
          title="Toggle Presenter Instructions for Audience Screen"
        >
          {isAudienceView ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
          <span>{isAudienceView ? 'Audience View' : 'Presenter View'}</span>
        </button>

        {/* Reset Demo */}
        <button
          onClick={onResetDemo}
          className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          title="Reset Demo Scenario State"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Exit Demo */}
        <button
          onClick={onExitDemo}
          className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white transition flex items-center space-x-1 text-[10px]"
        >
          <X className="w-3 h-3" />
          <span>Exit Demo</span>
        </button>
      </div>

    </div>
  );
};
