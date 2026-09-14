import React, { useState } from 'react';
import type { Project, EarlyWarning, RecommendedAction, User } from '../../types';
import { getExecutionIntelligence } from '../../services/executionIntelligenceService';
import { IntelligenceField } from '../background/IntelligenceField';
import { ProjectExecutionField } from './ProjectExecutionField';
import { ExecutionControlLoop } from './ExecutionControlLoop';
import { PlanVsRealityChart } from './PlanVsRealityChart';
import { ProjectHealthRing } from './ProjectHealthRing';
import { MilestoneControlTable } from './MilestoneControlTable';
import { 
  ArrowLeft, 
  Activity, 
  ShieldAlert, 
  AlertOctagon, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  IndianRupee,
  ArrowUpRight
} from 'lucide-react';

interface ProjectExecutionControlCenterProps {
  project: Project;
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  currentUser?: User | null;
  onBack: () => void;
  onNavigatePage: (page: string, hash?: string, id?: string) => void;
  onOpenCopilot?: () => void;
}

export const ProjectExecutionControlCenter: React.FC<ProjectExecutionControlCenterProps> = ({
  project,
  alerts = [],
  actions = [],
  onBack,
  onOpenCopilot
}) => {
  const [isExecutiveFocus, setIsExecutiveFocus] = useState(false);

  const intel = getExecutionIntelligence(project, alerts, actions);
  const { scorecard, dimensions, executionSignals, riskAnalysis, dataQualityResult, priorities, controlLoopStage } = intel;

  // Background mapping for IntelligenceField
  const bgState = intel.overallHealthState === 'CRITICAL' ? 'critical'
    : intel.overallHealthState === 'HIGH RISK' ? 'high_risk'
    : intel.overallHealthState === 'WATCH' ? 'warning'
    : intel.overallHealthState === 'DATA ISSUE' ? 'warning'
    : 'calm';

  return (
    <div className={`space-y-8 font-sans relative min-h-screen text-slate-100 pb-24 ${isExecutiveFocus ? 'p-8 bg-slate-950 fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      
      {/* Dynamic Background Atmosphere */}
      <IntelligenceField projectState={bgState} />

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO PROJECT</span>
          </button>

          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center space-x-1">
              <span>PRAEVISIO EXECUTION CONTROL CENTER</span>
              <span className="text-slate-600">•</span>
              <span>DEPARTMENT: {project.department}</span>
            </div>
            <h1 className="text-xl font-black text-white font-mono tracking-tight flex items-center space-x-2">
              <span>{project.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-normal">
                {project.code}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls & Focus Mode Toggle */}
        <div className="flex items-center space-x-2">
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ASK COPILOT</span>
            </button>
          )}

          <button
            onClick={() => setIsExecutiveFocus(!isExecutiveFocus)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            {isExecutiveFocus ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isExecutiveFocus ? 'EXIT FOCUS MODE' : 'EXECUTIVE FOCUS'}</span>
          </button>
        </div>
      </div>

      {/* 2. HERO — PROJECT EXECUTION INTELLIGENCE */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">HERO INTELLIGENCE HUD</span>
              <h2 className="text-lg font-black text-white font-mono tracking-wide">EXECUTION INTELLIGENCE</h2>
              <p className="text-xs text-slate-400">Monitor project execution, identify deviations, and prioritize intervention.</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Overall Health</span>
              <span className="text-sm font-extrabold text-cyan-300 block mt-0.5">{intel.overallHealthState}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Schedule Status</span>
              <span className="text-sm font-extrabold text-white block mt-0.5 truncate">{dimensions.schedule.state}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Financial Status</span>
              <span className="text-sm font-extrabold text-white block mt-0.5 truncate">{dimensions.financial.state}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Data Quality</span>
              <span className="text-sm font-extrabold text-purple-300 block mt-0.5">{dataQualityResult.overallScore}% Score</span>
            </div>
          </div>

          {/* Connected Network Field */}
          <ProjectExecutionField 
            project={project}
            milestones={project.milestones}
            warnings={alerts}
            actions={actions}
            riskScore={riskAnalysis.riskScore}
          />
        </div>

        {/* Control Loop Indicator */}
        <div className="lg:col-span-1">
          <ExecutionControlLoop currentStage={controlLoopStage} />
        </div>
      </div>

      {/* 3. PROJECT HEALTH INDEX */}
      <div className="relative z-10">
        <ProjectHealthRing
          overallHealthState={intel.overallHealthState}
          overallScore={intel.overallHealthScore}
          dimensions={dimensions}
        />
      </div>

      {/* 5. EXECUTION SCORECARD */}
      <div className="relative z-10 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white font-mono tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>EXECUTION SCORECARD</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Validated Application Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Planned Progress</span>
            <span className="text-base font-extrabold text-cyan-300 block mt-1">{scorecard.plannedProgress}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Actual Progress</span>
            <span className="text-base font-extrabold text-white block mt-1">{scorecard.actualProgress}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Progress Gap</span>
            <span className={`text-base font-extrabold block mt-1 ${scorecard.progressGap < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {scorecard.progressGap > 0 ? '+' : ''}{scorecard.progressGap}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Approved Budget</span>
            <span className="text-base font-extrabold text-white block mt-1">
              {scorecard.hasFinancialData ? `₹${scorecard.approvedBudgetCr} Cr` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Actual Expenditure</span>
            <span className="text-base font-extrabold text-white block mt-1">
              {scorecard.hasFinancialData ? `₹${scorecard.expenditureToDateCr} Cr` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Milestones Delayed</span>
            <span className="text-base font-extrabold text-amber-400 block mt-1">
              {scorecard.delayedMilestones} / {scorecard.totalMilestones}
            </span>
          </div>
        </div>
      </div>

      {/* 6. PLAN VS REALITY & EXECUTION SIGNALS */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlanVsRealityChart data={intel.planVsReality} />
        </div>

        {/* Execution Signals Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-3 font-mono text-xs">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>EXECUTION SIGNALS</span>
            </h3>
            <p className="text-[10px] text-slate-400">Automated execution anomaly detection</p>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {executionSignals.map((sig) => (
              <div key={sig.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{sig.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    sig.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {sig.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{sig.explanation}</p>
                <div className="text-[9px] text-cyan-400 pt-1 font-semibold">Review: {sig.recommendedReview}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. AI EXECUTION INTELLIGENCE (XAI) & WHAT NEEDS ATTENTION */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* XAI Attribution Panel */}
        <div className="bg-slate-900/90 rounded-2xl border border-purple-500/30 p-6 shadow-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">PRAEVISIO EXECUTION XAI</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Confidence: {riskAnalysis.confidenceScore}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="text-purple-300 font-bold">XAI Summary:</div>
            <p className="text-slate-300 leading-relaxed">{riskAnalysis.explanation.summary}</p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">{riskAnalysis.explanation.detailedAnalysis}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Top SHAP Risk Factors:</div>
            {riskAnalysis.riskFactors.slice(0, 3).map((rf) => (
              <div key={rf.name} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{rf.name}</span>
                  <span className="text-[10px] text-slate-400 block">{rf.explanation}</span>
                </div>
                <span className="text-sm font-extrabold text-purple-400 font-mono">{rf.score}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* 15. EXECUTION PRIORITIES ("WHAT NEEDS ATTENTION?") */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 font-mono">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>WHAT NEEDS ATTENTION?</span>
            </h3>
            <p className="text-xs text-slate-400">Ranked execution priority queue</p>
          </div>

          <div className="space-y-3">
            {priorities.map((prio) => (
              <div 
                key={prio.id} 
                onClick={() => window.location.hash = prio.targetRouteHash}
                className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 cursor-pointer border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      prio.priorityCategory === 'IMMEDIATE REVIEW' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {prio.priorityCategory}
                    </span>
                    <span className="text-xs font-bold text-white">{prio.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{prio.reason}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 10. MILESTONE CONTROL & FINANCIAL EXECUTION */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MilestoneControlTable milestones={project.milestones || []} projectId={project.id} />
        </div>

        {/* Financial Execution & Resource Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>FINANCIAL EXECUTION</span>
              </h3>
            </div>

            {scorecard.hasFinancialData ? (
              <div className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Approved Budget:</span>
                  <span className="font-extrabold text-white">₹{scorecard.approvedBudgetCr} Cr</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Disbursement Spent:</span>
                  <span className="font-extrabold text-emerald-400">₹{scorecard.expenditureToDateCr} Cr</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, Math.round(((scorecard.expenditureToDateCr || 0) / (scorecard.approvedBudgetCr || 1)) * 100))}%` }} />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
                Financial execution data unavailable for this project.
              </div>
            )}
          </div>

          {/* 12. RESOURCE INTELLIGENCE (Intentional Placeholder) */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-2 font-mono text-xs">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">RESOURCE INTELLIGENCE</div>
            <p className="text-slate-400 text-[11px]">
              Resource-level execution data is not available for this project.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
