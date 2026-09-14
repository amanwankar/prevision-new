import React, { useState, useEffect } from 'react';
import { AICore } from './AICore';
import { Activity, ShieldCheck } from 'lucide-react';

interface SystemOnlineSequenceProps {
  onComplete: () => void;
}

export const SystemOnlineSequence: React.FC<SystemOnlineSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(1);

  useEffect(() => {
    // Phase 1: 0-600ms (Dark + System Initializing)
    // Phase 2: 600-1200ms (Telemetry Data Stream & Network Pulse)
    // Phase 3: 1200-1700ms (System Online)
    const t1 = setTimeout(() => setPhase(2), 550);
    const t2 = setTimeout(() => setPhase(3), 1150);
    const t3 = setTimeout(() => onComplete(), 1650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-sans pointer-events-none select-none">
      
      {/* Background Radial Light Burst */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-slate-950 to-purple-950/20 animate-pulse" />
      
      {/* Laser Scanning Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-ai-scan" />

      <div className="relative z-10 text-center space-y-5 max-w-sm w-full px-4">
        
        {/* Central Glowing AI Core */}
        <div className="flex justify-center">
          <AICore size="xl" isAnalyzing={phase < 3} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PRAEVISIO TELEMETRY INITIALIZING</span>
          </div>

          <h2 className="text-xl font-black tracking-wider text-white font-mono">
            {phase === 1 && 'CONNECTING DATA STREAMS...'}
            {phase === 2 && 'ANALYZING RISK VECTORS...'}
            {phase === 3 && 'PRAEVISIO SYSTEM ONLINE'}
          </h2>

          <p className="text-xs text-slate-400 font-mono">
            {phase === 1 && 'Ingesting national infrastructure telemetry...'}
            {phase === 2 && 'Calibrating multi-variable risk scoring engine...'}
            {phase === 3 && 'All intelligence feeds operational.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_#06b6d4]"
            style={{ width: phase === 1 ? '35%' : phase === 2 ? '75%' : '100%' }}
          />
        </div>

        {phase === 3 && (
          <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-mono font-bold animate-stagger-fade">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AUTHENTICATED • SOC SESSION ESTABLISHED</span>
          </div>
        )}

      </div>
    </div>
  );
};
