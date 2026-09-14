import React from 'react';
import type { VisualNode } from '../../services/infrastructureVisualizationService';
import { calculateProjectHealthRadar } from '../../services/infrastructureVisualizationService';
import { 
  X, 
  ArrowUpRight, 
  AlertOctagon, 
  Lightbulb, 
  Calendar, 
  IndianRupee, 
  Activity, 
  AlertTriangle,
  Building2,
  MapPin,
  Cpu,
  Sparkles
} from 'lucide-react';
import { CommandButton } from '../common/CommandButton';

interface ProjectIntelligenceDrawerProps {
  node: VisualNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onSelectAction?: (actionId: string) => void;
}

export const ProjectIntelligenceDrawer: React.FC<ProjectIntelligenceDrawerProps> = ({
  node,
  isOpen,
  onClose,
  onSelectProject,
  onSelectAlert,
  onSelectAction,
}) => {
  if (!isOpen || !node) return null;

  const healthData = calculateProjectHealthRadar(node);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400 border-red-500/40 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    if (score >= 65) return 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
    if (score >= 45) return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col no-print animate-slideLeft">
      
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>PROJECT INTELLIGENCE RECORD</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{node.code}</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1 leading-tight">{node.name}</h2>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>{node.department}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{node.state}</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800/80 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        
        {/* Risk & Health Overview Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI Risk Score</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white font-mono">{node.riskScore}</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-black font-mono uppercase tracking-wider ${getRiskColor(node.riskScore)}`}>
              {node.riskLevel} RISK
            </div>
          </div>

          {/* Progress Bar & Gap */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Physical Progress:</span>
              <span className="text-white font-bold">{node.actualPhysicalProgress}% <span className="text-slate-500">(Target {node.targetPhysicalProgress}%)</span></span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${node.actualPhysicalProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono pt-0.5">
              <span className="text-slate-500">GAP DEVIATION</span>
              <span className={node.progressGap < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {node.progressGap > 0 ? `+${node.progressGap}% Ahead` : `${node.progressGap}% Delayed`}
              </span>
            </div>
          </div>
        </div>

        {/* Health Index Category Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Dimensional Health Index</span>
            </h4>
            <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              {healthData.overallIndex} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {healthData.categories.map((cat) => (
              <div key={cat.key} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>{cat.key}</span>
                  <span className="font-bold font-mono" style={{ color: cat.color }}>{cat.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Financial Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-mono uppercase font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Impact</span>
            </div>
            <div className="text-lg font-black text-white font-mono">+{node.delayDays} <span className="text-xs font-normal text-slate-400">days</span></div>
            <div className="text-[10px] text-slate-400 font-mono">Primary Driver: {node.primaryRisk}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-teal-400 text-[10px] font-mono uppercase font-bold">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Budget Outlay</span>
            </div>
            <div className="text-lg font-black text-white font-mono">₹{node.expenditureToDateCr} Cr</div>
            <div className="text-[10px] text-slate-400 font-mono">{node.budgetUtilizationPct}% of ₹{node.originalBudgetCr} Cr</div>
          </div>
        </div>

        {/* Explainable AI (XAI) - WHY IS THIS PROJECT AT RISK? */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-extrabold uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400 glow-text-cyan" />
            <span>WHY IS THIS PROJECT AT RISK?</span>
          </div>

          <div className="space-y-2 pt-1 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Progress Deviation</span>
                <span className="text-[11px] text-slate-400">Physical execution is lagging behind scheduled milestones by {Math.abs(node.progressGap)}%.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Critical Path Delay</span>
                <span className="text-[11px] text-slate-400">Projected completion extended by {node.delayDays} days due to site clearance bottlenecks.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Warning Badge & CTA */}
        {node.warningCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">{node.warningCount} Active Early Warning Signal</div>
                <div className="text-[10px] font-mono text-red-300 uppercase">{node.activeWarningSeverity || 'High'} Severity Trigger</div>
              </div>
            </div>
            {node.activeWarningId && onSelectAlert && (
              <CommandButton
                variant="ghost"
                size="sm"
                onClick={() => onSelectAlert(node.activeWarningId!)}
                className="text-xs text-red-300 hover:text-white"
              >
                Inspect
              </CommandButton>
            )}
          </div>
        )}

        {/* Pending Action Badge & CTA */}
        {node.actionCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">{node.actionCount} Pending Operational Response</div>
                <div className="text-[10px] font-mono text-amber-300 uppercase">{node.pendingActionPriority || 'High'} Priority</div>
              </div>
            </div>
            {node.pendingActionId && onSelectAction && (
              <CommandButton
                variant="ghost"
                size="sm"
                onClick={() => onSelectAction(node.pendingActionId!)}
                className="text-xs text-amber-300 hover:text-white"
              >
                Execute
              </CommandButton>
            )}
          </div>
        )}

      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 flex items-center space-x-3">
        <CommandButton
          variant="primary"
          onClick={() => onSelectProject(node.id)}
          className="flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <span>OPEN PROJECT INTELLIGENCE</span>
          <ArrowUpRight className="w-4 h-4" />
        </CommandButton>
      </div>

    </div>
  );
};
