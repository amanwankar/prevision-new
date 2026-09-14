import React from 'react';
import { ShieldAlert, Play, CheckCircle2, HelpCircle, Lock } from 'lucide-react';
import type { RiskReadiness } from '../../services/dataQualityService';

interface RiskReadinessPanelProps {
  readiness: RiskReadiness;
  onRunRiskAnalysis: () => void;
  isExecuting?: boolean;
}

export const RiskReadinessPanel: React.FC<RiskReadinessPanelProps> = ({
  readiness,
  onRunRiskAnalysis,
  isExecuting = false,
}) => {
  const { state, explanation, missingParameters, canRunRiskAnalysis } = readiness;

  const getStateStyle = () => {
    switch (state) {
      case 'READY':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          border: 'border-emerald-500/30',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
      case 'READY WITH WARNINGS':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/30',
          icon: CheckCircle2,
          iconColor: 'text-cyan-400',
        };
      case 'LIMITED':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          border: 'border-amber-500/30',
          icon: HelpCircle,
          iconColor: 'text-amber-400',
        };
      case 'BLOCKED':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-rose-500/30',
          icon: Lock,
          iconColor: 'text-rose-400',
        };
    }
  };

  const style = getStateStyle();
  const Icon = style.icon;

  return (
    <div className={`rounded-xl bg-black/60 border ${style.border} p-5 backdrop-blur-md`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            RISK ANALYSIS READINESS
          </h4>
        </div>
        <span
          className={`px-3 py-1 rounded-full font-mono text-xs font-bold border uppercase tracking-wider ${style.badge}`}
        >
          {state}
        </span>
      </div>

      <div className="flex items-start gap-3 my-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconColor}`} />
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{explanation}</p>
      </div>

      {missingParameters.length > 0 && (
        <div className="my-3 p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
          <span className="block font-mono text-[10px] uppercase font-bold text-rose-400 mb-1">
            MISSING OR INVALID INPUT PARAMETERS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingParameters.map((param, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-rose-900/40 border border-rose-500/30 text-[11px] font-mono text-rose-300"
              >
                {param}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-400">
          GATEWAY: <span className="text-cyan-400">DATA VERIFIED $\rightarrow$ ANALYSIS READY</span>
        </div>

        <button
          onClick={onRunRiskAnalysis}
          disabled={!canRunRiskAnalysis || isExecuting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-extrabold transition-all duration-300 shadow-lg ${
            !canRunRiskAnalysis
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : isExecuting
              ? 'bg-purple-600/50 text-purple-200 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold shadow-cyan-500/20 hover:shadow-cyan-500/40 cursor-pointer'
          }`}
        >
          {isExecuting ? (
            <>
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              EXECUTING RISK ENGINE...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              RUN RISK ANALYSIS
            </>
          )}
        </button>
      </div>
    </div>
  );
};
