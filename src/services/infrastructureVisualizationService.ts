import type { Project, EarlyWarning, RecommendedAction, RiskLevel } from '../types';

export interface VisualNode {
  id: string;
  code: string;
  name: string;
  sector: Project['sector'];
  department: string;
  state: string;
  locationName: string;
  lat: number;
  lng: number;
  
  // Risk & Progress
  riskScore: number;
  riskLevel: RiskLevel;
  primaryRisk: string;
  status: Project['status'];
  
  actualPhysicalProgress: number;
  targetPhysicalProgress: number;
  progressGap: number;
  delayDays: number;
  
  // Financials
  originalBudgetCr: number;
  expenditureToDateCr: number;
  budgetUtilizationPct: number;
  
  // Related counts
  warningCount: number;
  activeWarningSeverity?: EarlyWarning['severity'];
  activeWarningId?: string;
  
  actionCount: number;
  pendingActionPriority?: RecommendedAction['priority'];
  pendingActionId?: string;
  
  // Visual Asset Meta
  assetClass: 'highway' | 'bridge' | 'metro' | 'power_grid' | 'port' | 'water_facility' | 'smart_zone';
  x: number; // 0 to 100 on canvas grid
  y: number; // 0 to 100 on canvas grid
  radius: number;
}

export interface NetworkConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 0.1 to 1
  label?: string;
  status: 'calm' | 'active_pulse' | 'warning_signal';
}

export interface InfrastructureGraphData {
  nodes: VisualNode[];
  connections: NetworkConnection[];
  summary: {
    totalProjects: number;
    highRiskCount: number;
    activeWarningsCount: number;
    pendingActionsCount: number;
    averageRiskScore: number;
    averageProgress: number;
  };
}

export type VisualizationMode = 'OVERVIEW' | 'RISK' | 'PROGRESS' | 'WARNINGS' | 'ACTIONS';

/**
 * Maps project sector to an abstract digital asset class for visual representation
 */
export function getAssetClass(sector: string): VisualNode['assetClass'] {
  switch (sector) {
    case 'Highways': return 'highway';
    case 'Railways': return 'bridge';
    case 'Urban Transit': return 'metro';
    case 'Power & Energy': return 'power_grid';
    case 'Ports & Waterways': return 'port';
    case 'Water Supply & Sanitation': return 'water_facility';
    case 'Smart Cities': return 'smart_zone';
    default: return 'smart_zone';
  }
}

/**
 * Transforms raw project, alert, and action data into visualization nodes and network edges
 */
export function buildInfrastructureGraph(
  projects: Project[],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = []
): InfrastructureGraphData {
  if (!projects || projects.length === 0) {
    return {
      nodes: [],
      connections: [],
      summary: {
        totalProjects: 0,
        highRiskCount: 0,
        activeWarningsCount: 0,
        pendingActionsCount: 0,
        averageRiskScore: 0,
        averageProgress: 0,
      },
    };
  }

  // Map latitude/longitude to a balanced 2.5D grid space (0-100%)
  // India approx bounding box: lat 8-36, lng 68-97
  const nodes: VisualNode[] = projects.map((p) => {
    // Project warnings & actions matching
    const projAlerts = alerts.filter(a => a.projectId === p.id && a.status !== 'Resolved');
    const projActions = actions.filter(ac => ac.projectId === p.id && ac.status !== 'Completed' && ac.status !== 'Executed');

    const warningCount = projAlerts.length;
    const actionCount = projActions.length;

    // Highest severity alert
    const activeWarningSeverity = projAlerts.find(a => a.severity === 'Critical')?.severity
      || projAlerts.find(a => a.severity === 'High')?.severity
      || projAlerts[0]?.severity;

    const pendingActionPriority = projActions.find(ac => ac.priority === 'Urgent')?.priority
      || projActions.find(ac => ac.priority === 'High')?.priority
      || projActions[0]?.priority;

    // Grid coordinates
    const origX = ((p.lng - 68) / (97 - 68)) * 100;
    const origY = 100 - ((p.lat - 8) / (36 - 8)) * 100;

    // Clamp within 12% to 88% margin for canvas padding
    const x = Math.max(12, Math.min(88, origX));
    const y = Math.max(14, Math.min(86, origY));

    const progressGap = p.actualPhysicalProgress - p.targetPhysicalProgress;
    const budgetUtil = p.originalBudgetCr > 0 ? (p.expenditureToDateCr / p.originalBudgetCr) * 100 : 0;

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      sector: p.sector,
      department: p.department,
      state: p.state,
      locationName: p.locationName,
      lat: p.lat,
      lng: p.lng,
      
      riskScore: p.riskScore,
      riskLevel: p.riskLevel,
      primaryRisk: p.primaryRisk,
      status: p.status,
      
      actualPhysicalProgress: p.actualPhysicalProgress,
      targetPhysicalProgress: p.targetPhysicalProgress,
      progressGap,
      delayDays: p.delayDays,
      
      originalBudgetCr: p.originalBudgetCr,
      expenditureToDateCr: p.expenditureToDateCr,
      budgetUtilizationPct: Math.round(budgetUtil),
      
      warningCount,
      activeWarningSeverity,
      activeWarningId: projAlerts[0]?.id,
      
      actionCount,
      pendingActionPriority,
      pendingActionId: projActions[0]?.id,
      
      assetClass: getAssetClass(p.sector),
      x,
      y,
      radius: p.riskScore >= 75 ? 18 : p.riskScore >= 50 ? 14 : 11,
    };
  });

  // Construct meaningful network connections based on State or Department corridors
  const connections: NetworkConnection[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];

      const sameState = n1.state === n2.state;
      const sameDepartment = n1.department === n2.department;
      const sameSector = n1.sector === n2.sector;

      if (sameState || sameDepartment || (sameSector && Math.hypot(n1.x - n2.x, n1.y - n2.y) < 30)) {
        const distance = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        if (distance < 45) {
          const isWarningPath = n1.riskScore >= 75 || n2.riskScore >= 75 || n1.warningCount > 0 || n2.warningCount > 0;
          connections.push({
            id: `conn_${n1.id}_${n2.id}`,
            sourceId: n1.id,
            targetId: n2.id,
            strength: Math.max(0.2, 1 - distance / 45),
            label: sameState ? `${n1.state} Corridor` : `${n1.sector} Axis`,
            status: isWarningPath ? 'warning_signal' : (n1.riskScore >= 50 || n2.riskScore >= 50) ? 'active_pulse' : 'calm',
          });
        }
      }
    }
  }

  // Summary Metrics
  const highRiskCount = nodes.filter(n => n.riskScore >= 70 || n.riskLevel === 'High' || n.riskLevel === 'Critical').length;
  const activeWarningsCount = nodes.reduce((sum, n) => sum + n.warningCount, 0);
  const pendingActionsCount = nodes.reduce((sum, n) => sum + n.actionCount, 0);
  const avgRisk = Math.round(nodes.reduce((sum, n) => sum + n.riskScore, 0) / nodes.length);
  const avgProg = Math.round(nodes.reduce((sum, n) => sum + n.actualPhysicalProgress, 0) / nodes.length);

  return {
    nodes,
    connections,
    summary: {
      totalProjects: nodes.length,
      highRiskCount,
      activeWarningsCount,
      pendingActionsCount,
      averageRiskScore: avgRisk,
      averageProgress: avgProg,
    },
  };
}

/**
 * Calculates compact radial health components for a project
 */
export function calculateProjectHealthRadar(node: VisualNode) {
  // Progress Health Score (0 to 100)
  const progressHealth = Math.min(100, Math.max(0, 100 + node.progressGap * 2));
  
  // Schedule Health (Delay days penalty)
  const scheduleHealth = Math.max(0, Math.min(100, 100 - node.delayDays * 0.4));
  
  // Cost Utilization Health
  const costHealth = Math.max(0, Math.min(100, 100 - Math.max(0, node.budgetUtilizationPct - node.actualPhysicalProgress)));
  
  // Risk Score inverse
  const riskHealth = Math.max(0, 100 - node.riskScore);

  // Overall Health Index
  const overallIndex = Math.round((progressHealth + scheduleHealth + costHealth + riskHealth) / 4);

  return {
    overallIndex,
    categories: [
      { key: 'Progress', score: Math.round(progressHealth), color: progressHealth > 70 ? '#10b981' : progressHealth > 40 ? '#f59e0b' : '#ef4444' },
      { key: 'Schedule', score: Math.round(scheduleHealth), color: scheduleHealth > 70 ? '#10b981' : scheduleHealth > 40 ? '#f59e0b' : '#ef4444' },
      { key: 'Budget', score: Math.round(costHealth), color: costHealth > 70 ? '#10b981' : costHealth > 40 ? '#f59e0b' : '#ef4444' },
      { key: 'Risk Index', score: Math.round(riskHealth), color: riskHealth > 70 ? '#10b981' : riskHealth > 40 ? '#f59e0b' : '#ef4444' },
    ],
  };
}
