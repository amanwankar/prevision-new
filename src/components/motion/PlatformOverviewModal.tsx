import React from 'react';
import { X, TrendingUp, Zap, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface PlatformOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterApp: () => void;
}

export const PlatformOverviewModal: React.FC<PlatformOverviewModalProps> = ({
  isOpen,
  onClose,
  onEnterApp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-stagger-fade">
      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden glass-reflection max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-3">
            <span>PRAEVISIO PLATFORM ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Transforming Infrastructure Monitoring into Proactive Action
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Core capabilities designed for MoSPI, Central Ministries & Project Directors.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl hover:border-cyan-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">1. Predictive Risk Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzes physical vs financial progress gaps, contractor performance, land acquisition delays, and environmental clearances to calculate dynamic risk scores (0–100).
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">2. Explainable AI (XAI)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides transparent SHAP feature attributions, explaining exactly *why* a project score escalated and pinpointing the primary bottleneck drivers.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl hover:border-amber-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">3. Early Warning Dispatch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generates targeted early warning alerts before delays cause budget overruns, notifying senior directors, sector leads, and field inspectors.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">4. Prescriptive Action Workflows</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Formulates step-by-step mitigation protocols with officer assignment, milestone tracking, and full audit logging for MoSPI governance.
            </p>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close Overview
          </button>
          <button
            onClick={() => {
              onClose();
              onEnterApp();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all"
          >
            <span>Enter PRAEVISIO Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
