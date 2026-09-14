import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  X, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff
} from 'lucide-react';
import type { DemoStep } from '../../services/sihDemoService';

interface SIHDemoControlBarProps {
  steps: DemoStep[];
  currentStepIndex: number;
  isAutoPlay: boolean;
  isAudienceView: boolean;
  isPresentationMode: boolean;
  onSelectStep: (index: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onToggleAutoPlay: () => void;
  onToggleAudienceView: () => void;
  onTogglePresentationMode: () => void;
  onExitDemo: () => void;
}

export const SIHDemoControlBar: React.FC<SIHDemoControlBarProps> = ({
  steps,
  currentStepIndex,
  isAutoPlay,
  isAudienceView,
  isPresentationMode,
  onSelectStep,
  onPrevStep,
  onNextStep,
  onToggleAutoPlay,
  onToggleAudienceView,
  onTogglePresentationMode,
  onExitDemo,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4 no-print animate-slideUp">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 p-3 sm:p-4 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.35)] flex flex-col space-y-3 text-slate-100">
        
        {/* Step Buttons Timeline */}
        <div className="flex items-center justify-between space-x-1 overflow-x-auto scrollbar-none pb-1">
          {steps.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={s.id}
                onClick={() => onSelectStep(idx)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all duration-200 whitespace-nowrap flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
                    : isCompleted
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-xs font-mono">
          
          {/* Left Navigation Steppers */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>

            <button
              onClick={onNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition"
            >
              <span>NEXT STEP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Auto Play / Pause */}
            <button
              onClick={onToggleAutoPlay}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition ${
                isAutoPlay
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlay ? 'PAUSE AUTO' : 'AUTO PLAY'}</span>
            </button>
          </div>

          {/* Right Presentation Toggles */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <button
              onClick={onToggleAudienceView}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 transition"
              title="Toggle Presenter Instructions"
            >
              {isAudienceView ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isAudienceView ? 'Audience' : 'Presenter'}</span>
            </button>

            {/* Presentation Mode Toggle */}
            <button
              onClick={onTogglePresentationMode}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 transition"
              title="Toggle Presentation Mode (Hide Sidebar/Navbar)"
            >
              {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>Full UI</span>
            </button>

            {/* Exit Demo */}
            <button
              onClick={onExitDemo}
              className="px-2 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:text-white transition flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
