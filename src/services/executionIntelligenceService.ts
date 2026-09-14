import type { Project, Milestone, EarlyWarning, RecommendedAction } from '../types';
import { calculateRiskAnalysis, type DetailedRiskAnalysis } from './riskEngine';
import { calculateDataQuality, type DataQualityResult } from './dataQualityService';
import { calculateProgressGap, calculateTimelineVariance } from './scheduleIntelligenceService';

export type ExecutionHealthState = 'HEALTHY' | 'WATCH' | 'HIGH RISK' | 'CRITICAL' | 'DATA ISSUE';

export interface SingleHealthDimension {
  title: string;
  state: string; // e.g. "58%", "On Track", "Insufficient Data", etc.
  metricLabel: string;
  explanation: string;
  status: 'healthy' | 'watch' | 'warning' | 'critical' | 'insufficient';
  deepLinkHash: string;
  deepLinkLabel: string;
  value?: number; // 0-100 score if applicable
}

export interface ExecutionScorecardData {
  plannedProgress: number;
  actualProgress: number;
  progressGap: number;
  approvedBudgetCr?: number;
  expenditureToDateCr?: number;
  budgetVarianceCr?: number;
  hasFinancialData: boolean;
  totalMilestones: number;
  completedMilestones: number;
  delayedMilestones: number;
  atRiskMilestones: number;
  plannedCompletionDate: string;
  expectedCompletionDate: string;
}

export interface PlanVsRealityPoint {
  period: string; // e.g. "Month 1", "Q1", "Jan 2026", etc.
  plannedProgress: number;
  actualProgress: number;
  expectedProgress?: number;
  plannedCostCr?: number;
  actualCostCr?: number;
}

export interface ExecutionSignalItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  explanation: string;
  relatedArea: 'Schedule' | 'Progress' | 'Cost' | 'Milestone' | 'Data Quality' | 'Risk';
  recommendedReview: string;
}

export interface PriorityIssueItem {
  id: string;
  priorityCategory: 'IMMEDIATE REVIEW' | 'HIGH PRIORITY' | 'MONITOR' | 'NO ACTION REQUIRED';
  title: string;
  reason: string;
  source: 'Risk Engine' | 'Early Warning' | 'Milestone Tracker' | 'Data Quality' | 'Recommended Actions';
  targetRouteHash: string;
}

export type ControlLoopStage = 
  | 'PLAN' 
  | 'EXECUTE' 
  | 'MEASURE' 
  | 'DEVIATION' 
  | 'RISK' 
  | 'WARNING' 
  | 'ACTION' 
  | 'REASSESS';

export interface ExecutionIntelligenceData {
  project: Project;
  overallHealthState: ExecutionHealthState;
  overallHealthScore: number | null; // null if insufficient data
  dimensions: {
    schedule: SingleHealthDimension;
    progress: SingleHealthDimension;
    financial: SingleHealthDimension;
    milestones: SingleHealthDimension;
    dataQuality: SingleHealthDimension;
    risk: SingleHealthDimension;
  };
  scorecard: ExecutionScorecardData;
  planVsReality: PlanVsRealityPoint[];
  executionSignals: ExecutionSignalItem[];
  riskAnalysis: DetailedRiskAnalysis;
  dataQualityResult: DataQualityResult;
  priorities: PriorityIssueItem[];
  controlLoopStage: ControlLoopStage;
  activeWarnings: EarlyWarning[];
  activeActions: RecommendedAction[];
}

/**
 * Calculates complete Execution Control Center metrics for a given project record.
 */
export function getExecutionIntelligence(
  project: Project,
  allAlerts: EarlyWarning[] = [],
  allActions: RecommendedAction[] = []
): ExecutionIntelligenceData {
  const riskAnalysis = calculateRiskAnalysis(project);
  const dataQualityResult = calculateDataQuality(project);

  const projectAlerts = allAlerts.filter(a => a.projectId === project.id);
  const projectActions = allActions.filter(ac => ac.projectId === project.id);

  const targetProg = project.targetPhysicalProgress ?? 0;
  const actualProg = project.actualPhysicalProgress ?? 0;
  const progressGapResult = calculateProgressGap(project);
  const timelineVarianceResult = calculateTimelineVariance(project);

  // Financial Availability
  const hasFinancialData = 
    project.originalBudgetCr !== undefined && 
    project.originalBudgetCr > 0;
  
  const approvedBudget = project.originalBudgetCr || 0;
  const expenditure = project.expenditureToDateCr || 0;
  const budgetVariance = hasFinancialData ? expenditure - approvedBudget : 0;
  const expenditureUtilization = hasFinancialData && approvedBudget > 0 
    ? Math.round((expenditure / approvedBudget) * 100) 
    : null;

  // Milestone Calculations
  const defaultMilestones: Milestone[] = [
    { id: 'm-1', name: 'Project Initiation', expectedDate: '2022-03-01', actualDate: '2022-03-15', status: 'Completed', progress: 100 },
    { id: 'm-2', name: 'Land Acquisition & Clearances', expectedDate: '2022-09-30', actualDate: '2022-10-15', status: 'Completed', progress: 100 },
    { id: 'm-3', name: 'Civil & Foundation Work', expectedDate: '2023-06-30', actualDate: '2023-07-15', status: 'Completed', progress: 100 },
    { id: 'm-4', name: 'Superstructure & Main Works', expectedDate: '2024-12-31', status: 'Delayed', progress: 58, risk: 'High' },
    { id: 'm-5', name: 'System Integration & Testing', expectedDate: '2025-04-30', status: 'Pending', progress: 0 },
    { id: 'm-6', name: 'Final Commissioning', expectedDate: '2025-06-30', status: 'Pending', progress: 0 }
  ];

  const milestonesList = project.milestones && project.milestones.length > 0 
    ? project.milestones 
    : defaultMilestones;

  const totalMilestones = milestonesList.length;
  const completedMilestones = milestonesList.filter(m => m.status === 'Completed').length;
  const delayedMilestones = milestonesList.filter(m => m.status === 'Delayed').length;
  const atRiskMilestones = milestonesList.filter(m => m.risk === 'High' || m.risk === 'Critical').length;

  // 1. DIMENSIONS

  // Schedule Health
  const scheduleHealth: SingleHealthDimension = {
    title: 'SCHEDULE HEALTH',
    state: timelineVarianceResult.isExtended 
      ? `+${timelineVarianceResult.delayDays} Days Delay` 
      : 'On Target Schedule',
    metricLabel: 'Timeline Variance',
    explanation: timelineVarianceResult.isExtended
      ? `Project target completion is delayed by projected +${timelineVarianceResult.delayDays} days.`
      : 'Project timeline is progressing within original approved baseline schedule.',
    status: timelineVarianceResult.delayDays > 120 ? 'critical' : timelineVarianceResult.delayDays > 30 ? 'warning' : 'healthy',
    deepLinkHash: `#/projects/${project.id}/timeline`,
    deepLinkLabel: 'VIEW TIMELINE →',
    value: Math.max(0, 100 - Math.round(timelineVarianceResult.delayDays / 3))
  };

  // Progress Health
  const progressHealth: SingleHealthDimension = {
    title: 'PROGRESS HEALTH',
    state: `${actualProg}%`,
    metricLabel: `Current Progress (Planned: ${targetProg}%)`,
    explanation: progressGapResult.isBehind
      ? `Physical progress is below planned baseline target by ${Math.abs(progressGapResult.gapPercent)}%.`
      : `Physical progress is aligned with baseline target.`,
    status: progressGapResult.gapPercent <= -15 ? 'critical' : progressGapResult.gapPercent < 0 ? 'warning' : 'healthy',
    deepLinkHash: `#/projects/${project.id}`,
    deepLinkLabel: 'VIEW PROGRESS →',
    value: actualProg
  };

  // Financial Health
  const financialHealth: SingleHealthDimension = {
    title: 'FINANCIAL HEALTH',
    state: hasFinancialData ? `${expenditureUtilization}% Utilized` : 'INSUFFICIENT DATA',
    metricLabel: hasFinancialData ? `₹${expenditure} Cr spent of ₹${approvedBudget} Cr` : 'Financial telemetry unrecorded',
    explanation: hasFinancialData
      ? (budgetVariance > 0 
          ? `Expenditure exceeds approved budget baseline by ₹${budgetVariance.toFixed(1)} Cr.` 
          : `Disbursement is within approved baseline of ₹${approvedBudget} Cr.`)
      : 'Financial execution data unavailable for this project.',
    status: !hasFinancialData ? 'insufficient' : budgetVariance > 0 ? 'warning' : 'healthy',
    deepLinkHash: `#/data-management`,
    deepLinkLabel: hasFinancialData ? 'VIEW FINANCIALS →' : 'UPDATE DATA →',
    value: expenditureUtilization ?? undefined
  };

  // Milestone Health
  const milestoneHealth: SingleHealthDimension = {
    title: 'MILESTONE HEALTH',
    state: `${completedMilestones}/${totalMilestones} Completed`,
    metricLabel: `${delayedMilestones} Delayed, ${atRiskMilestones} At Risk`,
    explanation: delayedMilestones > 0
      ? `${delayedMilestones} milestone(s) currently delayed beyond planned completion dates.`
      : 'All active milestones are proceeding on scheduled timelines.',
    status: delayedMilestones > 1 ? 'critical' : delayedMilestones === 1 ? 'warning' : 'healthy',
    deepLinkHash: `#/projects/${project.id}/milestones`,
    deepLinkLabel: 'MILESTONE CONTROL →',
    value: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
  };

  // Data Quality
  const dataQualityHealth: SingleHealthDimension = {
    title: 'DATA QUALITY',
    state: `${dataQualityResult.overallScore}% Score`,
    metricLabel: dataQualityResult.status,
    explanation: dataQualityResult.explanation,
    status: dataQualityResult.overallScore >= 80 ? 'healthy' : dataQualityResult.overallScore >= 60 ? 'watch' : 'critical',
    deepLinkHash: `#/projects/${project.id}/edit`,
    deepLinkLabel: 'REVIEW DATA →',
    value: dataQualityResult.overallScore
  };

  // Risk Status
  const riskHealth: SingleHealthDimension = {
    title: 'RISK STATUS',
    state: `${riskAnalysis.riskScore}/100 Risk`,
    metricLabel: `${riskAnalysis.riskLevel} (${riskAnalysis.primaryRisk})`,
    explanation: riskAnalysis.explanation.summary,
    status: riskAnalysis.riskLevel === 'Critical' ? 'critical' : riskAnalysis.riskLevel === 'High' ? 'warning' : 'healthy',
    deepLinkHash: `#/risk-analytics`,
    deepLinkLabel: 'OPEN RISK ANALYTICS →',
    value: riskAnalysis.riskScore
  };

  // Overall Health Score & State
  let overallHealthState: ExecutionHealthState = 'HEALTHY';
  if (dataQualityResult.overallScore < 50) {
    overallHealthState = 'DATA ISSUE';
  } else if (riskAnalysis.riskScore >= 75 || timelineVarianceResult.delayDays > 120) {
    overallHealthState = 'CRITICAL';
  } else if (riskAnalysis.riskScore >= 55 || progressGapResult.gapPercent <= -10 || delayedMilestones > 0) {
    overallHealthState = 'HIGH RISK';
  } else if (riskAnalysis.riskScore >= 40 || progressGapResult.gapPercent < 0) {
    overallHealthState = 'WATCH';
  }

  const overallHealthScore = Math.round(
    (progressHealth.value! * 0.25) +
    ((100 - riskAnalysis.riskScore) * 0.35) +
    (milestoneHealth.value! * 0.20) +
    (dataQualityResult.overallScore * 0.20)
  );

  // 2. SCORECARD
  const scorecard: ExecutionScorecardData = {
    plannedProgress: targetProg,
    actualProgress: actualProg,
    progressGap: Math.round(actualProg - targetProg),
    approvedBudgetCr: hasFinancialData ? approvedBudget : undefined,
    expenditureToDateCr: hasFinancialData ? expenditure : undefined,
    budgetVarianceCr: hasFinancialData ? budgetVariance : undefined,
    hasFinancialData,
    totalMilestones,
    completedMilestones,
    delayedMilestones,
    atRiskMilestones,
    plannedCompletionDate: project.originalTargetDate || '2027-12-31',
    expectedCompletionDate: timelineVarianceResult.expectedCompletionDate
  };

  // 3. PLAN VS REALITY DATA
  const planVsReality: PlanVsRealityPoint[] = project.sCurveData && project.sCurveData.length > 0
    ? project.sCurveData.map(s => ({
        period: s.month,
        plannedProgress: s.target,
        actualProgress: s.actual,
        expectedProgress: s.predicted
      }))
    : [
        { period: 'Jan 2026', plannedProgress: 45, actualProgress: 42, expectedProgress: 44 },
        { period: 'Feb 2026', plannedProgress: 52, actualProgress: 47, expectedProgress: 49 },
        { period: 'Mar 2026', plannedProgress: 58, actualProgress: 51, expectedProgress: 53 },
        { period: 'Apr 2026', plannedProgress: 63, actualProgress: 54, expectedProgress: 56 },
        { period: 'May 2026', plannedProgress: 68, actualProgress: 56, expectedProgress: 58 },
        { period: 'Jun 2026', plannedProgress: targetProg, actualProgress: actualProg, expectedProgress: project.aiPredictedDate ? Math.min(100, actualProg + 10) : actualProg }
      ];

  // 4. EXECUTION SIGNALS
  const executionSignals: ExecutionSignalItem[] = [];

  if (progressGapResult.isBehind) {
    executionSignals.push({
      id: 'sig-prog',
      severity: Math.abs(progressGapResult.gapPercent) >= 15 ? 'CRITICAL' : 'WARNING',
      title: 'Progress Below Plan',
      explanation: `Actual physical execution (${actualProg}%) trails target baseline (${targetProg}%) by ${Math.abs(progressGapResult.gapPercent)}%.`,
      relatedArea: 'Progress',
      recommendedReview: 'Review site contractor manpower deployment and equipment availability.'
    });
  }

  if (delayedMilestones > 0) {
    executionSignals.push({
      id: 'sig-ms',
      severity: 'CRITICAL',
      title: 'Milestone Delayed',
      explanation: `${delayedMilestones} critical phase milestone currently flagged as delayed past target date.`,
      relatedArea: 'Milestone',
      recommendedReview: 'Inspect milestone dependencies and fast-track clearance bottlenecks.'
    });
  }

  if (timelineVarianceResult.isExtended) {
    executionSignals.push({
      id: 'sig-time',
      severity: timelineVarianceResult.delayDays > 90 ? 'CRITICAL' : 'WARNING',
      title: 'Timeline Variance Spike',
      explanation: `Current predictive model estimates +${timelineVarianceResult.delayDays} days delay past original target completion.`,
      relatedArea: 'Schedule',
      recommendedReview: 'Conduct joint departmental schedule re-baselining.'
    });
  }

  if (!hasFinancialData) {
    executionSignals.push({
      id: 'sig-fin-missing',
      severity: 'INFO',
      title: 'Missing Financial Data',
      explanation: 'Financial expenditure telemetry has not been inputted for this project.',
      relatedArea: 'Cost',
      recommendedReview: 'Input approved budget and expenditure logs to enable financial risk modeling.'
    });
  } else if (budgetVariance > 0) {
    executionSignals.push({
      id: 'sig-budget-overrun',
      severity: 'WARNING',
      title: 'Budget Utilization Anomaly',
      explanation: `Expenditure of ₹${expenditure} Cr exceeds approved baseline by ₹${budgetVariance.toFixed(1)} Cr.`,
      relatedArea: 'Cost',
      recommendedReview: 'Review financial audit logs and cost overrun justifications.'
    });
  }

  if (dataQualityResult.overallScore < 70) {
    executionSignals.push({
      id: 'sig-dq',
      severity: 'WARNING',
      title: 'Data Quality Readiness Alert',
      explanation: `Project telemetry confidence is ${dataQualityResult.overallScore}%. ${dataQualityResult.issues.length} data issues identified.`,
      relatedArea: 'Data Quality',
      recommendedReview: 'Review and update missing or outdated project fields.'
    });
  }

  // 5. PRIORITIES ("WHAT NEEDS ATTENTION?")
  const priorities: PriorityIssueItem[] = [];

  if (projectAlerts.some(a => a.status === 'New' || a.severity === 'Critical')) {
    priorities.push({
      id: 'prio-alert',
      priorityCategory: 'IMMEDIATE REVIEW',
      title: 'Active Critical Early Warning Alert',
      reason: 'Unacknowledged early warning active on project telemetry.',
      source: 'Early Warning',
      targetRouteHash: `#/alerts`
    });
  }

  if (progressGapResult.gapPercent <= -12) {
    priorities.push({
      id: 'prio-prog',
      priorityCategory: 'HIGH PRIORITY',
      title: 'Severe Physical Execution Gap',
      reason: `Project is lagging ${Math.abs(progressGapResult.gapPercent)}% behind target schedule.`,
      source: 'Risk Engine',
      targetRouteHash: `#/projects/${project.id}`
    });
  }

  if (delayedMilestones > 0) {
    priorities.push({
      id: 'prio-ms',
      priorityCategory: 'HIGH PRIORITY',
      title: 'Delayed Phase Milestone',
      reason: `${delayedMilestones} milestone(s) blocking overall timeline progression.`,
      source: 'Milestone Tracker',
      targetRouteHash: `#/projects/${project.id}/milestones`
    });
  }

  if (projectActions.some(ac => ac.status === 'Pending' && ac.priority === 'Urgent')) {
    priorities.push({
      id: 'prio-act',
      priorityCategory: 'IMMEDIATE REVIEW',
      title: 'Pending Urgent Recommended Action',
      reason: 'Recommended officer action is pending execution.',
      source: 'Recommended Actions',
      targetRouteHash: `#/actions`
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      id: 'prio-ok',
      priorityCategory: 'NO ACTION REQUIRED',
      title: 'Project Execution Stable',
      reason: 'No immediate critical risk factors or pending alerts detected.',
      source: 'Risk Engine',
      targetRouteHash: `#/projects/${project.id}`
    });
  }

  // 6. CONTROL LOOP STAGE DETERMINATION
  let controlLoopStage: ControlLoopStage = 'EXECUTE';
  const hasNewAlert = projectAlerts.some(a => a.status === 'New');
  const hasPendingAction = projectActions.some(ac => ac.status === 'Pending' || ac.status === 'In Progress');
  const hasCompletedAction = projectActions.some(ac => ac.status === 'Completed' || ac.status === 'Executed');

  if (hasCompletedAction) {
    controlLoopStage = 'REASSESS';
  } else if (hasPendingAction) {
    controlLoopStage = 'ACTION';
  } else if (hasNewAlert) {
    controlLoopStage = 'WARNING';
  } else if (riskAnalysis.riskScore >= 60) {
    controlLoopStage = 'RISK';
  } else if (progressGapResult.isBehind) {
    controlLoopStage = 'DEVIATION';
  } else if (actualProg > 0) {
    controlLoopStage = 'MEASURE';
  } else {
    controlLoopStage = 'PLAN';
  }

  return {
    project,
    overallHealthState,
    overallHealthScore,
    dimensions: {
      schedule: scheduleHealth,
      progress: progressHealth,
      financial: financialHealth,
      milestones: milestoneHealth,
      dataQuality: dataQualityHealth,
      risk: riskHealth
    },
    scorecard,
    planVsReality,
    executionSignals,
    riskAnalysis,
    dataQualityResult,
    priorities,
    controlLoopStage,
    activeWarnings: projectAlerts,
    activeActions: projectActions
  };
}
