import React from 'react';
import { Database, ShieldCheck, Cpu, Activity, AlertTriangle, Play, Sparkles } from 'lucide-react';

interface DataPipelineVisualizationProps {
  activeStage?: number; // 0 to 6
  isScanning?: boolean;
  onRunScan?: () => void;
}

const STAGES = [
  { id: 0, label: 'INPUT', name: 'Project Intake', icon: Database },
  { id: 1, label: 'VALIDATION', name: 'Rule Engine', icon: ShieldCheck },
  { id: 2, label: 'NORMALIZATION', name: 'Data Cleanse', icon: Cpu },
  { id: 3, label: 'QUALITY CHECK', name: 'Score Matrix', icon: Activity },
  { id: 4, label: 'RISK ENGINE', name: 'SHAP Model', icon: Cpu },
  { id: 5, label: 'PREDICT', name: 'XAI Forecast', icon: Sparkles },
  { id: 6, label: 'ACT', name: 'Directive', icon: AlertTriangle },
];

export const DataPipelineVisualization: React.FC<DataPipelineVisualizationProps> = ({
  activeStage = 3,
  isScanning = false,
  onRunScan,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/60 p-6 border border-cyan-500/20 backdrop-blur-xl shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-cyan-500/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              PRAEVISIO DATA PIPELINE OPERATIONAL STREAM
            </span>
          </div>
          <h4 className="text-lg font-bold text-white tracking-wide">Data $\rightarrow$ Risk Engine Flow</h4>
        </div>

        {onRunScan && (
          <button
            onClick={onRunScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all duration-300 shadow-lg ${
              isScanning
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold hover:shadow-cyan-500/25 cursor-pointer'
            }`}
          >
            {isScanning ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                SCANNING DATA STREAMS...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                RUN DATA QUALITY SCAN
              </>
            )}
          </button>
        )}
      </div>

      {/* Pipeline Nodes Flow */}
      <div className="relative py-4 overflow-x-auto no-scrollbar">
        {/* Connecting Line background */}
        <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-800 rounded-full" />
        
        {/* Animated Active Line */}
        <div
          className={`absolute top-1/2 left-8 h-1 -translate-y-1/2 rounded-full transition-all duration-700 ${
            isScanning
              ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500'
          }`}
          style={{ width: `${(activeStage / (STAGES.length - 1)) * 88 + 6}%` }}
        />

        <div className="relative flex items-center justify-between min-w-[700px] px-2">
          {STAGES.map((stg) => {
            const Icon = stg.icon;
            const isActive = stg.id === activeStage;
            const isPassed = stg.id < activeStage;

            return (
              <div key={stg.id} className="flex flex-col items-center group relative z-10">
                {/* Node circle */}
                <div
                  className={`relative flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-500 border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110'
                      : isPassed
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                      : 'bg-slate-900 border-slate-700/60 text-slate-500'
                  }`}
                >
                  {isActive && isScanning && (
                    <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 animate-ping opacity-75" />
                  )}
                  <Icon className="h-5 w-5" />
                </div>

                {/* Node labels */}
                <div className="mt-3 text-center">
                  <span
                    className={`block font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'text-cyan-400'
                        : isPassed
                        ? 'text-purple-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {stg.label}
                  </span>
                  <span className="block text-[11px] text-slate-300 font-medium whitespace-nowrap">
                    {stg.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
