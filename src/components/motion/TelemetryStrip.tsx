import React from 'react';
import { Cpu, Clock, AlertTriangle, Layers } from 'lucide-react';
import { TELEMETRY_METRICS } from '../../config/motionConfig';

interface TelemetryStripProps {
  className?: string;
}

export const TelemetryStrip: React.FC<TelemetryStripProps> = ({
  className = ''
}) => {
  return (
    <div className={`w-full max-w-5xl mx-auto px-4 ${className}`}>
      <div className="bg-slate-900/75 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-4 py-2.5 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        
        {/* Left Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <span className="text-slate-400 font-bold tracking-wider">SYSTEM STATUS:</span>
          <span className="text-emerald-400 font-bold tracking-widest uppercase">
            {TELEMETRY_METRICS.systemStatus}
          </span>
        </div>

        {/* Monitored Projects */}
        <div className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-4">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">PROJECTS MONITORED:</span>
          <span className="text-white font-bold text-sm drop-shadow-[0_0_6px_#06b6d4]">
            {TELEMETRY_METRICS.projectsMonitored}
          </span>
        </div>

        {/* Active Risk Signals */}
        <div className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-4">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">ACTIVE RISK SIGNALS:</span>
          <span className="text-amber-400 font-bold text-sm drop-shadow-[0_0_6px_#f59e0b]">
            {TELEMETRY_METRICS.activeRiskSignals}
          </span>
        </div>

        {/* Last Analysis Timestamp */}
        <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 hidden md:inline">LAST ANALYSIS:</span>
          <span className="text-purple-300 font-bold">
            {TELEMETRY_METRICS.lastAnalysis}
          </span>
        </div>

        {/* HUD System Tag */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-[10px] text-cyan-400 font-bold">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>AI CORE: ACTIVE</span>
        </div>

      </div>
    </div>
  );
};
