import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import type { DataQualityIssue } from '../../services/dataQualityService';

interface DataQualitySignalsProps {
  issues: DataQualityIssue[];
  onFixIssue?: (issue: DataQualityIssue) => void;
}

export const DataQualitySignals: React.FC<DataQualitySignalsProps> = ({
  issues,
  onFixIssue,
}) => {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-6 text-center">
        <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-base font-bold text-emerald-300">ZERO VALIDATION SIGNALS</h4>
        <p className="text-xs text-emerald-400/80 mt-1 max-w-md mx-auto">
          All mandatory infrastructure parameters, timeline dates, and financial metrics pass standard validation checks.
        </p>
      </div>
    );
  }

  const criticals = issues.filter((i) => i.severity === 'CRITICAL');
  const warnings = issues.filter((i) => i.severity === 'WARNING');
  const infos = issues.filter((i) => i.severity === 'INFO');

  const getSeverityBadge = (sev: DataQualityIssue['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          icon: AlertOctagon,
          iconColor: 'text-rose-400',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        };
      case 'INFO':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
          icon: Info,
          iconColor: 'text-cyan-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-amber-400" />
          DATA QUALITY SIGNALS ({issues.length})
        </h4>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-rose-400 font-bold">{criticals.length} CRITICAL</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">{warnings.length} WARNING</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">{infos.length} INFO</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {issues.map((issue) => {
          const style = getSeverityBadge(issue.severity);
          const Icon = style.icon;

          return (
            <div
              key={issue.id}
              className={`rounded-xl p-4 border transition-all duration-300 ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-5 w-5 shrink-0 ${style.iconColor}`} />
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {issue.severity} • {issue.category} • {issue.field}
                    </span>
                    <h5 className="text-sm font-bold text-white">{issue.problem}</h5>
                  </div>
                </div>

                {onFixIssue && (
                  <button
                    onClick={() => onFixIssue(issue)}
                    className="shrink-0 flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    RESOLVE <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs border-t border-slate-800/60 pt-2.5">
                <div>
                  <span className="text-slate-400 font-semibold">IMPACT ON RISK ENGINE:</span>
                  <p className="text-slate-300 mt-0.5">{issue.whyItMatters}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">SUGGESTED CORRECTION:</span>
                  <p className="text-emerald-300/90 mt-0.5">{issue.suggestedAction}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
