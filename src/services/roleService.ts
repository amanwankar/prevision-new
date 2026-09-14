import type { RoleDefinition, PermissionKey, UserRole } from '../types';

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; description: string }[] = [
  { key: 'view_dashboard', label: 'View Dashboard', description: 'Access project monitoring overview dashboard' },
  { key: 'view_projects', label: 'View Projects', description: 'Browse authorized project directory and details' },
  { key: 'edit_projects', label: 'Edit Projects', description: 'Update physical progress, target dates, and monitoring notes' },
  { key: 'view_risk_analytics', label: 'View Risk Analytics', description: 'Access predictive risk models and SHAP factor breakdown' },
  { key: 'review_warnings', label: 'Review Early Warnings', description: 'Acknowledge, review, and update early warning alerts' },
  { key: 'generate_reports', label: 'Generate Reports', description: 'Create and export official project and executive briefing reports' },
  { key: 'manage_users', label: 'Manage Users & Roles', description: 'Create, edit, and deactivate system users and assign project access' },
  { key: 'view_audit_logs', label: 'View Audit Logs', description: 'Inspect system-wide security, user, and project audit trails' },
  { key: 'manage_departments', label: 'Manage Departments', description: 'Create and configure organizational department structures' },
  { key: 'manage_settings', label: 'Configure System Settings', description: 'Configure risk score thresholds, security rules, and API settings' }
];

export const APPLICATION_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    title: 'System Administrator',
    description: 'Full administrative access to manage users, roles, departments, system settings, and inspect audit logs.',
    permissions: [
      'view_dashboard',
      'view_projects',
      'edit_projects',
      'view_risk_analytics',
      'review_warnings',
      'generate_reports',
      'manage_users',
      'view_audit_logs',
      'manage_departments',
      'manage_settings'
    ]
  },
  {
    id: 'senior_director',
    title: 'Senior Monitoring Officer',
    description: 'High-level portfolio oversight to view authorized projects, macro analytics, early warnings, and generate executive briefs.',
    permissions: [
      'view_dashboard',
      'view_projects',
      'edit_projects',
      'view_risk_analytics',
      'review_warnings',
      'generate_reports',
      'view_audit_logs'
    ]
  },
  {
    id: 'sector_lead',
    title: 'Project Monitoring Officer',
    description: 'Operational officer access to manage assigned sector projects, review warnings, update notes, and generate reports.',
    permissions: [
      'view_dashboard',
      'view_projects',
      'edit_projects',
      'view_risk_analytics',
      'review_warnings',
      'generate_reports'
    ]
  },
  {
    id: 'field_inspector',
    title: 'Project Manager',
    description: 'Field management access to view assigned projects, update physical progress milestones, and respond to prescriptive actions.',
    permissions: [
      'view_dashboard',
      'view_projects',
      'edit_projects',
      'view_risk_analytics',
      'review_warnings',
      'generate_reports'
    ]
  },
  {
    id: 'viewer',
    title: 'Viewer',
    description: 'Read-only access to view authorized project dashboards and reports. Cannot alter project data or user settings.',
    permissions: [
      'view_dashboard',
      'view_projects',
      'view_risk_analytics',
      'generate_reports'
    ]
  }
];

export function getRoleDefinition(roleId: UserRole): RoleDefinition {
  return APPLICATION_ROLES.find(r => r.id === roleId) || APPLICATION_ROLES[2];
}

export function hasPermission(roleId: UserRole, permissionKey: PermissionKey): boolean {
  const role = getRoleDefinition(roleId);
  return role.permissions.includes(permissionKey);
}
