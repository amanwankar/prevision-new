import type { 
  Project, 
  EarlyWarning, 
  RecommendedAction, 
  User, 
  GeneratedReport, 
  ReportFilterOptions, 
  ReportHistoryItem,
  ExecutivePriorityItem
} from '../types';
import { calculateRiskAnalysis } from './riskEngine';
import { getOverallRiskMetrics, getRiskTypeDistribution } from './analyticsService';
import { saveAuditLogLocally } from './dbService';

const STORAGE_KEY_REPORT_HISTORY = 'praevisio_report_history_v2';

const defaultSections = {
  includeOverview: true,
  includeProgress: true,
  includeCost: true,
  includeRiskAssessment: true,
  includeRiskExplanation: true,
  includeEarlyWarnings: true,
  includeRecommendedActions: true,
  includeRiskHistory: true,
  includeAuditSummary: true
};

/**
 * Initial Mock Report History for Demo Initial State
 */
const initialReportHistory: ReportHistoryItem[] = [
  {
    id: 'REP-2026-001',
    name: 'National Highway Expansion - Project Monitoring Briefing',
    type: 'project_monitoring',
    projectId: 'PRJ-001',
    projectName: 'National Highway Expansion',
    generatedBy: 'Rajesh V. Sharma (Monitoring Officer)',
    generatedDate: '2026-09-12 10:30 IST',
    status: 'Generated',
    fileSize: '1.2 MB'
  },
  {
    id: 'REP-2026-002',
    name: 'Q3 National Infrastructure Executive Overview',
    type: 'executive_summary',
    generatedBy: 'Dr. Ananya Roy (Senior Director)',
    generatedDate: '2026-09-11 16:45 IST',
    status: 'Generated',
    fileSize: '2.4 MB'
  },
  {
    id: 'REP-2026-003',
    name: 'Urban Water Supply Phase 2 - Risk Audit Report',
    type: 'risk_assessment',
    projectId: 'PRJ-002',
    projectName: 'Urban Water Supply Phase 2',
    generatedBy: 'Vikram Singh (Sector Lead)',
    generatedDate: '2026-09-10 11:15 IST',
    status: 'Generated',
    fileSize: '950 KB'
  }
];

export function getReportHistory(): ReportHistoryItem[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_REPORT_HISTORY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('Failed to load report history from localStorage', e);
  }
  return initialReportHistory;
}

export function saveReportHistoryItem(item: ReportHistoryItem): void {
  try {
    const existing = getReportHistory();
    const filtered = existing.filter(h => h.id !== item.id);
    const updated = [item, ...filtered];
    localStorage.setItem(STORAGE_KEY_REPORT_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report history to localStorage', e);
  }
}

export function deleteReportHistoryItem(id: string): void {
  try {
    const existing = getReportHistory();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_REPORT_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete report history item', e);
  }
}

/**
 * Generate Human-Readable Summary text dynamically from actual project/risk data
 */
export function generateDynamicSummary(project: Project): string {
  const analysis = calculateRiskAnalysis(project);
  const progressGap = project.targetPhysicalProgress - project.actualPhysicalProgress;
  const isProgressBehind = progressGap > 0;
  const hasDelayDays = project.delayDays > 0;

  let text = `Project physical progress is currently at ${project.actualPhysicalProgress}%, trailing the planned baseline target of ${project.targetPhysicalProgress}% by ${Math.abs(progressGap).toFixed(1)}%. `;

  if (isProgressBehind) {
    text += `The current risk assessment indicates elevated schedule risk (Score: ${analysis.riskScore}/100, Level: ${analysis.riskLevel}). `;
  } else {
    text += `The project is maintaining on-schedule progress with a manageable risk score (${analysis.riskScore}/100). `;
  }

  if (hasDelayDays && isProgressBehind) {
    text += `A projected completion delay of +${project.delayDays} days is anticipated based on current milestone performance. `;
  }

  if (project.costOverrunForecastCr > 0) {
    text += `Potential cost pressure of ₹${project.costOverrunForecastCr} Cr has been flagged. `;
  }

  text += `Active warnings and recommended actions should be reviewed by the concerned officer for timely intervention.`;

  return text;
}

/**
 * Calculate Transparent Priority Ranking for Executive Section
 * Standard Formula:
 * PriorityScore = (RiskScore * 0.45) + (ProgressGap * 0.35) + (ActiveWarning ? 12 : 0) + (CostOverrun > 0 ? 8 : 0)
 */
export function calculateExecutivePriorityProjects(
  projects: Project[], 
  alerts: EarlyWarning[], 
  actions: RecommendedAction[]
): ExecutivePriorityItem[] {
  const scoredItems: ExecutivePriorityItem[] = projects.map(p => {
    const progressGap = Math.max(0, p.targetPhysicalProgress - p.actualPhysicalProgress);
    const projAlerts = alerts.filter(a => a.projectId === p.id && a.status !== 'Resolved');
    const projActions = actions.filter(a => a.projectId === p.id && a.status !== 'Completed' && a.status !== 'Executed');

    const hasActiveWarning = projAlerts.length > 0;
    const activeWarningTitle = projAlerts[0]?.title || 'No active warnings';
    const recommendedActionTitle = projActions[0]?.title || 'Routine monitoring';

    const priorityScore = Math.round(
      (p.riskScore * 0.45) + 
      (progressGap * 0.35) + 
      (hasActiveWarning ? 12 : 0) + 
      (p.costOverrunForecastCr > 0 ? 8 : 0)
    );

    return {
      priorityRank: 0, // Assigned after sorting
      project: p,
      riskScore: p.riskScore,
      primaryRisk: p.primaryRisk || 'Schedule Delay',
      progressGap,
      activeWarningTitle,
      recommendedActionTitle,
      priorityScore
    };
  });

  // Sort descending by calculated priority score
  scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);

  return scoredItems.map((item, index) => ({
    ...item,
    priorityRank: index + 1
  }));
}

/**
 * Generate Data-Driven Executive Insights (Calculated, not hardcoded)
 */
export function generateExecutiveInsights(
  projects: Project[], 
  alerts: EarlyWarning[]
): string[] {
  if (!projects || projects.length === 0) return [];

  const typeDist = getRiskTypeDistribution(projects);

  const activeWarningsCount = alerts.filter(a => a.status === 'New' || a.status === 'Open').length;
  const significantGapCount = projects.filter(p => (p.targetPhysicalProgress - p.actualPhysicalProgress) >= 10).length;
  const highRiskIncreasing = projects.filter(p => p.riskScore >= 75).length;
  const topRiskType = typeDist.sort((a, b) => b.count - a.count)[0]?.type || 'Schedule Delay';

  const insights: string[] = [];

  insights.push(`${highRiskIncreasing} projects currently show elevated risk scores requiring immediate senior review.`);
  insights.push(`${topRiskType} is the most frequently identified primary risk type across active projects.`);
  insights.push(`${activeWarningsCount} projects currently have active early warnings awaiting officer resolution.`);
  insights.push(`${significantGapCount} projects exhibit physical progress gaps exceeding 10% below planned schedule targets.`);

  return insights;
}

/**
 * Generate Project Monitoring Report
 */
export function generateProjectReport(
  project: Project,
  _alerts: EarlyWarning[],
  _actions: RecommendedAction[],
  options?: Partial<ReportFilterOptions>,
  user?: User
): GeneratedReport {
  const reportId = `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const summaryText = generateDynamicSummary(project);
  const sections = { ...defaultSections, ...options?.sections };

  const report: GeneratedReport = {
    id: reportId,
    title: `Project Monitoring Report: ${project.name} (${project.code})`,
    reportType: 'project_monitoring',
    project,
    generatedBy: user ? `${user.name} (${user.designation || user.role})` : 'Monitoring Officer',
    generatedByRole: user?.role || 'sector_lead',
    generatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    dataPeriod: '01 September – 12 September 2026',
    scope: `${project.department} • ${project.state}`,
    status: 'Generated',
    sections,
    summaryText
  };

  // Log audit event
  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Report Generated',
    user: user?.name || 'Monitoring Officer',
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: project.id,
    details: `Generated Project Monitoring Report (${reportId}) for ${project.code}.`
  });

  return report;
}

/**
 * Generate Risk Assessment Report
 */
export function generateRiskReport(
  project: Project,
  _alerts: EarlyWarning[],
  _actions: RecommendedAction[],
  options?: Partial<ReportFilterOptions>,
  user?: User
): GeneratedReport {
  const reportId = `REP-RSK-${Math.floor(1000 + Math.random() * 9000)}`;
  const analysis = calculateRiskAnalysis(project);
  const sections = { ...defaultSections, ...options?.sections };

  const summaryText = `AI-powered risk analysis evaluates ${project.name} at a ${analysis.riskScore}/100 (${analysis.riskLevel}) risk rating. Primary driver: ${analysis.primaryRisk}. ${analysis.explanation.summary}`;

  const report: GeneratedReport = {
    id: reportId,
    title: `Risk Assessment Report: ${project.name} (${project.code})`,
    reportType: 'risk_assessment',
    project,
    generatedBy: user ? `${user.name} (${user.role})` : 'System Risk Analyst',
    generatedByRole: user?.role || 'admin',
    generatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    dataPeriod: 'Current Live Evaluation',
    scope: `Risk Analytics • ${project.sector}`,
    status: 'Generated',
    sections,
    summaryText
  };

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Report Generated',
    user: user?.name || 'Risk Analyst',
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: project.id,
    details: `Generated Risk Assessment Report (${reportId}) for ${project.code}.`
  });

  return report;
}

/**
 * Generate Early Warning Report
 */
export function generateWarningReport(
  project: Project,
  alerts: EarlyWarning[],
  _actions: RecommendedAction[],
  options?: Partial<ReportFilterOptions>,
  user?: User
): GeneratedReport {
  const reportId = `REP-EW-${Math.floor(1000 + Math.random() * 9000)}`;
  const projAlerts = alerts.filter(a => a.projectId === project.id);
  const sections = { ...defaultSections, ...options?.sections };

  const summaryText = `Project ${project.code} currently has ${projAlerts.length} early warning triggers recorded. Active warning resolution is monitored under MoSPI IPMD early warning protocols.`;

  const report: GeneratedReport = {
    id: reportId,
    title: `Early Warning Summary Report: ${project.name}`,
    reportType: 'early_warning',
    project,
    generatedBy: user ? user.name : 'Nodal Early Warning Officer',
    generatedByRole: user?.role || 'sector_lead',
    generatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    dataPeriod: '01 Sep – 12 Sep 2026',
    scope: `${project.sector} Early Warning Queue`,
    status: 'Generated',
    sections,
    summaryText
  };

  return report;
}

/**
 * Generate Executive Report
 */
export function generateExecutiveReport(
  projects: Project[],
  alerts: EarlyWarning[],
  actions: RecommendedAction[],
  user?: User
): GeneratedReport {
  const reportId = `REP-EXEC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const priorityProjects = calculateExecutivePriorityProjects(projects, alerts, actions);
  const executiveInsights = generateExecutiveInsights(projects, alerts);
  const sections = { ...defaultSections };

  const metrics = getOverallRiskMetrics(projects);
  const summaryText = `National Infrastructure Portfolio Briefing: Monitoring ${projects.length} projects representing ₹${projects.reduce((a, b) => a + b.originalBudgetCr, 0).toLocaleString()} Cr in capital outlay. Portfolio risk index: ${metrics.overallRiskIndex}/100. ${metrics.highRiskCount} projects require immediate senior officer intervention.`;

  const report: GeneratedReport = {
    id: reportId,
    title: 'Executive Project Monitoring Overview',
    reportType: 'executive_summary',
    allProjects: projects,
    generatedBy: user ? `${user.name} (${user.designation || 'Senior Director'})` : 'Senior Director (IPMD)',
    generatedByRole: user?.role || 'senior_director',
    generatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    dataPeriod: 'Q3 2026 Portfolio Audit',
    scope: 'All National Infrastructure Sectors',
    status: 'Generated',
    sections,
    summaryText,
    executiveInsights,
    priorityProjects
  };

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Report Generated',
    user: user?.name || 'Senior Director',
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ALL_PORTFOLIO',
    details: `Generated Executive Project Monitoring Overview (${reportId}).`
  });

  return report;
}

/**
 * Export CSV
 */
export function exportCSV(projects: Project[], filename: string = 'PRAEVISIO_Project_Monitoring_Report'): void {
  const headers = [
    'Project ID',
    'Project Code',
    'Project Name',
    'Sector',
    'Department',
    'State',
    'Location',
    'Original Budget (Cr)',
    'Expenditure To Date (Cr)',
    'Target Progress (%)',
    'Actual Progress (%)',
    'Progress Gap (%)',
    'Risk Score',
    'Risk Level',
    'Primary Risk',
    'Delay Days',
    'Cost Overrun Forecast (Cr)',
    'Status'
  ];

  const rows = projects.map(p => [
    p.id,
    p.code,
    `"${p.name.replace(/"/g, '""')}"`,
    p.sector,
    `"${p.department.replace(/"/g, '""')}"`,
    p.state,
    `"${p.locationName.replace(/"/g, '""')}"`,
    p.originalBudgetCr,
    p.expenditureToDateCr,
    p.targetPhysicalProgress,
    p.actualPhysicalProgress,
    (p.targetPhysicalProgress - p.actualPhysicalProgress).toFixed(1),
    p.riskScore,
    p.riskLevel,
    `"${p.primaryRisk.replace(/"/g, '""')}"`,
    p.delayDays,
    p.costOverrunForecastCr,
    p.status
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Report Exported',
    user: 'Officer',
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'EXPORT',
    details: `Exported ${projects.length} project records to CSV format.`
  });
}

/**
 * Export PDF (Trigger Browser Print / Print to PDF)
 */
export function exportPDF(): void {
  window.print();
}
