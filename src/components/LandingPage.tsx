import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, Play, Info } from 'lucide-react';
import { IntelligenceField } from './background/IntelligenceField';
import { CursorGlow } from './background/CursorGlow';
import { AICore } from './motion/AICore';
import { FloatingSignals } from './motion/FloatingSignals';
import { TelemetryStrip } from './motion/TelemetryStrip';
import { PlatformOverviewModal } from './motion/PlatformOverviewModal';

interface LandingPageProps {
  onEnterApp: () => void;
  onStartDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onStartDemo }) => {
  const [bootPhase, setBootPhase] = useState<number>(0); // 0 = booting, 1 = ready
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [showOverviewModal, setShowOverviewModal] = useState<boolean>(false);
  const [aiState, setAiState] = useState<'IDLE' | 'PROCESSING' | 'ANALYZING'>('IDLE');

  // Check sessionStorage for cached boot sequence
  useEffect(() => {
    const isBooted = sessionStorage.getItem('praevisio_boot_cached');
    if (isBooted) {
      setBootPhase(1);
      setBootProgress(100);
      return;
    }

    // 1.5 - 2s progressive boot animation
    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBootPhase(1);
          sessionStorage.setItem('praevisio_boot_cached', 'true');
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleSkipBoot = () => {
    setBootPhase(1);
    setBootProgress(100);
    sessionStorage.setItem('praevisio_boot_cached', 'true');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* PRAEVISIO Multi-Layer Intelligence Field */}
      <IntelligenceField projectState="normal" />

      {/* Desktop Mouse Parallax Glow */}
      <CursorGlow />

      {/* INITIAL SYSTEM BOOT OVERLAY (1.5s max) */}
      {bootPhase === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-sans pointer-events-auto">
          <div className="relative z-10 text-center space-y-6 max-w-md w-full px-6">
            
            <div className="flex justify-center">
              <AICore size="xl" isAnalyzing={true} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>PRAEVISIO SYSTEM INITIALIZING</span>
              </div>

              <h1 className="text-2xl font-black tracking-wider text-white font-mono">
                PRAEVISIO
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wide">
                INFRASTRUCTURE INTELLIGENCE PLATFORM
              </p>
            </div>

            {/* Boot Status Stream */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-left font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI ENGINE:</span>
                <span className={bootProgress >= 25 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {bootProgress >= 25 ? '● ONLINE' : 'LOADING...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PROJECT MONITOR:</span>
                <span className={bootProgress >= 50 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {bootProgress >= 50 ? '● ONLINE' : 'LOADING...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">RISK ENGINE:</span>
                <span className={bootProgress >= 75 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {bootProgress >= 75 ? '● ONLINE' : 'LOADING...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">EARLY WARNING:</span>
                <span className={bootProgress >= 90 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {bootProgress >= 90 ? '● ONLINE' : 'LOADING...'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 transition-all duration-200 ease-out rounded-full shadow-[0_0_12px_#06b6d4]"
                style={{ width: `${bootProgress}%` }}
              />
            </div>

            <button
              onClick={handleSkipBoot}
              className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 underline underline-offset-4 transition-colors"
            >
              [ SKIP INITIALIZATION ]
            </button>

          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50">
            P
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white">PRAEVISIO</h1>
            <p className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">
              MoSPI National Monitoring Platform
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onStartDemo}
            className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-mono font-bold shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>SIH DEMO MODE</span>
          </button>

          <button
            onClick={onEnterApp}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 hover:text-white hover:bg-cyan-500/20 text-xs font-bold font-sans tracking-wide transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center space-x-2"
          >
            <span>OFFICER LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION WITH CENTRAL PRAEVISIO AI CORE */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto w-full">
        
        {/* Central AI Core Visualization Container */}
        <div className="relative mb-8 flex justify-center items-center">
          <AICore 
            size="hero" 
            state={aiState}
            showLabel={true}
            onClick={() => {
              setAiState(prev => prev === 'IDLE' ? 'PROCESSING' : prev === 'PROCESSING' ? 'ANALYZING' : 'IDLE');
            }}
          />
          <FloatingSignals />
        </div>

        {/* Hero Headlines */}
        <div className="space-y-4 max-w-3xl">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase shadow-inner">
            <span>PREDICT</span>
            <span className="text-purple-400">→</span>
            <span>EXPLAIN</span>
            <span className="text-purple-400">→</span>
            <span>ACT</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_0_35px_rgba(255,255,255,0.15)] break-words-safe">
            AI-POWERED INFRASTRUCTURE INTELLIGENCE
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
            Transform infrastructure project monitoring from reactive reporting into proactive decision-making for Ministry and Monitoring Authorities.
          </p>

        </div>

        {/* Primary & Secondary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          
          {/* Primary CTA: ENTER PRAEVISIO */}
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-400/60 hover:scale-105 hover:shadow-[0_0_45px_rgba(6,182,212,0.6)] transition-all cursor-pointer group glass-reflection"
          >
            <span>ENTER PRAEVISIO</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA: EXPLORE PLATFORM */}
          <button
            onClick={() => setShowOverviewModal(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 text-xs font-bold font-sans tracking-wide flex items-center justify-center space-x-2 transition-all hover:bg-slate-800"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE PLATFORM</span>
          </button>

        </div>

      </main>

      {/* BOTTOM TELEMETRY STRIP */}
      <footer className="relative z-20 w-full pb-6 pt-2">
        <TelemetryStrip />
      </footer>

      {/* EXPLORE PLATFORM MODAL OVERLAY */}
      <PlatformOverviewModal
        isOpen={showOverviewModal}
        onClose={() => setShowOverviewModal(false)}
        onEnterApp={onEnterApp}
      />

    </div>
  );
};
