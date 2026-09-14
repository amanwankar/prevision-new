import type { Project, EarlyWarning, RecommendedAction, User, SystemAuditLog } from '../types';

export type EventCategory = 
  | 'RISK_DETECTED' 
  | 'EARLY_WARNING' 
  | 'ACTION_REQUIRED' 
  | 'ACTION_UPDATED' 
  | 'PROJECT_UPDATED' 
  | 'REPORT_READY' 
  | 'SYSTEM_EVENT' 
  | 'AUDIT_EVENT';

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IntelligenceEvent {
  id: string;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  warningId?: string;
  actionId?: string;
  reportId?: string;
  riskScore?: number;
  
  isRead: boolean;
  createdAt: string; // ISO date or formatted
  readAt?: string;
  
  authorizedDepartments?: string[];
  authorizedProjects?: string[];
}

// In-memory read state tracking across session
const readEventIds = new Set<string>();

/**
 * Dynamically builds authorized notification events from current project, warning, action, and audit log state.
 */
export function getAuthorizedNotifications(
  user: User | null,
  projects: Project[] = [],
  alerts: EarlyWarning[] = [],
  actions: RecommendedAction[] = [],
  auditLogs: SystemAuditLog[] = []
): IntelligenceEvent[] {
  const events: IntelligenceEvent[] = [];

  // 1. High Risk & Critical Project Events
  projects.forEach((p) => {
    if (p.riskScore >= 70 || p.riskLevel === 'High' || p.riskLevel === 'Critical') {
      events.push({
        id: `ev_risk_${p.id}`,
        category: 'RISK_DETECTED',
        severity: p.riskScore >= 85 ? 'CRITICAL' : 'HIGH',
        title: `HIGH-RISK PROJECT DETECTED: ${p.name}`,
        description: `Project AI Risk Score reached ${p.riskScore}/100 with ${p.delayDays} days delay projection. Primary driver: ${p.primaryRisk}.`,
        projectId: p.id,
        projectCode: p.code,
        projectName: p.name,
        riskScore: p.riskScore,
        isRead: readEventIds.has(`ev_risk_${p.id}`),
        createdAt: '12m ago',
        authorizedDepartments: [p.department],
        authorizedProjects: [p.id],
      });
    }
  });

  // 2. Early Warning Alert Events
  alerts.forEach((a) => {
    const proj = projects.find((p) => p.id === a.projectId);
    events.push({
      id: `ev_alert_${a.id}`,
      category: 'EARLY_WARNING',
      severity: a.severity === 'Critical' ? 'CRITICAL' : a.severity === 'High' ? 'HIGH' : a.severity === 'Medium' ? 'MEDIUM' : 'LOW',
      title: `EARLY WARNING: ${a.title}`,
      description: `Trigger condition met on ${a.projectName}: ${a.description}`,
      projectId: a.projectId,
      projectCode: a.projectCode,
      projectName: a.projectName,
      warningId: a.id,
      riskScore: a.riskScore || proj?.riskScore,
      isRead: readEventIds.has(`ev_alert_${a.id}`),
      createdAt: a.timeAgo || '30m ago',
      authorizedDepartments: [a.department],
      authorizedProjects: [a.projectId],
    });
  });

  // 3. Recommended Action Events
  actions.forEach((ac) => {
    events.push({
      id: `ev_action_${ac.id}`,
      category: ac.status === 'Completed' || ac.status === 'Executed' ? 'ACTION_UPDATED' : 'ACTION_REQUIRED',
      severity: ac.priority === 'Urgent' ? 'HIGH' : ac.priority === 'High' ? 'MEDIUM' : 'LOW',
      title: `ACTION ${ac.status.toUpperCase()}: ${ac.title}`,
      description: `Targeting ${ac.projectName} (${ac.category}). Assigned officer: ${ac.assignedTo}. Status: ${ac.status}.`,
      projectId: ac.projectId,
      projectCode: ac.projectCode,
      projectName: ac.projectName,
      actionId: ac.id,
      isRead: readEventIds.has(`ev_action_${ac.id}`),
      createdAt: '1h ago',
      authorizedDepartments: [ac.department],
      authorizedProjects: [ac.projectId],
    });
  });

  // 4. System & Audit Log Events
  auditLogs.slice(0, 5).forEach((log) => {
    events.push({
      id: `ev_audit_${log.id}`,
      category: 'AUDIT_EVENT',
      severity: 'INFO',
      title: `AUDIT LOG: ${log.event}`,
      description: `Recorded by ${log.user}. ${log.details}`,
      projectId: log.relatedProjectId,
      isRead: readEventIds.has(`ev_audit_${log.id}`),
      createdAt: log.timestamp || '2h ago',
    });
  });

  // Filter based on User Authorization Scope (RBAC)
  if (!user || user.role === 'admin' || user.role === 'senior_director') {
    return events.sort((a, b) => (a.severity === 'CRITICAL' ? -1 : b.severity === 'CRITICAL' ? 1 : 0));
  }

  return events.filter((ev) => {
    // Project-level RBAC
    if (user.authorizedProjects && user.authorizedProjects.length > 0 && ev.projectId) {
      if (!user.authorizedProjects.includes(ev.projectId)) return false;
    }
    // Department-level RBAC
    if (user.authorizedDepartments && user.authorizedDepartments.length > 0 && ev.authorizedDepartments) {
      if (!ev.authorizedDepartments.some((d) => user.authorizedDepartments?.includes(d))) return false;
    }
    return true;
  }).sort((a, b) => (a.severity === 'CRITICAL' ? -1 : b.severity === 'CRITICAL' ? 1 : 0));
}

export function markNotificationAsRead(id: string) {
  readEventIds.add(id);
}

export function markAllNotificationsAsRead(events: IntelligenceEvent[]) {
  events.forEach((ev) => readEventIds.add(ev.id));
}

export function calculateSmartSummary(events: IntelligenceEvent[]): string {
  const unread = events.filter((e) => !e.isRead);
  const critical = events.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH');

  if (events.length === 0) {
    return 'All system monitoring feeds are clear. No unresolved intelligence events detected.';
  }

  if (critical.length > 0) {
    return `${critical.length} high-priority intelligence event${critical.length > 1 ? 's' : ''} require immediate officer review across monitored corridors.`;
  }

  return `${unread.length} unread intelligence update${unread.length > 1 ? 's' : ''} available in the active platform event stream.`;
}
