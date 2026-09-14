import React, { useState, useEffect } from 'react';
import { AICore } from './AICore';
import { CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

interface CinematicAISequenceModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  projectName?: string;
  targetRiskScore?: number;
}

const CINEMATIC_STAGES = [
  { id: 1, title: 'DATA INGESTION', detail: 'Ingesting IoT telemetry, satellite progress imagery & contractor logs...' },
  { id: 2, title: 'PROJECT ANALYSIS', detail: 'Evaluating baseline schedule variance & physical progress gap...' },
  { id: 3, title: 'RISK DETECTION', detail: 'Correlating delayed milestones & financial expenditure rates...' },
  { id: 4, title: 'PREDICTION', detail: 'Computing multi-variable PRAEVISIO AI risk score & variance model...' },
  { id: 5, title: 'EXPLANATION', detail: 'Synthesizing SHAP feature weights & explainable risk narrative...' },
  { id: 6, title: 'EARLY WARNING', detail: 'Dispatching automated early warning alert protocol...' },
  { id: 7, title: 'RECOMMENDED ACTION', detail: 'Formulating optimal mitigation action plan...' }
];

export const CinematicAISequenceModal: React.FC<CinematicAISequenceModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  projectName = 'Selected Infrastructure Project',
  targetRiskScore = 82
}) => {
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStageIndex(0);
      setDisplayScore(0);
      setIsFinished(false);
      return;
    }

    const stageDuration = 340; // ~2.4 seconds total sequence duration
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < CINEMATIC_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
            if (onClose) onClose();
          }, 800);
          return prev;
        }
      });
    }, stageDuration);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, onClose]);

  // Synchronized score count-up during Prediction stage
  useEffect(() => {
    if (stageIndex >= 3) {
      const step = Math.ceil(targetRiskScore / 10);
      const scoreTimer = setInterval(() => {
        setDisplayScore((prev) => {
          if (prev < targetRiskScore) {
            return Math.min(targetRiskScore, prev + step);
          }
          clearInterval(scoreTimer);
          return targetRiskScore;
        });
      }, 30);
      return () => clearInterval(scoreTimer);
    }
  }, [stageIndex, targetRiskScore]);

  if (!isOpen) return null;

  const currentStageObj = CINEMATIC_STAGES[stageIndex];
  const progressPercent = Math.min(100, Math.round(((stageIndex + 1) / CINEMATIC_STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl font-sans">
      
      {/* Outer Glow Container */}
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-6 relative overflow-hidden glass-reflection">
        
        {/* Animated Top Laser Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-ai-scan" />

        {/* Header with AI Core */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <AICore size="lg" isAnalyzing={!isFinished} />
          
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>PRAEVISIO AI RISK TELEMETRY</span>
            </div>
            <h3 className="text-base font-extrabold text-white leading-tight">{projectName}</h3>
          </div>
        </div>

        {/* Dynamic Multi-Stage Timeline */}
        <div className="space-y-2.5 py-1">
          {CINEMATIC_STAGES.map((stg, idx) => {
            const isCurrent = idx === stageIndex && !isFinished;
            const isDone = idx < stageIndex || isFinished;

            return (
              <div 
                key={stg.id}
                className={`flex items-start space-x-3 text-xs p-2 rounded-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold translate-x-1 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : isDone 
                    ? 'text-slate-300 font-medium' 
                    : 'text-slate-600 opacity-40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase">
                    <span>STAGE 0{stg.id} • {stg.title}</span>
                    {isCurrent && <span className="text-cyan-400 animate-pulse">PROCESSING</span>}
                  </div>
                  {isCurrent && <p className="text-[11px] font-normal text-slate-300 mt-0.5">{stg.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-Time Score Count-up Card during Prediction Stage */}
        {stageIndex >= 3 && (
          <div className="bg-slate-950 p-4 rounded-xl border border-orange-500/40 flex items-center justify-between animate-stagger-fade">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PREDICTED RISK SCORE</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black font-mono text-orange-400">{displayScore}</span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold rounded border border-orange-500/40">
                  HIGH RISK
                </span>
              </div>
            </div>

            <ShieldAlert className="w-7 h-7 text-orange-400 animate-pulse" />
          </div>
        )}

        {/* Footer Progress & Status */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>TELEMETRY STAGE: {currentStageObj.title}</span>
          <span className="text-cyan-400 font-bold">{progressPercent}%</span>
        </div>

      </div>
    </div>
  );
};
