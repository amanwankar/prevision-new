import type { User, Project, EarlyWarning, RecommendedAction } from '../types';

/**
 * PRAEVISIO Access Control & Authorization Service
 * Pure authorization service enforcing Role-Based Access Control (RBAC),
 * Department-Level Authorization, and Project-Level Authorization.
 * Core Principle: AUTHORIZED USER → AUTHORIZED PROJECTS → AUTHORIZED ACTIONS
 */

/**
 * Check if user is authorized to view a specific project
 */
export function canViewProject(user: User | null, project: Project): boolean {
  if (!user) return false;
  if (user.status === 'Inactive') return false;

  // System Administrators and Senior Directors have full portfolio access
  if (user.role === 'admin' || user.role === 'senior_director') {
    return true;
  }

  // Project-Level Authorization check
  if (user.authorizedProjects && user.authorizedProjects.length > 0) {
    return user.authorizedProjects.includes(project.id);
  }

  // Department-Level Authorization check
  if (user.authorizedDepartments && user.authorizedDepartments.length > 0) {
    if (user.authorizedDepartments.includes('All') || user.authorizedDepartments.includes(project.department)) {
      return true;
    }
  }

  // Fallback sector-based assignment
  if (user.assignedSectors && user.assignedSectors.length > 0) {
    return user.assignedSectors.includes(project.sector);
  }

  return false;
}

/**
 * Check if user is authorized to edit a project
 */
export function canEditProject(user: User | null, project?: Project): boolean {
  if (!user || user.status === 'Inactive') return false;
  if (user.role === 'viewer') return false;

  if (project && !canViewProject(user, project)) {
    return false;
  }

  // Admin, Senior Director, Sector Lead (Officer), Field Inspector (Manager) can edit authorized projects
  return true;
}

/**
 * Check if user can view risk analytics
 */
export function canViewRisk(user: User | null, project?: Project): boolean {
  if (!user || user.status === 'Inactive') return false;
  if (project) return canViewProject(user, project);
  return true;
}

/**
 * Check if user can manage administrative users (Admin only)
 */
export function canManageUsers(user: User | null): boolean {
  if (!user || user.status === 'Inactive') return false;
  return user.role === 'admin';
}

/**
 * Check if user can view system audit logs (Admin & Senior Director)
 */
export function canViewAuditLogs(user: User | null): boolean {
  if (!user || user.status === 'Inactive') return false;
  return user.role === 'admin' || user.role === 'senior_director';
}

/**
 * Check if user can generate official reports
 */
export function canGenerateReports(user: User | null): boolean {
  if (!user || user.status === 'Inactive') return false;
  return true;
}

/**
 * Check if user can manage system security settings (Admin only)
 */
export function canManageSettings(user: User | null): boolean {
  if (!user || user.status === 'Inactive') return false;
  return user.role === 'admin';
}

/**
 * Check if user can manage department structures (Admin only)
 */
export function canManageDepartments(user: User | null): boolean {
  if (!user || user.status === 'Inactive') return false;
  return user.role === 'admin';
}

/**
 * Filter projects list to only those authorized for the current user
 */
export function getAuthorizedProjects(user: User | null, allProjects: Project[]): Project[] {
  if (!user || user.status === 'Inactive') return [];
  if (!allProjects || allProjects.length === 0) return [];

  if (user.role === 'admin' || user.role === 'senior_director') {
    return allProjects;
  }

  return allProjects.filter(p => canViewProject(user, p));
}

/**
 * Filter early warnings queue to only those corresponding to authorized projects
 */
export function getAuthorizedAlerts(
  user: User | null, 
  allAlerts: EarlyWarning[], 
  allProjects: Project[]
): EarlyWarning[] {
  if (!user || user.status === 'Inactive') return [];
  if (!allAlerts || allAlerts.length === 0) return [];

  const authorizedProjIds = new Set(getAuthorizedProjects(user, allProjects).map(p => p.id));
  return allAlerts.filter(a => authorizedProjIds.has(a.projectId));
}

/**
 * Filter recommended actions to only those corresponding to authorized projects
 */
export function getAuthorizedActions(
  user: User | null, 
  allActions: RecommendedAction[], 
  allProjects: Project[]
): RecommendedAction[] {
  if (!user || user.status === 'Inactive') return [];
  if (!allActions || allActions.length === 0) return [];

  const authorizedProjIds = new Set(getAuthorizedProjects(user, allProjects).map(p => p.id));
  return allActions.filter(act => authorizedProjIds.has(act.projectId));
}
