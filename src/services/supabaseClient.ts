import { createClient } from '@supabase/supabase-js';
import type { Project, Alert, PrescriptiveAction } from '../types';
import { initialProjects, initialAlerts, initialActions } from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Local Memory / LocalStorage Persistence Layer when Supabase is not connected
const LOCAL_STORAGE_KEY_PROJECTS = 'praevisio_projects_v1';
const LOCAL_STORAGE_KEY_ALERTS = 'praevisio_alerts_v1';
const LOCAL_STORAGE_KEY_ACTIONS = 'praevisio_actions_v1';

export function getStoredProjects(): Project[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('LocalStorage read failed, using initial projects', e);
  }
  return initialProjects;
}

export function saveStoredProjects(projects: Project[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export function getStoredAlerts(): Alert[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ALERTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('LocalStorage read failed', e);
  }
  return initialAlerts;
}

export function saveStoredAlerts(alerts: Alert[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export function getStoredActions(): PrescriptiveAction[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('LocalStorage read failed', e);
  }
  return initialActions;
}

export function saveStoredActions(actions: PrescriptiveAction[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIONS, JSON.stringify(actions));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}
