import React from 'react';
import type { CopilotMessage } from '../../services/copilotService';
import type { Project, EarlyWarning, RecommendedAction } from '../../types';
import { 
  ArrowUpRight, 
  ExternalLink
} from 'lucide-react';

interface CopilotResponseRendererProps {
  message: CopilotMessage;
  onNavigate: (page: string, hash?: string, id?: string) => void;
  onFollowUpClick: (query: string) => void;
}

export const CopilotResponseRenderer: React.FC<CopilotResponseRendererProps> = ({
  message,
  onNavigate,
  onFollowUpClick
}) => {
  const { responseType, data, deepLinks, followUpQuestions, dataSources, text } = message;

  return (
    <div className="space-y-3.5 text-xs text-slate-200">
      
      {/* Intro Text / Natural Language Overview */}
      {text && (
        <div className="leading-relaxed whitespace-pre-line font-medium text-slate-100">
          {text}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONSE TYPE 1: PROJECT CARDS                                */}
      {/* ------------------------------------------------------------- */}
      {responseType === 'project_cards' && data?.projects && (
        <div className="space-y-2.5 my-2">
          {data.projects.map((proj: Project) => {
            const gap = Math.max(0, proj.targetPhysicalProgress - proj.actualPhysicalProgress);
            const isHigh = proj.riskScore >= 75;

            return (
              <div
                key={proj.id}
                onClick={() => onNavigate('details', `#/projects/${proj.id}`, proj.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isHigh ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/60' : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                  <span>{proj.code} • {proj.state}</span>
                  <span className={`px-2 py-0.2 rounded font-bold ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    RISK {proj.riskScore}/100
                  </span>
                </div>

                <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                  {proj.name}
                </div>

                <div className="grid grid-cols-3 gap-2 my-2 text-[10px] font-mono bg-slate-900/90 p-2 rounded border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 uppercase block">Actual</span>
                    <span className="text-white font-bold">{proj.actualPhysicalProgress}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Gap</span>
                    <span className="text-red-400 font-bold">-{gap}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Delay</span>
                    <span className="text-amber-300 font-bold">+{proj.delayDays}d</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-semibold pt-1">
                  <span>View Project Intelligence</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONSE TYPE 2: WARNING CARDS                                */}
      {/* ------------------------------------------------------------- */}
      {responseType === 'warning_cards' && data?.alerts && (
        <div className="space-y-2 my-2">
          {data.alerts.map((alert: EarlyWarning) => (
            <div
              key={alert.id}
              onClick={() => onNavigate('alert_details', `#/alerts/${alert.id}`, alert.id)}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-red-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alert.severity} SEVERITY
                </span>
                <span className="text-[10px] font-mono text-slate-500">{alert.timeAgo}</span>
              </div>
              <div className="font-bold text-white text-xs group-hover:text-red-300 transition-colors">
                {alert.title}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-red-400 font-bold pt-2">
                <span>Inspect Alert File</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONSE TYPE 3: ACTION CARDS                                 */}
      {/* ------------------------------------------------------------- */}
      {responseType === 'action_cards' && data?.actions && (
        <div className="space-y-2 my-2">
          {data.actions.map((action: RecommendedAction) => (
            <div
              key={action.id}
              onClick={() => onNavigate('action_details', `#/actions/${action.id}`, action.id)}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {action.priority} PRIORITY
                </span>
                <span className="text-[10px] font-mono text-slate-400">{action.status}</span>
              </div>
              <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                {action.title}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{action.rationale}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold pt-2">
                <span>Execute Action Response</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONSE TYPE 4: COMPARISON TABLE                             */}
      {/* ------------------------------------------------------------- */}
      {responseType === 'comparison_table' && data?.projects && (
        <div className="my-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900 font-mono text-cyan-400 border-b border-slate-800">
              <tr>
                <th className="p-2">METRIC</th>
                {data.projects.map((p: Project) => (
                  <th key={p.id} className="p-2 text-white">{p.code}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="p-2 text-slate-400">Risk Score</td>
                {data.projects.map((p: Project) => (
                  <td key={p.id} className={`p-2 font-bold ${p.riskScore >= 75 ? 'text-red-400' : 'text-amber-400'}`}>{p.riskScore}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 text-slate-400">Actual Progress</td>
                {data.projects.map((p: Project) => (
                  <td key={p.id} className="p-2 text-white">{p.actualPhysicalProgress}%</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 text-slate-400">Target Progress</td>
                {data.projects.map((p: Project) => (
                  <td key={p.id} className="p-2 text-slate-300">{p.targetPhysicalProgress}%</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 text-slate-400">Delay Forecast</td>
                {data.projects.map((p: Project) => (
                  <td key={p.id} className="p-2 text-amber-300">+{p.delayDays} days</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 text-slate-400">Cost Overrun</td>
                {data.projects.map((p: Project) => (
                  <td key={p.id} className="p-2 text-purple-300">₹{p.costOverrunForecastCr} Cr</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONSE TYPE 5: PORTFOLIO SUMMARY                            */}
      {/* ------------------------------------------------------------- */}
      {responseType === 'portfolio_summary' && data?.metrics && (
        <div className="space-y-3 my-2">
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Monitored</div>
              <div className="text-lg font-black text-white">{data.totalProjects}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-[10px] text-red-400 uppercase">High Risk</div>
              <div className="text-lg font-black text-red-400">{data.metrics.highRiskCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Active Alerts</div>
              <div className="text-lg font-black text-amber-400">{data.activeAlertsCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DATA CITATION FOOTER                                          */}
      {/* ------------------------------------------------------------- */}
      {dataSources && dataSources.length > 0 && (
        <div className="text-[9px] font-mono text-slate-500 border-t border-slate-800/80 pt-2 flex items-center space-x-1">
          <span className="text-cyan-400">DATA BASIS:</span>
          <span>{dataSources.join(' • ')}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONTEXT DEEP LINKS                                            */}
      {/* ------------------------------------------------------------- */}
      {deepLinks && deepLinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {deepLinks.map((dl, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(dl.targetPage, dl.hash, dl.targetId)}
              className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center space-x-1 transition-all"
            >
              <span>{dl.label}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUGGESTED FOLLOW-UP QUESTIONS                                  */}
      {/* ------------------------------------------------------------- */}
      {followUpQuestions && followUpQuestions.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">RELATED QUERY SUGGESTIONS:</div>
          <div className="flex flex-wrap gap-1.5">
            {followUpQuestions.map((fq, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick(fq)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[10px] font-medium transition-all text-left hover:text-white hover:border-cyan-500/50"
              >
                {fq}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
