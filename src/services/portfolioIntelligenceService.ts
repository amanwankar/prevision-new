import type { Project, EarlyWarning, RecommendedAction } from '../types';
import { calculateDataQuality } from './dataQualityService';

export interface PortfolioSummaryMetrics {
  totalProjects: number;
  projectsRequiringAttention: number;
  highRiskProjectsCount: number;
  projectsBehindPlanCount: number;
  activeWarningsCount: number;
  pendingActionsCount: number;
  averageRiskScore: number;
  averageProgressGap: number;
  overallHealthStatus: 'HEALTHY' | 'WATCH' | 'AT RISK' | 'CRITICAL' | 'INSUFFICIENT DATA';
}

export interface PortfolioHealthDimensions {
  schedule: { state: string; label: string; status: string; value: number };
  progress: { state: string; label: string; status: string; value: number };
  financial: { state: string; label: string; status: string; value: number };
  milestones: { state: string; label: string; status: string; value: number };
  dataQuality: { state: string; label: string; status: string; value: number };
  risk: { state: string; label: string; status: string; value: number };
}

export interface RadarProjectNode {
  project: Project;
  xExecution: number; // 0 - 100% (actual progress)
  yRisk: number; // 0 - 100 (risk score)
  bubbleRadius: number; // derived from budget or risk
  riskCategory: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryAttentionReason: string;
}

export interface RankedPriorityProject {
  project: Project;
  riskScore: number;
  riskLevel: string;
  actualProgress: number;
  targetProgress: number;
  progressGap: number;
  scheduleStatus: string;
  dataQualityScore: number;
  activeWarningsCount: number;
  pendingActionsCount: number;
  primaryAttentionReason: string;
}

export interface ProjectComparisonResult {
  projects: Project[];
  metrics: {
    id: string;
    label: string;
    values: { [projectId: string]: string | number };
  }[];
}

export interface DepartmentIntelligenceItem {
  departmentName: string;
  totalProjects: number;
  highRiskProjects: number;
  averageRiskScore: number;
  projectsBehindPlan: number;
  activeWarningsCount: number;
  pendingActionsCount: number;
}

export interface LocationIntelligenceItem {
  stateName: string;
  projectCount: number;
  highRiskCount: number;
  averageRisk: number;
}

export interface EmergingSignalItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  whatChanged: string;
  whyItMatters: string;
  whatToReview: string;
}

export interface OperationalAttentionItem {
  id: string;
  rank: number;
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  project: Project;
  issue: string;
  reason: string;
  recommendedNextStep: string;
  targetHash: string;
}

export interface ExecutiveSummaryReport {
  portfolioStateText: string;
  keySignalText: string;
  topPriorityText: string;
  watchText: string;
  dataQualityText: string;
}

/**
 * Calculates national portfolio intelligence metrics.
 */
export function getPortfolioSummary(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): PortfolioSummaryMetrics {
  if (projects.length === 0) {
    return {
      totalProjects: 0,
      projectsRequiringAttention: 0,
      highRiskProjectsCount: 0,
      projectsBehindPlanCount: 0,
      activeWarningsCount: 0,
      pendingActionsCount: 0,
      averageRiskScore: 0,
      averageProgressGap: 0,
      overallHealthStatus: 'INSUFFICIENT DATA'
    };
  }

  const totalProjects = projects.length;
  
  const highRiskProjects = projects.filter(p => p.riskScore >= 70 || p.riskLevel === 'High' || p.riskLevel === 'Critical');
  const behindPlanProjects = projects.filter(p => (p.targetPhysicalProgress ?? 0) - (p.actualPhysicalProgress ?? 0) >= 5);
  
  const activeWarningsCount = alerts.filter(a => a.status === 'New' || a.status === 'Open').length;
  const pendingActionsCount = actions.filter(ac => ac.status === 'Pending' || ac.status === 'In Progress').length;

  const requiringAttentionProjects = projects.filter(p => 
    p.riskScore >= 60 || 
    (p.targetPhysicalProgress ?? 0) - (p.actualPhysicalProgress ?? 0) >= 10 ||
    alerts.some(a => a.projectId === p.id && a.status === 'New')
  );

  const avgRiskScore = Math.round(
    projects.reduce((acc, p) => acc + p.riskScore, 0) / totalProjects
  );

  const totalGap = projects.reduce((acc, p) => {
    const gap = (p.actualPhysicalProgress ?? 0) - (p.targetPhysicalProgress ?? 0);
    return acc + gap;
  }, 0);
  const avgGap = Math.round(totalGap / totalProjects);

  let overallHealthStatus: PortfolioSummaryMetrics['overallHealthStatus'] = 'HEALTHY';
  if (avgRiskScore >= 70 || highRiskProjects.length >= totalProjects * 0.4) {
    overallHealthStatus = 'CRITICAL';
  } else if (avgRiskScore >= 50 || highRiskProjects.length > 0) {
    overallHealthStatus = 'AT RISK';
  } else if (avgRiskScore >= 35 || avgGap < 0) {
    overallHealthStatus = 'WATCH';
  }

  return {
    totalProjects,
    projectsRequiringAttention: requiringAttentionProjects.length,
    highRiskProjectsCount: highRiskProjects.length,
    projectsBehindPlanCount: behindPlanProjects.length,
    activeWarningsCount,
    pendingActionsCount,
    averageRiskScore: avgRiskScore,
    averageProgressGap: avgGap,
    overallHealthStatus
  };
}

/**
 * Computes aggregated portfolio health index across 6 dimensions.
 */
export function getPortfolioHealthDimensions(projects: Project[]): PortfolioHealthDimensions {
  if (projects.length === 0) {
    return {
      schedule: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 },
      progress: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 },
      financial: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 },
      milestones: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 },
      dataQuality: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 },
      risk: { state: 'INSUFFICIENT DATA', label: 'No project data', status: 'insufficient', value: 0 }
    };
  }

  const total = projects.length;
  
  // Progress
  const avgActual = Math.round(projects.reduce((a, p) => a + p.actualPhysicalProgress, 0) / total);
  const avgPlanned = Math.round(projects.reduce((a, p) => a + p.targetPhysicalProgress, 0) / total);
  const progGap = avgActual - avgPlanned;

  // Schedule (Delays)
  const avgDelayDays = Math.round(projects.reduce((a, p) => a + (p.delayDays || 0), 0) / total);

  // Financials
  const financialProjects = projects.filter(p => p.originalBudgetCr && p.originalBudgetCr > 0);
  const hasFin = financialProjects.length > 0;
  const totalBudget = financialProjects.reduce((a, p) => a + p.originalBudgetCr, 0);
  const totalSpent = financialProjects.reduce((a, p) => a + (p.expenditureToDateCr || 0), 0);
  const utilization = hasFin && totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Risk
  const avgRisk = Math.round(projects.reduce((a, p) => a + p.riskScore, 0) / total);

  // Data Quality
  const dqScores = projects.map(p => calculateDataQuality(p).overallScore);
  const avgDQ = Math.round(dqScores.reduce((a, s) => a + s, 0) / total);

  // Milestones
  let totalMs = 0;
  let compMs = 0;
  projects.forEach(p => {
    if (p.milestones) {
      totalMs += p.milestones.length;
      compMs += p.milestones.filter(m => m.status === 'Completed').length;
    }
  });
  const msRatio = totalMs > 0 ? Math.round((compMs / totalMs) * 100) : 50;

  return {
    schedule: {
      state: avgDelayDays > 0 ? `+${avgDelayDays} Days Avg Delay` : 'On Target',
      label: 'Portfolio Timeline Drift',
      status: avgDelayDays > 90 ? 'critical' : avgDelayDays > 30 ? 'warning' : 'healthy',
      value: Math.max(0, 100 - Math.round(avgDelayDays / 3))
    },
    progress: {
      state: `${avgActual}% Actual vs ${avgPlanned}% Plan`,
      label: progGap < 0 ? `${Math.abs(progGap)}% Portfolio Gap` : 'On Plan Target',
      status: progGap <= -10 ? 'critical' : progGap < 0 ? 'warning' : 'healthy',
      value: avgActual
    },
    financial: {
      state: hasFin ? `${utilization}% Spent` : 'DATA UNAVAILABLE',
      label: hasFin ? `₹${totalSpent} Cr spent of ₹${totalBudget} Cr` : 'Financial telemetry missing',
      status: !hasFin ? 'insufficient' : utilization > 100 ? 'critical' : utilization > 80 ? 'warning' : 'healthy',
      value: utilization
    },
    milestones: {
      state: `${compMs}/${totalMs} Milestones Complete`,
      label: `${msRatio}% Completion Velocity`,
      status: msRatio >= 70 ? 'healthy' : msRatio >= 50 ? 'warning' : 'critical',
      value: msRatio
    },
    dataQuality: {
      state: `${avgDQ}% Average Confidence`,
      label: 'Telemetry Readiness',
      status: avgDQ >= 80 ? 'healthy' : avgDQ >= 60 ? 'warning' : 'critical',
      value: avgDQ
    },
    risk: {
      state: `${avgRisk}/100 Risk Index`,
      label: avgRisk >= 70 ? 'Critical Portfolio Risk' : avgRisk >= 50 ? 'High Portfolio Risk' : 'Moderate Portfolio Risk',
      status: avgRisk >= 70 ? 'critical' : avgRisk >= 50 ? 'warning' : 'healthy',
      value: avgRisk
    }
  };
}

/**
 * Formulates nodes for Project Priority Radar.
 */
export function getProjectPriorityRadar(projects: Project[]): RadarProjectNode[] {
  return projects.map(p => {
    const gap = (p.targetPhysicalProgress ?? 0) - (p.actualPhysicalProgress ?? 0);
    
    let reason = 'Execution on schedule';
    if (p.riskScore >= 75) reason = 'Critical AI Risk Score';
    else if (gap >= 15) reason = `Physical execution lags target by ${gap}%`;
    else if (p.status === 'Delayed') reason = 'Schedule target breach';
    else if (p.delayDays && p.delayDays > 60) reason = `Projected ${p.delayDays}-day timeline delay`;

    const budgetSize = p.originalBudgetCr ? Math.min(24, Math.max(12, Math.round(p.originalBudgetCr / 10))) : 16;

    return {
      project: p,
      xExecution: p.actualPhysicalProgress ?? 50,
      yRisk: p.riskScore,
      bubbleRadius: budgetSize,
      riskCategory: p.riskLevel || (p.riskScore >= 75 ? 'Critical' : p.riskScore >= 50 ? 'High' : 'Medium'),
      primaryAttentionReason: reason
    };
  });
}

/**
 * Ranks priority projects requiring attention.
 */
export function getPriorityProjects(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): RankedPriorityProject[] {
  return projects.map(p => {
    const gap = (p.targetPhysicalProgress ?? 0) - (p.actualPhysicalProgress ?? 0);
    const pAlerts = alerts.filter(a => a.projectId === p.id && a.status !== 'Resolved').length;
    const pActions = actions.filter(ac => ac.projectId === p.id && ac.status === 'Pending').length;
    const dq = calculateDataQuality(p).overallScore;

    let reason = 'Schedule deviation is currently the primary attention signal.';
    if (pAlerts > 0) reason = 'Active unacknowledged Early Warning alert requiring review.';
    else if (p.riskScore >= 80) reason = 'Critical AI Risk score calculated by predictive engine.';
    else if (gap >= 12) reason = `Physical progress gap of -${gap}% behind planned target.`;
    else if (pActions > 0) reason = 'Unresolved high-priority recommended officer action.';
    else if (dq < 60) reason = 'Low data quality readiness score requiring telemetry verification.';

    return {
      project: p,
      riskScore: p.riskScore,
      riskLevel: p.riskLevel,
      actualProgress: p.actualPhysicalProgress,
      targetProgress: p.targetPhysicalProgress,
      progressGap: gap,
      scheduleStatus: p.delayDays > 0 ? `+${p.delayDays}d Delay` : 'On Schedule',
      dataQualityScore: dq,
      activeWarningsCount: pAlerts,
      pendingActionsCount: pActions,
      primaryAttentionReason: reason
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Side-by-side comparison matrix for selected projects.
 */
export function compareProjects(allProjects: Project[], selectedIds: string[]): ProjectComparisonResult {
  const selected = allProjects.filter(p => selectedIds.includes(p.id));

  const metrics = [
    {
      id: 'riskScore',
      label: 'AI Risk Score',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: `${p.riskScore}/100 (${p.riskLevel})` }), {})
    },
    {
      id: 'progress',
      label: 'Actual / Target Progress',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: `${p.actualPhysicalProgress}% / ${p.targetPhysicalProgress}%` }), {})
    },
    {
      id: 'progressGap',
      label: 'Progress Gap',
      values: selected.reduce((acc, p) => {
        const gap = p.actualPhysicalProgress - p.targetPhysicalProgress;
        return { ...acc, [p.id]: `${gap > 0 ? '+' : ''}${gap}%` };
      }, {})
    },
    {
      id: 'delayDays',
      label: 'Schedule Delay',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: p.delayDays > 0 ? `+${p.delayDays} days` : 'On Schedule' }), {})
    },
    {
      id: 'budget',
      label: 'Approved Budget',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: p.originalBudgetCr ? `₹${p.originalBudgetCr} Cr` : 'N/A' }), {})
    },
    {
      id: 'expenditure',
      label: 'Expenditure to Date',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: p.expenditureToDateCr ? `₹${p.expenditureToDateCr} Cr` : 'N/A' }), {})
    },
    {
      id: 'dataQuality',
      label: 'Data Quality Score',
      values: selected.reduce((acc, p) => ({ ...acc, [p.id]: `${calculateDataQuality(p).overallScore}%` }), {})
    }
  ];

  return {
    projects: selected,
    metrics
  };
}

/**
 * Aggregates intelligence by department.
 */
export function getDepartmentIntelligence(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): DepartmentIntelligenceItem[] {
  const map: { [dept: string]: DepartmentIntelligenceItem } = {};

  projects.forEach(p => {
    const dept = p.department || 'Infrastructure Development';
    if (!map[dept]) {
      map[dept] = {
        departmentName: dept,
        totalProjects: 0,
        highRiskProjects: 0,
        averageRiskScore: 0,
        projectsBehindPlan: 0,
        activeWarningsCount: 0,
        pendingActionsCount: 0
      };
    }

    map[dept].totalProjects += 1;
    if (p.riskScore >= 70 || p.riskLevel === 'High' || p.riskLevel === 'Critical') {
      map[dept].highRiskProjects += 1;
    }
    map[dept].averageRiskScore += p.riskScore;
    if (p.targetPhysicalProgress - p.actualPhysicalProgress >= 5) {
      map[dept].projectsBehindPlan += 1;
    }
    map[dept].activeWarningsCount += alerts.filter(a => a.projectId === p.id && a.status !== 'Resolved').length;
    map[dept].pendingActionsCount += actions.filter(ac => ac.projectId === p.id && ac.status === 'Pending').length;
  });

  return Object.values(map).map(item => ({
    ...item,
    averageRiskScore: item.totalProjects > 0 ? Math.round(item.averageRiskScore / item.totalProjects) : 0
  })).sort((a, b) => b.averageRiskScore - a.averageRiskScore);
}

/**
 * Operational Attention Queue for Portfolio.
 */
export function getAttentionQueue(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): OperationalAttentionItem[] {
  const items: OperationalAttentionItem[] = [];

  // 1. Critical Early Warnings
  alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').forEach((a) => {
    const p = projects.find(proj => proj.id === a.projectId);
    if (p) {
      items.push({
        id: `att-alert-${a.id}`,
        rank: 1,
        priorityLevel: 'CRITICAL',
        project: p,
        issue: a.title,
        reason: a.triggerCondition || a.description,
        recommendedNextStep: a.recommendedAction || 'Review early warning details and acknowledge alert.',
        targetHash: `#/alerts`
      });
    }
  });

  // 2. High Risk Projects with severe progress gaps
  projects.filter(p => p.riskScore >= 75).forEach((p) => {
    items.push({
      id: `att-proj-${p.id}`,
      rank: 2,
      priorityLevel: 'HIGH',
      project: p,
      issue: `Critical Risk Score (${p.riskScore}/100)`,
      reason: `Project progress is lagging target plan by ${Math.abs(p.targetPhysicalProgress - p.actualPhysicalProgress)}%.`,
      recommendedNextStep: 'Open Execution Control Center and verify contractor resource deployment.',
      targetHash: `#/projects/${p.id}/execution`
    });
  });

  // 3. Urgent Recommended Actions
  actions.filter(ac => ac.priority === 'Urgent' && ac.status === 'Pending').forEach((ac) => {
    const p = projects.find(proj => proj.id === ac.projectId);
    if (p) {
      items.push({
        id: `att-act-${ac.id}`,
        rank: 3,
        priorityLevel: 'HIGH',
        project: p,
        issue: ac.title,
        reason: ac.rationale,
        recommendedNextStep: 'Authorize recommended action protocol.',
        targetHash: `#/actions`
      });
    }
  });

  return items.slice(0, 6);
}

/**
 * Deterministic Executive Summary generator from real portfolio data.
 */
export function generateExecutiveSummary(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): ExecutiveSummaryReport {
  const summary = getPortfolioSummary(projects, alerts, actions);
  const highestRiskProject = [...projects].sort((a, b) => b.riskScore - a.riskScore)[0];
  const mostLaggingProject = [...projects].sort((a, b) => (b.targetPhysicalProgress - b.actualPhysicalProgress) - (a.targetPhysicalProgress - a.actualPhysicalProgress))[0];

  return {
    portfolioStateText: `${summary.totalProjects} national infrastructure projects are currently under active monitoring across sectors.`,
    keySignalText: summary.projectsBehindPlanCount > 0 
      ? `${summary.projectsBehindPlanCount} projects exhibit schedule deviation, trailing planned execution targets by an average of ${Math.abs(summary.averageProgressGap)}%.` 
      : 'All projects are currently maintaining target execution velocity.',
    topPriorityText: highestRiskProject 
      ? `${highestRiskProject.name} (${highestRiskProject.code}) represents the highest portfolio risk with an AI Risk Score of ${highestRiskProject.riskScore}/100.` 
      : 'No high-risk projects identified.',
    watchText: mostLaggingProject 
      ? `${mostLaggingProject.name} shows increasing physical progress gap (-${mostLaggingProject.targetPhysicalProgress - mostLaggingProject.actualPhysicalProgress}%).` 
      : 'No critical schedule drift detected.',
    dataQualityText: `${alerts.filter(a => a.status === 'New').length} unacknowledged early warnings and ${actions.filter(ac => ac.status === 'Pending').length} pending recommended actions are queued in the system.`
  };
}
