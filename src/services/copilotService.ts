import type { Project, EarlyWarning, RecommendedAction, User } from '../types';
import { 
  getOverallRiskMetrics, 
  getTopRiskFactors 
} from './analyticsService';
import { calculateRiskAnalysis } from './riskEngine';
import { calculateDataQuality } from './dataQualityService';
import { 
  getAuthorizedProjects, 
  getAuthorizedAlerts, 
  getAuthorizedActions 
} from './accessControlService';

export type CopilotResponseType = 
  | 'text' 
  | 'project_cards' 
  | 'warning_cards' 
  | 'action_cards' 
  | 'comparison_table' 
  | 'portfolio_summary' 
  | 'executive_summary' 
  | 'navigation' 
  | 'error';

export interface CopilotDeepLink {
  label: string;
  targetPage: string;
  targetId?: string;
  hash: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  responseType?: CopilotResponseType;
  data?: any;
  dataSources?: string[];
  deepLinks?: CopilotDeepLink[];
  followUpQuestions?: string[];
  isThinking?: boolean;
}

export interface CopilotQueryContext {
  activePage?: string;
  selectedProjectId?: string;
  selectedAlertId?: string;
  selectedActionId?: string;
}

/**
 * Process a natural language Copilot prompt using the application's actual data model.
 * Pure deterministic data query engine respecting RBAC permissions.
 */
export function processCopilotQuery(
  rawPrompt: string,
  user: User | null,
  allProjects: Project[],
  allAlerts: EarlyWarning[],
  allActions: RecommendedAction[],
  context: CopilotQueryContext = {}
): CopilotMessage {
  const prompt = rawPrompt.trim().toLowerCase();
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // 1. RBAC Filter Data Slices
  const projects = getAuthorizedProjects(user, allProjects);
  const alerts = getAuthorizedAlerts(user, allAlerts, allProjects);
  const actions = getAuthorizedActions(user, allActions, allProjects);

  // 2. Identify Context Project if on details page
  const contextProject = context.selectedProjectId 
    ? projects.find(p => p.id === context.selectedProjectId)
    : undefined;

  // 3. Query Intent Pattern Matching

  // --- QUERY TYPE: PORTFOLIO SUMMARY & OVERVIEW ---
  if (
    prompt.includes('portfolio summary') ||
    prompt.includes('portfolio health') ||
    prompt.includes('portfolio overview') ||
    prompt.includes('portfolio situation') ||
    prompt.includes('portfolio risk')
  ) {
    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `**National Portfolio Summary**: Monitoring **${projects.length} infrastructure projects** across sectors. **${projects.filter(p => p.riskScore >= 70).length} projects** are currently classified as High/Critical Risk, with **${alerts.filter(a => a.status === 'New').length} unacknowledged early warnings** queued for officer review.`,
      responseType: 'portfolio_summary',
      data: {
        totalProjects: projects.length,
        highRiskCount: projects.filter(p => p.riskScore >= 70).length,
        activeWarnings: alerts.length,
        pendingActions: actions.length
      },
      dataSources: ['PRAEVISIO Portfolio Intelligence Center', 'National Project Repository'],
      deepLinks: [
        { label: 'Open Portfolio Intelligence Center', targetPage: 'portfolio', hash: '#/portfolio' },
        { label: 'Open Executive Situation Room', targetPage: 'executive_reports', hash: '#/reports/executive' }
      ],
      followUpQuestions: [
        'Which projects need attention first?',
        'Which department has the most projects at risk?',
        'Compare the highest-risk projects'
      ]
    };
  }

  // --- QUERY TYPE: EXECUTION HEALTH & EXECUTION CONTROL ---
  if (
    prompt.includes('execution health') ||
    prompt.includes('execution control') ||
    prompt.includes('execution status') ||
    prompt.includes('execution summary') ||
    prompt.includes('behind plan')
  ) {
    const targetProj = contextProject || projects[0];
    const actual = targetProj?.actualPhysicalProgress ?? 0;
    const target = targetProj?.targetPhysicalProgress ?? 0;
    const gap = actual - target;

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: targetProj 
        ? `**Execution Control Health** for **${targetProj.name} (${targetProj.code})**: Physical progress is at **${actual}%** against planned baseline target **${target}%** (Gap: **${gap}%**). Delay projection is **+${targetProj.delayDays} days**.`
        : `No specific project context selected. Review the portfolio execution status in the Execution Control Center.`,
      responseType: 'text',
      dataSources: ['PRAEVISIO Execution Control Engine', 'Milestone Telemetry'],
      deepLinks: targetProj 
        ? [{ label: `Open Execution Control for ${targetProj.code}`, targetPage: 'project_execution', targetId: targetProj.id, hash: `#/projects/${targetProj.id}/execution` }]
        : [{ label: 'Open Portfolio Intelligence', targetPage: 'portfolio', hash: '#/portfolio' }],
      followUpQuestions: [
        'What is the biggest current risk?',
        'Which milestone needs attention?',
        'What should the monitoring officer review first?'
      ]
    };
  }

  // --- QUERY TYPE: HIGH RISK PROJECTS ---
  if (
    prompt.includes('high risk') || 
    prompt.includes('critical risk') || 
    prompt.includes('need attention') || 
    prompt.includes('requiring attention') ||
    prompt.includes('most risky')
  ) {
    const highRiskProjects = projects
      .filter(p => p.riskScore >= 70 || p.status === 'At Risk' || p.status === 'Delayed')
      .sort((a, b) => b.riskScore - a.riskScore);

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Identified **${highRiskProjects.length} projects** currently exhibiting elevated risk levels requiring intervention:`,
      responseType: 'project_cards',
      data: {
        projects: highRiskProjects,
        title: 'HIGH-RISK INFRASTRUCTURE PROJECTS'
      },
      dataSources: ['PRAEVISIO Risk Engine', 'Current Monitored Portfolio'],
      deepLinks: [
        { label: 'Open Projects Directory', targetPage: 'projects', hash: '#/projects' },
        { label: 'Open Risk Analytics', targetPage: 'analytics', hash: '#/risk-analytics' }
      ],
      followUpQuestions: [
        `Why is ${highRiskProjects[0]?.name || 'the top project'} high risk?`,
        'Show active warnings for these projects',
        'What actions should officers prioritize?'
      ]
    };
  }

  // --- QUERY TYPE: DATA QUALITY & INCOMPLETE DATA ---
  if (
    prompt.includes('data quality') ||
    prompt.includes('incomplete data') ||
    prompt.includes('data review') ||
    prompt.includes('validation issue') ||
    prompt.includes('data attention')
  ) {
    const dataAttentionProjects = projects
      .filter((p) => {
        const q = calculateDataQuality(p);
        return q.status !== 'DATA READY' || q.overallScore < 85;
      })
      .sort((a, b) => calculateDataQuality(a).overallScore - calculateDataQuality(b).overallScore);

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Identified **${dataAttentionProjects.length} projects** requiring data validation or quality score updates before risk engine execution:`,
      responseType: 'project_cards',
      data: {
        projects: dataAttentionProjects,
        title: 'PROJECTS REQUIRING DATA QUALITY ATTENTION',
      },
      dataSources: ['PRAEVISIO Data Intelligence Center', 'Data Quality Matrix'],
      deepLinks: [
        { label: 'Open Data Intelligence Center', targetPage: 'data_management', hash: '#/data-management' },
      ],
      followUpQuestions: [
        'Which project has the lowest data quality score?',
        'Run data quality scan for portfolio',
      ],
    };
  }

  // --- QUERY TYPE: SCHEDULE DELAY / PROGRESS GAPS ---
  if (
    prompt.includes('delay') || 
    prompt.includes('progress gap') || 
    prompt.includes('behind plan') || 
    prompt.includes('behind schedule') ||
    prompt.includes('slow progress')
  ) {
    const delayedProjects = projects
      .filter(p => p.delayDays > 0 || (p.targetPhysicalProgress - p.actualPhysicalProgress) > 5)
      .sort((a, b) => (b.targetPhysicalProgress - b.actualPhysicalProgress) - (a.targetPhysicalProgress - a.actualPhysicalProgress));

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Found **${delayedProjects.length} projects** operating below target physical progress timelines:`,
      responseType: 'project_cards',
      data: {
        projects: delayedProjects,
        title: 'PROJECTS WITH PHYSICAL PROGRESS GAPS & DELAYS'
      },
      dataSources: ['Schedule Telemetry Data', 'Physical Progress Tracking'],
      deepLinks: [
        { label: 'Open Timeline Intelligence Center', targetPage: 'project_timeline', targetId: delayedProjects[0]?.id, hash: `#/projects/${delayedProjects[0]?.id || 'p1'}/timeline` },
        { label: 'View Risk Analytics', targetPage: 'analytics', hash: '#/risk-analytics' }
      ],
      followUpQuestions: [
        'Which project has the largest progress gap?',
        'Show active warnings for delayed projects',
        'Compare top delayed projects'
      ]
    };
  }

  // --- QUERY TYPE: EXPLAIN SPECIFIC PROJECT RISK ---
  if (
    prompt.includes('why') || 
    prompt.includes('explain risk') || 
    prompt.includes('risk factor') ||
    (contextProject && (prompt.includes('this project') || prompt.includes('risky')))
  ) {
    // Determine target project
    let targetProject = contextProject;
    if (!targetProject) {
      targetProject = projects.find(p => 
        prompt.includes(p.name.toLowerCase()) || 
        prompt.includes(p.code.toLowerCase()) ||
        prompt.includes(p.sector.toLowerCase())
      ) || projects.sort((a, b) => b.riskScore - a.riskScore)[0];
    }

    if (targetProject) {
      const riskAnalysis = calculateRiskAnalysis(targetProject);
      const projectAlerts = alerts.filter(a => a.projectId === targetProject!.id);
      const projectActions = actions.filter(ac => ac.projectId === targetProject!.id);

      return {
        id: `cop-res-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `Here is the AI Risk Explanation for **${targetProject.name} (${targetProject.code})**:`,
        responseType: 'text',
        data: {
          project: targetProject,
          riskScore: targetProject.riskScore,
          primaryRisk: targetProject.primaryRisk,
          explanations: riskAnalysis.explanation.contributingPoints,
          warningsCount: projectAlerts.length,
          actionsCount: projectActions.length
        },
        dataSources: ['PRAEVISIO Explainable Risk Engine (XAI)', `Project File: ${targetProject.code}`],
        deepLinks: [
          { label: `Open ${targetProject.code} Intelligence`, targetPage: 'details', targetId: targetProject.id, hash: `#/projects/${targetProject.id}` }
        ],
        followUpQuestions: [
          `Show warnings for ${targetProject.code}`,
          `Show recommended actions for ${targetProject.code}`,
          'Compare with other projects in this sector'
        ]
      };
    }
  }

  // --- QUERY TYPE: ACTIVE EARLY WARNINGS ---
  if (
    prompt.includes('warning') || 
    prompt.includes('alert') || 
    prompt.includes('early warning') ||
    prompt.includes('unresolved warnings')
  ) {
    const activeAlerts = alerts
      .filter(a => a.status === 'New' || a.status === 'Open' || a.status === 'Acknowledged')
      .sort((a, b) => (b.severity === 'Critical' ? 4 : b.severity === 'High' ? 3 : 2) - (a.severity === 'Critical' ? 4 : a.severity === 'High' ? 3 : 2));

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `There are currently **${activeAlerts.length} active early warnings** requiring officer review:`,
      responseType: 'warning_cards',
      data: {
        alerts: activeAlerts,
        title: 'ACTIVE EARLY WARNING QUEUE'
      },
      dataSources: ['Early Warning Alert Engine', 'Audit Stream'],
      deepLinks: [
        { label: 'Open Early Warnings Queue', targetPage: 'alerts', hash: '#/alerts' }
      ],
      followUpQuestions: [
        'Which warnings are critical severity?',
        'What actions are recommended for these warnings?',
        'Show portfolio risk summary'
      ]
    };
  }

  // --- QUERY TYPE: RECOMMENDED ACTIONS ---
  if (
    prompt.includes('action') || 
    prompt.includes('pending action') || 
    prompt.includes('prioritize') ||
    prompt.includes('what should')
  ) {
    const pendingActions = actions
      .filter(ac => ac.status === 'Pending' || ac.status === 'In Progress')
      .sort((a, b) => (b.priority === 'Urgent' ? 3 : b.priority === 'High' ? 2 : 1) - (a.priority === 'Urgent' ? 3 : a.priority === 'High' ? 2 : 1));

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Found **${pendingActions.length} operational response actions** currently pending or in progress:`,
      responseType: 'action_cards',
      data: {
        actions: pendingActions,
        title: 'RECOMMENDED OPERATIONAL RESPONSE ACTIONS'
      },
      dataSources: ['Prescriptive Action Engine'],
      deepLinks: [
        { label: 'Open Recommended Actions', targetPage: 'actions', hash: '#/actions' }
      ],
      followUpQuestions: [
        'Show urgent priority actions',
        'Which actions are assigned to me?',
        'Give me a portfolio summary'
      ]
    };
  }

  // --- QUERY TYPE: COMPARE PROJECTS ---
  if (
    prompt.includes('compare') || 
    prompt.includes('vs') || 
    prompt.includes('comparison')
  ) {
    const sorted = [...projects].sort((a, b) => b.riskScore - a.riskScore);
    const compProjects = sorted.slice(0, 3);

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Side-by-side comparative analysis of top monitored infrastructure projects:`,
      responseType: 'comparison_table',
      data: {
        projects: compProjects
      },
      dataSources: ['Portfolio Analytics Service', 'Comparative Risk Engine'],
      deepLinks: [
        { label: 'Open Risk Analytics Scatter Matrix', targetPage: 'analytics', hash: '#/risk-analytics' }
      ],
      followUpQuestions: [
        'Why is the top project high risk?',
        'Show active warnings',
        'Give me an executive summary'
      ]
    };
  }

  // --- QUERY TYPE: PORTFOLIO & EXECUTIVE SUMMARY ---
  if (
    prompt.includes('summary') || 
    prompt.includes('portfolio') || 
    prompt.includes('executive summary') || 
    prompt.includes('overview') ||
    prompt.includes('briefing')
  ) {
    const metrics = getOverallRiskMetrics(projects);
    const topFactors = getTopRiskFactors(projects);
    const activeAlertsCount = alerts.filter(a => a.status === 'New' || a.status === 'Open').length;
    const pendingActionsCount = actions.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Comprehensive Infrastructure Portfolio Intelligence Briefing:`,
      responseType: 'portfolio_summary',
      data: {
        metrics,
        topFactors,
        activeAlertsCount,
        pendingActionsCount,
        totalProjects: projects.length,
        highRiskProjects: projects.filter(p => p.riskScore >= 70)
      },
      dataSources: ['Executive Command Center Service', 'PRAEVISIO Master Telemetry'],
      deepLinks: [
        { label: 'Open Executive Situation Room', targetPage: 'executive_reports', hash: '#/reports/executive' },
        { label: 'Open Reports Generator', targetPage: 'reports', hash: '#/reports' }
      ],
      followUpQuestions: [
        'Show high-risk projects',
        'Show active warnings',
        'What actions should decision-makers prioritize?'
      ]
    };
  }

  // --- QUERY TYPE: SEMANTIC NAVIGATION COMMANDS ---
  if (
    prompt.includes('go to') || 
    prompt.includes('open') || 
    prompt.includes('navigate to') ||
    prompt.includes('take me to')
  ) {
    let targetPage = 'dashboard';
    let targetHash = '#/';
    let label = 'Dashboard';

    if (prompt.includes('executive') || prompt.includes('situation room')) {
      targetPage = 'executive_reports';
      targetHash = '#/reports/executive';
      label = 'Executive Situation Room';
    } else if (prompt.includes('project')) {
      targetPage = 'projects';
      targetHash = '#/projects';
      label = 'Projects Directory';
    } else if (prompt.includes('alert') || prompt.includes('warning')) {
      targetPage = 'alerts';
      targetHash = '#/alerts';
      label = 'Early Warnings';
    } else if (prompt.includes('action')) {
      targetPage = 'actions';
      targetHash = '#/actions';
      label = 'Recommended Actions';
    } else if (prompt.includes('analytic') || prompt.includes('risk')) {
      targetPage = 'analytics';
      targetHash = '#/risk-analytics';
      label = 'Risk Analytics';
    }

    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Direct navigation ready for **${label}**:`,
      responseType: 'navigation',
      data: {
        label,
        targetPage,
        hash: targetHash
      },
      dataSources: ['Platform Navigation Routing'],
      deepLinks: [
        { label: `Navigate to ${label}`, targetPage, hash: targetHash }
      ],
      followUpQuestions: [
        'Show portfolio summary',
        'Show high-risk projects'
      ]
    };
  }

  // --- FALLBACK GENERAL MATCH ---
  // Try searching project names or codes
  const matchedProject = projects.find(p => 
    prompt.includes(p.name.toLowerCase()) || 
    prompt.includes(p.code.toLowerCase()) ||
    prompt.includes(p.sector.toLowerCase())
  );

  if (matchedProject) {
    return {
      id: `cop-res-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `Found project record for **${matchedProject.name} (${matchedProject.code})**:`,
      responseType: 'project_cards',
      data: {
        projects: [matchedProject],
        title: 'PROJECT TELEMETRY MATCH'
      },
      dataSources: [`Project Record: ${matchedProject.code}`],
      deepLinks: [
        { label: `Open ${matchedProject.code} Intelligence`, targetPage: 'details', targetId: matchedProject.id, hash: `#/projects/${matchedProject.id}` }
      ],
      followUpQuestions: [
        `Why is ${matchedProject.code} at risk?`,
        `Show warnings for ${matchedProject.code}`,
        `Show actions for ${matchedProject.code}`
      ]
    };
  }

  // General Intelligent Fallback
  return {
    id: `cop-res-${Date.now()}`,
    sender: 'assistant',
    timestamp,
    text: `I analyzed your query across **${projects.length} monitored infrastructure projects**, **${alerts.length} early warnings**, and **${actions.length} recommended actions**.

Here are key suggested actions to explore:`,
    responseType: 'text',
    dataSources: ['PRAEVISIO Intelligence Query Engine'],
    deepLinks: [
      { label: 'View High-Risk Projects', targetPage: 'projects', hash: '#/projects' },
      { label: 'Open Executive Situation Room', targetPage: 'executive_reports', hash: '#/reports/executive' }
    ],
    followUpQuestions: [
      'Show high-risk projects',
      'Show active warnings',
      'Give me a portfolio summary',
      'Compare top projects'
    ]
  };
}
