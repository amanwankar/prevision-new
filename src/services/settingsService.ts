import type { SecuritySettings } from '../types';
import { saveAuditLogLocally } from './dbService';

const STORAGE_KEY_SETTINGS = 'praevisio_security_settings_v2';

const defaultSettings: SecuritySettings = {
  lowRiskThreshold: 30,
  mediumRiskThreshold: 60,
  highRiskThreshold: 75,
  earlyWarningNotifications: true,
  highRiskAlerts: true,
  actionDueReminders: true,
  reportNotifications: true,
  emailNotificationsEnabled: false, // Disabled until external SMTP service is configured
  sessionTimeoutMinutes: 30,
  passwordPolicy: 'Government Compliance',
  twoFactorAvailable: false // Configured for future authentication hardening
};

export function getSecuritySettings(): SecuritySettings {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && typeof parsed.highRiskThreshold === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load security settings from localStorage', e);
  }
  return defaultSettings;
}

export function saveSecuritySettings(settings: SecuritySettings, performedBy: string = 'System Administrator'): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));

    saveAuditLogLocally({
      id: `log-${Date.now()}`,
      event: 'Security Settings Updated',
      user: performedBy,
      timestamp: new Date().toLocaleString('en-IN'),
      relatedProjectId: 'ADMIN_SETTINGS',
      details: `Updated system risk thresholds (High: ${settings.highRiskThreshold}) and session parameters.`
    });
  } catch (e) {
    console.error('Failed to save security settings', e);
  }
}
