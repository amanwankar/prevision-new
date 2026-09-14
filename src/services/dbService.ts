import type { Project, EarlyWarning, RecommendedAction, RiskHistory, SystemAuditLog } from '../types';
import { initialProjects, initialEarlyWarnings, initialRecommendedActions, riskTrendHistory } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PROJECTS: 'praevisio_projects_v2',
  WARNINGS: 'praevisio_warnings_v2',
  ACTIONS: 'praevisio_actions_v2',
  AUDIT_LOGS: 'praevisio_audit_logs_v2'
};

const initialAuditLogs: SystemAuditLog[] = [
  {
    id: 'log-01',
    event: 'Alert Generated',
    user: 'System Risk Engine',
    timestamp: '2026-09-12 10:42 IST',
    relatedProjectId: 'PRJ-001',
    relatedAlertId: 'ew-01',
    details: 'Potential Schedule Delay warning triggered for National Highway Expansion.'
  },
  {
    id: 'log-02',
    event: 'Alert Acknowledged',
    user: 'Rajesh V. Sharma',
    timestamp: '2026-09-12 09:40 IST',
    relatedProjectId: 'PRJ-002',
    relatedAlertId: 'ew-02',
    details: 'Officer acknowledged Cost Pressure alert for Urban Water Supply.'
  }
];

export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data && data.length > 0) {
        return data as unknown as Project[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local store', e);
    }
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage error', e);
  }
  return initialProjects;
}

export function saveProjectsLocally(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('LocalStorage save failed', e);
  }
}

export async function getEarlyWarnings(): Promise<EarlyWarning[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('early_warnings').select('*');
      if (!error && data && data.length > 0) {
        return data as unknown as EarlyWarning[];
      }
    } catch (e) {
      console.warn('Supabase warnings fetch failed', e);
    }
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEYS.WARNINGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage warnings error', e);
  }
  return initialEarlyWarnings;
}

export function saveEarlyWarningsLocally(warnings: EarlyWarning[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WARNINGS, JSON.stringify(warnings));
  } catch (e) {
    console.error('LocalStorage save warnings failed', e);
  }
}

export async function getRecommendedActions(): Promise<RecommendedAction[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('recommended_actions').select('*');
      if (!error && data && data.length > 0) {
        return data as unknown as RecommendedAction[];
      }
    } catch (e) {
      console.warn('Supabase actions fetch failed', e);
    }
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage actions error', e);
  }
  return initialRecommendedActions;
}

export function saveRecommendedActionsLocally(actions: RecommendedAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (e) {
    console.error('LocalStorage save actions failed', e);
  }
}

export function getRiskTrendHistory(): RiskHistory[] {
  return riskTrendHistory;
}

export function getAuditLogs(): SystemAuditLog[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage audit logs error', e);
  }
  return initialAuditLogs;
}

export function saveAuditLogLocally(log: SystemAuditLog): void {
  try {
    const existing = getAuditLogs();
    const updated = [log, ...existing];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage save audit log failed', e);
  }
}

