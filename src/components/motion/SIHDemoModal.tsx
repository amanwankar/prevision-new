import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

interface SIHDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNavigatePage: (page: string) => void;
}

const STEPS = [
  {
    step: 1,
    title: '1. System Initialization & Intelligence Boot',
    subtitle: '1.5-Second Sci-Fi Initialization',
    desc: 'PRAEVISIO boots telemetry feeds, connects data pipelines, and displays live system status indicator.',
    targetPage: 'landing',
    actionText: 'Next: Authenticate as Senior Director MoSPI'
  },
  {
    step: 2,
    title: '2. Role-Based Access Control Login',
    subtitle: 'Authorized Government Monitoring',
    desc: 'Logging in as Senior Director MoSPI grants access to national infrastructure portfolio data under strict RBAC scoping.',
    targetPage: 'login',
    actionText: 'Next: Open Command Center Dashboard'
  },
  {
    step: 3,
    title: '3. National Command Center Dashboard',
    subtitle: 'PREDICT → EXPLAIN → ACT',
    desc: 'High-level macro risk indicators, interactive India map, active alert feeds, and overall risk index (72/100).',
    targetPage: 'dashboard',
    actionText: 'Next: Select National Highway Expansion'
  },
  {
    step: 4,
    title: '4. Project Telemetry Deep-Dive',
    subtitle: 'National Highway 44 Expansion (NH-44-EXP)',
    desc: 'Detailed physical vs financial gap analytics, contractor tracking, and AI Risk Engine score.',
    targetPage: 'details',
    projectId: 'PRJ-001',
    actionText: 'Next: Execute 7-Stage Cinematic AI Telemetry'
  },
  {
    step: 5,
    title: '5. Cinematic AI Risk & XAI Explanation',
    subtitle: 'SHAP Feature Importance Attribution',
    desc: 'Transparent SHAP analysis identifies Land Acquisition (42%) and Environmental Clearance (28%) as primary delay drivers.',
    targetPage: 'details',
    projectId: 'PRJ-001',
    actionText: 'Next: Inspect Early Warnings Center'
  },
  {
    step: 6,
    title: '6. Early Warning & Prescriptive Actions',
    subtitle: 'Automated Action Protocol Dispatch',
    desc: 'System dispatches targeted alerts and Formulates actionable mitigation workflows for assigned officers.',
    targetPage: 'alerts',
    actionText: 'Next: Generate Official MoSPI Executive Report'
  },
  {
    step: 7,
    title: '7. Official MoSPI Executive Reporting & Audit Log',
    subtitle: 'Complete Auditability & Data Export',
    desc: 'Generates standardized MoSPI monthly monitoring reports with full immutable system audit log records.',
    targetPage: 'reports',
    actionText: 'Finish SIH 2026 Presentation Tour'
  }
];

export const SIHDemoModal: React.FC<SIHDemoModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNavigatePage
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStep.projectId) {
      onSelectProject(currentStep.projectId);
    } else if (currentStep.targetPage) {
      onNavigatePage(currentStep.targetPage);
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full p-4 animate-stagger-fade">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden glass-reflection text-slate-100">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SIH 2026 PRESENTATION MODE</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center space-x-1.5 mb-4">
          {STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                  : idx < currentStepIndex
                  ? 'w-3 bg-purple-500'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-base font-extrabold text-white">
            {currentStep.title}
          </h3>
          <p className="text-xs text-cyan-300 font-mono font-semibold">
            {currentStep.subtitle}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentStep.desc}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-all"
          >
            <span>{currentStep.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
