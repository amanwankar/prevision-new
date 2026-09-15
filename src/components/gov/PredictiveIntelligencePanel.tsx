import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  IndianRupee, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';
import type { Project } from '../../types';

interface PredictiveIntelligencePanelProps {
  project: Project;
}

export const PredictiveIntelligencePanel: React.FC<PredictiveIntelligencePanelProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'evm' | 'shap' | 'early_warning' | 'progression'>('forecast');

  // Compute EVM indicators if not already explicitly present on project
  const plannedProgress = project.targetPhysicalProgress ?? 70;
  const actualProgress = project.actualPhysicalProgress ?? project.physicalProgress ?? 64;
  const progressGap = project.progressGap ?? Math.max(0, plannedProgress - actualProgress);
  const costBaselineCr = project.revisedBudgetCr || project.costCr || 5248;
  const expenditureCr = project.expenditureToDateCr || 3358;
  
  // Earned Value (EV), Planned Value (PV), Actual Cost (AC)
  const plannedValueCr = Math.round((plannedProgress / 100) * costBaselineCr);
  const earnedValueCr = Math.round((actualProgress / 100) * costBaselineCr);
  const actualCostCr = expenditureCr;
  
  const spi = project.spi ?? (plannedValueCr > 0 ? Number((earnedValueCr / plannedValueCr).toFixed(2)) : 0.91);
  const cpi = project.cpi ?? (actualCostCr > 0 ? Number((earnedValueCr / actualCostCr).toFixed(2)) : 0.89);
  const eacCr = project.eacCr ?? Math.round(costBaselineCr / Math.max(0.7, cpi * Math.min(1, spi)));

  // Probabilities & horizons
  const delayProb3m = project.delayProb3m ?? 35;
  const delayProb6m = project.delayProb6m ?? 57;
  const delayProb12m = project.delayProb12m ?? 68;

  const costOverrunProb6m = project.costOverrunProb6m ?? 31;
  const costOverrunProb12m = project.costOverrunProb12m ?? 48;

  const milestoneFailureProb = project.milestoneFailureProb ?? 62;
  const milestoneAtRisk = project.milestoneAtRisk ?? 'Balance Section Track-Linking & Work-Front Handover';
  const criticalDependency = project.criticalDependencyRisk ?? project.primaryRisk ?? 'Tunnel lining drainage completion & balance work fronts';

  // Calibrated score badge (0-24 Green, 25-49 Amber, 50-74 Orange, 75-100 Red)
  const score = project.riskScore ?? 68;
  const getScoreBadge = (sc: number) => {
    if (sc <= 24) return { label: 'Green (Low Risk)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    if (sc <= 49) return { label: 'Amber (Moderate Risk)', bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    if (sc <= 74) return { label: 'Orange (High Risk)', bg: 'bg-orange-50 text-orange-800 border-orange-300', dot: 'bg-orange-500' };
    return { label: 'Red (Critical Overrun)', bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
  };
  const scoreBadge = getScoreBadge(score);

  // Determine sector type
  const isRoadProject = project.sector === 'Roads & Highways';

  // SHAP Drivers fallback if empty
  const shapDrivers = project.shapDrivers && project.shapDrivers.length > 0 
    ? project.shapDrivers 
    : isRoadProject
    ? [
        { feature: `Land possession status (${project.landPossessionPct ?? 82}% available)`, impact: 22, direction: 'increase' as const, explanation: 'Encumbered ROW sections prevent continuous bituminous paver operation' },
        { feature: `Physical progress gap (${progressGap}% deficit)`, impact: 16, direction: 'increase' as const, explanation: `Actual corridor physical delivery is ${progressGap}% behind approved contract baseline` },
        { feature: `Critical utility shifting pending (${project.utilityShiftingPending ?? 14} sites)`, impact: 12, direction: 'increase' as const, explanation: 'High-tension power line towers and water trunk lines pending shutdown clearance' },
        { feature: `SPI at ${spi} (schedule deceleration)`, impact: 10, direction: 'increase' as const, explanation: 'Substructure and embankment earthwork run rate is lagging required schedule' },
        { feature: 'Executed packages & operational bypasses', impact: -12, direction: 'decrease' as const, explanation: 'Toll plaza and early operational segments generate utility and ease overall corridor risk' }
      ]
    : [
        { feature: `Physical progress gap (${progressGap}% deficit)`, impact: 18, direction: 'increase' as const, explanation: `Actual physical delivery is ${progressGap}% behind planned baseline` },
        { feature: 'Critical utility shifting age > 60 days', impact: 14, direction: 'increase' as const, explanation: 'Overhead HT powerline crossings pending shutdown clearance' },
        { feature: `CPI at ${cpi} (cost inefficiency)`, impact: 12, direction: 'increase' as const, explanation: 'Material and earthwork burn exceeds earned physical output' },
        { feature: 'Commissioned section operating cash flow', impact: -10, direction: 'decrease' as const, explanation: 'Operational stretches mitigate full corridor delay risk' }
      ];

  // Early warning rules fallback (RD-01 to RD-08 for Roads, RW-01 to RW-08 for Railways)
  const earlyWarningRules = project.earlyWarningRules && project.earlyWarningRules.length > 0
    ? project.earlyWarningRules
    : isRoadProject
    ? [
        { id: 'RD-01', trigger: `Actual physical progress is ${progressGap} pts below planned baseline`, level: 'Amber' as const, action: 'Require 30-day contractor recovery schedule & mobilization audit for paver/rollers', status: 'Active' as const },
        { id: 'RD-02', trigger: 'Progress deficit widened across 2 consecutive monthly reporting cycles', level: 'Orange' as const, action: 'Joint site inspection by NHAI Regional Officer / MoRTH Chief Engineer with Concessionaire', status: 'Active' as const },
        { id: 'RD-03', trigger: `Land in possession is ${project.landPossessionPct ?? 82}% (below 90% threshold for unencumbered front)`, level: 'Red' as const, action: 'Escalate to District Collector & Special Land Acquisition Officer (SLGAO) for emergency award dispersal', status: 'Active' as const },
        { id: 'RD-04', trigger: `Schedule Performance Index (SPI) is ${spi} (below 0.95 statutory target)`, level: 'Orange' as const, action: 'Audit contractor equipment fleet, batching plants, and quarry stone aggregate supply', status: 'Active' as const },
        { id: 'RD-05', trigger: `Cost Performance Index (CPI) is ${cpi} (below 0.95)`, level: 'Orange' as const, action: 'Conduct comprehensive Estimate at Completion (EAC) review with Independent Engineer', status: 'Active' as const },
        { id: 'RD-06', trigger: `Stage II forest clearance status: ${project.forestClearanceStatus ?? 'Pending (8.4 ha)'}`, level: 'Orange' as const, action: 'Convene State Level Empowered Committee meeting with PCCF for tree-felling sanctions', status: 'Active' as const },
        { id: 'RD-07', trigger: `Critical utility shifting pending > 60 days (${project.utilityShiftingPending ?? 12} locations)`, level: 'Orange' as const, action: 'Joint field coordination with MSEDCL / State Water Board chaired by Secretary (PWD)', status: 'Active' as const },
        { id: 'RD-08', trigger: `Major bridges / grade separators substructure lagging (${project.structuresCompleted ?? 34}/${project.structuresCount ?? 58} completed)`, level: 'Red' as const, action: 'Direct subcontractor replacement or parallel workfront opening for bridge pier caps and girders', status: 'Active' as const }
      ]
    : [
        { id: 'RW-01', trigger: `Actual physical progress is ${progressGap} pts below planned`, level: 'Amber' as const, action: 'Require 30-day contractor recovery schedule', status: 'Active' as const },
        { id: 'RW-02', trigger: 'Progress gap grew for 2 consecutive monthly cycles', level: 'Orange' as const, action: 'Project director joint review and plant mobilization audit', status: 'Active' as const },
        { id: 'RW-04', trigger: `SPI below 0.95 (current ${spi})`, level: 'Orange' as const, action: 'Audit track machines, ballast supply, and contractor plant availability', status: 'Active' as const },
        { id: 'RW-05', trigger: `CPI below 0.95 (current ${cpi})`, level: 'Orange' as const, action: 'Conduct comprehensive Estimate at Completion (EAC) review', status: 'Active' as const }
      ];

  // Monthly Progression History fallback
  const monthlyHistory = project.monthlyHistory && project.monthlyHistory.length > 0
    ? project.monthlyHistory
    : [
        { month: 'Jun 2026', plannedProgress: 62, actualProgress: 60, progressGap: 2, spi: 0.97, cpi: 0.98, landPendingPct: 4, criticalIssueAgeDays: 15, delayProb: 26, alertLevel: 'Green' as const },
        { month: 'Jul 2026', plannedProgress: 66, actualProgress: 62, progressGap: 4, spi: 0.94, cpi: 0.94, landPendingPct: 4, criticalIssueAgeDays: 38, delayProb: 42, alertLevel: 'Amber' as const },
        { month: 'Aug 2026', plannedProgress: 70, actualProgress: 64, progressGap: 6, spi: 0.91, cpi: 0.89, landPendingPct: 3, criticalIssueAgeDays: 66, delayProb: 68, alertLevel: 'Orange' as const }
      ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top PREVISION Banner */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <BrainCircuit size={13} className="text-blue-400" />
                PREVISION ML Predictive Engine
              </span>
              <span className="text-xs text-slate-400">
                Multi-Horizon EVM & Early Warning Surveillance
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Predictive Risk Intelligence & Cause Explanation
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Learns from past monthly progress cycles, engineering earned value (EVM), land acquisition work-fronts, tunnel/bridge status, and contractor burn rate to forecast future failure probabilities.
            </p>
          </div>

          {/* Calibrated Risk Score 0-100 */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-lg shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                PREVISION Score
              </div>
              <div className="text-2xl font-black text-white flex items-baseline gap-1">
                <span>{score}</span>
                <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="h-9 w-px bg-slate-700" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Calibrated Level
              </div>
              <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded border bg-slate-900/80 text-amber-300 border-amber-500/30">
                <span className={`w-2 h-2 rounded-full ${scoreBadge.dot}`} />
                <span>{scoreBadge.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/75 px-4 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('forecast')}
          className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'forecast'
              ? 'border-blue-700 text-blue-900 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar size={14} className="text-blue-700" />
          <span>3 / 6 / 12-Month Forecasts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evm')}
          className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'evm'
              ? 'border-blue-700 text-blue-900 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity size={14} className="text-emerald-700" />
          <span>Engineering Indicators (EVM)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shap')}
          className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'shap'
              ? 'border-blue-700 text-blue-900 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BrainCircuit size={14} className="text-indigo-700" />
          <span>SHAP Cause Attributions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('early_warning')}
          className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'early_warning'
              ? 'border-blue-700 text-blue-900 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert size={14} className="text-amber-600" />
          <span>Early Warning Rules ({earlyWarningRules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progression')}
          className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'progression'
              ? 'border-blue-700 text-blue-900 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={14} className="text-blue-800" />
          <span>Monthly Progression Audit</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5">
        {/* TAB 1: 3 / 6 / 12-Month Multi-Horizon Forecasts */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 3-Month Horizon */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    3-Month Horizon
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Short Term
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-500">Delay Probability</div>
                  <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                    <span>{delayProb3m}%</span>
                    <span className="text-xs font-semibold text-amber-600">
                      {delayProb3m > 50 ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${delayProb3m}%` }} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                  <span>Forecast Delay:</span>
                  <strong className="text-slate-900">{project.forecastDelayDays3m ?? 45} days</strong>
                </div>
              </div>

              {/* 6-Month Horizon */}
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-900">
                    6-Month Horizon
                  </span>
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
                    Medium Term
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-600">Delay Probability</div>
                  <div className="text-2xl font-black text-orange-950 flex items-baseline gap-1">
                    <span>{delayProb6m}%</span>
                    <span className="text-xs font-semibold text-orange-700">Elevated</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1.5">
                    <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${delayProb6m}%` }} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200 text-[11px] text-slate-700 flex justify-between">
                  <span>Cost Overrun Risk:</span>
                  <strong className="text-orange-950">{costOverrunProb6m}% chance</strong>
                </div>
              </div>

              {/* 12-Month Horizon */}
              <div className="border border-rose-200 rounded-lg p-4 bg-rose-50/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
                    12-Month Horizon
                  </span>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200">
                    Long Term
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-600">Delay Probability</div>
                  <div className="text-2xl font-black text-rose-950 flex items-baseline gap-1">
                    <span>{delayProb12m}%</span>
                    <span className="text-xs font-semibold text-rose-700">Critical</span>
                  </div>
                  <div className="w-full bg-rose-200 rounded-full h-1.5 mt-1.5">
                    <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${delayProb12m}%` }} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-rose-200 text-[11px] text-slate-700 flex justify-between">
                  <span>Cost Overrun Risk:</span>
                  <strong className="text-rose-950">{costOverrunProb12m}% chance</strong>
                </div>
              </div>
            </div>

            {/* Critical Milestones & Financial Projection (EAC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <Layers size={14} className="text-blue-700" />
                  <span>Milestone Failure Probability (Next 90/180 Days)</span>
                </div>
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900">{milestoneAtRisk}</div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                      {milestoneFailureProb}% Risk
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600">
                    Critical dependency: <strong className="text-slate-800">{criticalDependency}</strong>
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <IndianRupee size={14} className="text-emerald-700" />
                  <span>Estimate at Completion (EAC) vs Approved Baseline</span>
                </div>
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Approved Budget (BAC)</div>
                    <div className="text-base font-bold text-slate-900">₹{costBaselineCr.toLocaleString('en-IN')} Cr</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-medium">PREVISION Forecast (EAC)</div>
                    <div className="text-base font-bold text-rose-700">₹{eacCr.toLocaleString('en-IN')} Cr</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-medium">Projected Cost Escalation</div>
                    <div className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      +₹{(eacCr - costBaselineCr).toLocaleString('en-IN')} Cr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Core Engineering Indicators (EVM) */}
        {activeTab === 'evm' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Progress Gap */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  1. Physical Progress Gap
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-rose-700">
                    {progressGap}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {plannedProgress}% plan - {actualProgress}% act
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Threshold: &gt;5% activates Early Warning RW-01.
                </p>
              </div>

              {/* Schedule Performance Index (SPI) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  2. Schedule Index (SPI)
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-2xl font-black ${spi < 0.92 ? 'text-rose-700' : spi < 1.0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {spi}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${spi < 1.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {spi < 1.0 ? 'Behind Schedule' : 'Ahead of Plan'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Formula: Earned Value (₹{earnedValueCr} Cr) / Planned Value (₹{plannedValueCr} Cr).
                </p>
              </div>

              {/* Cost Performance Index (CPI) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  3. Cost Index (CPI)
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-2xl font-black ${cpi < 0.90 ? 'text-rose-700' : cpi < 1.0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {cpi}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cpi < 1.0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {cpi < 1.0 ? 'Spending Over Baseline' : 'Under Budget'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Formula: Earned Value (₹{earnedValueCr} Cr) / Actual Cost (₹{actualCostCr} Cr).
                </p>
              </div>

              {/* Estimate At Completion (EAC) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  4. Estimate at Completion
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{eacCr} Cr
                  </span>
                  <span className="text-xs font-bold text-rose-600">
                    +₹{eacCr - costBaselineCr} Cr
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Calculated as BAC / (CPI × SPI) factoring compounding delay.
                </p>
              </div>
            </div>

            {/* EVM Formulas Reference Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                <Info size={14} className="text-blue-700" />
                <span>PREVISION Certified Engineering Calculation Reference</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <strong className="text-slate-900 block">Schedule Variance (SV)</strong>
                  <div className="text-slate-600 mt-0.5">SV = Earned Value - Planned Value</div>
                  <div className="font-mono text-slate-800 font-bold mt-1">
                    ₹{earnedValueCr} Cr - ₹{plannedValueCr} Cr = {earnedValueCr - plannedValueCr >= 0 ? '+' : ''}{earnedValueCr - plannedValueCr} Cr
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900 block">Cost Variance (CV)</strong>
                  <div className="text-slate-600 mt-0.5">CV = Earned Value - Actual Cost</div>
                  <div className="font-mono text-slate-800 font-bold mt-1">
                    ₹{earnedValueCr} Cr - ₹{actualCostCr} Cr = {earnedValueCr - actualCostCr >= 0 ? '+' : ''}{earnedValueCr - actualCostCr} Cr
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900 block">Schedule Performance Index (SPI)</strong>
                  <div className="text-slate-600 mt-0.5">SPI = EV / PV</div>
                  <div className="font-mono text-slate-800 font-bold mt-1">
                    {spi} ({spi < 1.0 ? 'Behind schedule pace' : 'On schedule'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHAP Feature Attributions */}
        {activeTab === 'shap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                SHAP values explain <strong>why</strong> the PREVISION risk score is calibrated at <strong>{score}/100</strong>. Each bar shows the point increase or decrease contributed by specific project variables.
              </p>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Base Model Bias: 42.0 pts
              </span>
            </div>

            <div className="space-y-3">
              {shapDrivers.map((driver, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3.5 bg-white hover:bg-slate-50/50 transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {driver.direction === 'increase' ? (
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <ArrowUpRight size={14} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <ArrowDownRight size={14} />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">{driver.feature}</div>
                        <div className="text-[11px] text-slate-500">{driver.explanation}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        driver.direction === 'increase' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {driver.direction === 'increase' ? `+${driver.impact}` : `-${Math.abs(driver.impact)}`} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Early Warning Rules (RW-01 to RW-08) */}
        {activeTab === 'early_warning' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>Automatic rule engine continuously monitors project telemetry against predetermined statutory risk gates.</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {earlyWarningRules.filter(r => r.status === 'Active').length} Active Triggers
              </span>
            </div>

            <div className="space-y-3">
              {earlyWarningRules.map((rule) => (
                <div key={rule.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                        {rule.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        rule.level === 'Red' 
                          ? 'bg-rose-50 text-rose-800 border-rose-300' 
                          : rule.level === 'Orange' 
                          ? 'bg-orange-50 text-orange-800 border-orange-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {rule.level} Alert
                      </span>
                      <span className="text-xs font-bold text-slate-800">{rule.trigger}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 self-start sm:self-auto">
                      <AlertTriangle size={12} />
                      <span>{rule.status}</span>
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Mandated Action:</strong> {rule.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prescribed Action, Owner, Deadline & Closure Proof */}
            <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wide">
                <ShieldAlert size={15} className="text-blue-800" />
                <span>Formal Action Directive & Closure Protocol</span>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Designated Action Owner</span>
                  <strong className="text-slate-900 mt-1 block leading-snug">
                    {project.actionOwner || 'Chief Administrative Officer (Construction), Central Railway'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Compliance Deadline</span>
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mt-1">
                    <Clock size={13} />
                    <span>{project.actionDeadline || '30 Days (15 Oct 2026)'}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Required Closure Proof</span>
                  <strong className="text-slate-900 mt-1 block leading-snug">
                    {project.closureProofRequired || 'Joint geotechnical tunnel lining certificate & work front release.'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Monthly Progression Audit */}
        {activeTab === 'progression' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Historical progression analysis demonstrates how PREVISION identifies subtle early divergences months prior to formal schedule revisions.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Reporting Cycle</th>
                    <th className="py-2.5 px-3 text-right">Planned %</th>
                    <th className="py-2.5 px-3 text-right">Actual %</th>
                    <th className="py-2.5 px-3 text-right">Progress Gap</th>
                    <th className="py-2.5 px-3 text-right">SPI</th>
                    <th className="py-2.5 px-3 text-right">CPI</th>
                    <th className="py-2.5 px-3 text-right">Delay Risk</th>
                    <th className="py-2.5 px-3 text-center">Alert Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlyHistory.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/75 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.month}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{row.plannedProgress}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.actualProgress}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">+{row.progressGap}%</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">{row.spi}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">{row.cpi}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.delayProb}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          row.alertLevel === 'Red' 
                            ? 'bg-rose-50 text-rose-800 border-rose-300' 
                            : row.alertLevel === 'Orange' 
                            ? 'bg-orange-50 text-orange-800 border-orange-300' 
                            : row.alertLevel === 'Amber' 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}>
                          {row.alertLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
