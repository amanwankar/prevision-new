import React, { useState, useEffect } from 'react';
import { AIOrbit } from './AIOrbit';
import { CheckCircle2, Cpu } from 'lucide-react';

interface AIProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  title?: string;
  projectName?: string;
}

const STAGES = [
  'Collecting project telemetry & baseline data...',
  'Analyzing physical progress variance & schedule gap...',
  'Evaluating milestone slippage & expenditure rates...',
  'Calculating multi-variable AI risk score & generating XAI narrative...'
];

export const AIProcessingModal: React.FC<AIProcessingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  title = 'AI RISK ENGINE ANALYSIS',
  projectName = 'Selected Project'
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setIsFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
            if (onClose) onClose();
          }, 600);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-5 relative overflow-hidden">
        
        {/* Top Scanning Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-ai-scan" />

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <AIOrbit size="md" />
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>{title}</span>
            </div>
            <h3 className="text-sm font-extrabold text-white">{projectName}</h3>
          </div>
        </div>

        <div className="space-y-3 py-2">
          {STAGES.map((stageText, idx) => {
            const isCurrent = idx === currentStage && !isFinished;
            const isDone = idx < currentStage || isFinished;

            return (
              <div 
                key={idx} 
                className={`flex items-center space-x-3 text-xs transition-all duration-300 ${
                  isCurrent ? 'text-cyan-300 font-bold translate-x-1' : isDone ? 'text-slate-300 font-medium' : 'text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span>{stageText}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>STATUS: {isFinished ? 'ANALYSIS COMPLETE' : 'PROCESSING TELEMETRY...'}</span>
          <span className="text-cyan-400">{Math.min(100, Math.round(((currentStage + 1) / STAGES.length) * 100))}%</span>
        </div>

      </div>
    </div>
  );
};
