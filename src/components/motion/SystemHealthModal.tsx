import React from 'react';
import { X, Cpu, Database, Activity, CheckCircle2, Lock } from 'lucide-react';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-stagger-fade font-sans">
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden glass-reflection text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">System Operational Status</h2>
              <p className="text-xs text-slate-400 font-mono">PRAEVISIO Monitoring Diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules Grid */}
        <div className="my-6 space-y-3 font-mono text-xs">
          
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-white">AI PREDICTIVE ENGINE</div>
                <div className="text-[10px] text-slate-400">XAI SHAP Feature Analysis</div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>ONLINE</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Database className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-bold text-white">PROJECT REPOSITORY DB</div>
                <div className="text-[10px] text-slate-400">Telemetry Sync Stream</div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>CONNECTED</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Activity className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-bold text-white">RISK CALCULATION ENGINE</div>
                <div className="text-[10px] text-slate-400">0-100 Score Matrix</div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>ACTIVE</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-white">AUDIT & RBAC SERVICE</div>
                <div className="text-[10px] text-slate-400">Immutable Log Security</div>
              </div>
            </div>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>VERIFIED</span>
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Overall Health: <strong className="text-emerald-400">100% OPERATIONAL</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
