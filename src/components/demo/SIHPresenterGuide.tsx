import React from 'react';
import { EyeOff, Sparkles, MessageSquare, Monitor } from 'lucide-react';
import type { DemoStep } from '../../services/sihDemoService';

interface SIHPresenterGuideProps {
  step: DemoStep;
  onHide: () => void;
}

export const SIHPresenterGuide: React.FC<SIHPresenterGuideProps> = ({
  step,
  onHide
}) => {
  return (
    <div className="fixed bottom-24 right-4 z-50 w-full max-w-sm p-4 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] text-slate-100 space-y-3 no-print animate-slideLeft">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            PRESENTER GUIDE • STEP {step.id} OF 7
          </span>
        </div>

        <button
          onClick={onHide}
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
          title="Switch to Audience View (Hide Guide)"
        >
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Step Title & Subtitle */}
      <div>
        <h4 className="text-xs font-bold text-white">{step.title}</h4>
        <p className="text-[10px] text-cyan-300 font-mono mt-0.5">{step.subtitle}</p>
      </div>

      {/* WHAT TO SHOW */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
        <div className="text-[9px] font-mono font-bold text-teal-400 uppercase flex items-center space-x-1">
          <Monitor className="w-3 h-3 text-teal-400" />
          <span>WHAT TO SHOW:</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">{step.whatToShow}</p>
      </div>

      {/* WHAT TO SAY */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
        <div className="text-[9px] font-mono font-bold text-cyan-400 uppercase flex items-center space-x-1">
          <MessageSquare className="w-3 h-3 text-cyan-400" />
          <span>WHAT TO SAY (SUGGESTED NARRATION):</span>
        </div>
        <p className="text-[11px] text-slate-200 font-sans italic leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          "{step.whatToSay}"
        </p>
      </div>

    </div>
  );
};
