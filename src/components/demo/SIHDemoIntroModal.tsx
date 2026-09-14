import React from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle,
  Play,
  Cpu
} from 'lucide-react';
import { CommandButton } from '../common/CommandButton';

interface SIHDemoIntroModalProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export const SIHDemoIntroModal: React.FC<SIHDemoIntroModalProps> = ({
  isOpen,
  onStart,
  onSkip
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn no-print">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.3)] text-slate-100 space-y-6 overflow-hidden">
        
        {/* Background Ambient Glow & Glass sweep */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>SIH 2026 DEMO MODE PRESENTATION</span>
          </div>

          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight">
            PRAEVISIO INTELLIGENCE DEMO
          </h2>
          <p className="text-xs sm:text-sm text-cyan-300 font-mono">
            AI-POWERED PREDICTIVE INFRASTRUCTURE MONITORING
          </p>
        </div>

        {/* Core Value Proposition Storytelling: Old Way vs PRAEVISIO Way */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* TRADITIONAL WAY CARD */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-red-500/30 space-y-3">
            <div className="text-xs font-mono font-extrabold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>TRADITIONAL MONITORING</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>1. Problem Occurs</span>
                <span className="text-red-400 font-mono text-[10px]">Delayed</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>2. Manual Reporting</span>
                <span className="text-red-400 font-mono text-[10px]">Months Late</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>3. Reactive Response</span>
                <span className="text-red-400 font-mono text-[10px]">Cost Overrun</span>
              </div>
            </div>
          </div>

          {/* THE PRAEVISIO WAY CARD */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/50 space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-cyan-400 glow-text-cyan" />
              <span>THE PRAEVISIO WAY</span>
            </div>

            <div className="space-y-2 text-xs text-slate-200 font-mono">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-cyan-300 font-bold">
                <span>PREDICT RISK</span>
                <span className="text-[10px]">AI Engine</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-purple-300 font-bold">
                <span>EXPLAIN CAUSE</span>
                <span className="text-[10px]">XAI SHAP</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 font-bold">
                <span>ACT & TRACK</span>
                <span className="text-[10px]">Accountability</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onSkip}
            className="text-xs font-mono text-slate-400 hover:text-white transition"
          >
            Skip Intro & Explore Freely
          </button>

          <CommandButton
            variant="primary"
            onClick={onStart}
            className="py-3 px-6 text-xs font-bold font-mono tracking-wider uppercase flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>START GUIDED SIH DEMO</span>
          </CommandButton>
        </div>

      </div>
    </div>
  );
};
