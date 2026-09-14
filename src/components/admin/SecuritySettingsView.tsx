import React, { useState } from 'react';
import type { SecuritySettings } from '../../types';
import { getSecuritySettings, saveSecuritySettings } from '../../services/settingsService';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Lock, 
  Server
} from 'lucide-react';

export const SecuritySettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>(getSecuritySettings());
  const [activeTab, setActiveTab] = useState<'risk' | 'notifications' | 'access' | 'system'>('risk');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    saveSecuritySettings(settings);
    showToast('Security settings updated successfully.');
  };

  return (
    <div className="space-y-6 font-sans pb-20 min-w-0">
      
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[80] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-stagger-fade">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <SettingsIcon className="w-5 h-5 text-amber-400 shrink-0" />
            <span>SYSTEM & SECURITY SETTINGS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calibrate analytical risk thresholds, notification rules, access policies, and component health.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg self-start sm:self-auto"
        >
          Save Configuration
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
            activeTab === 'risk' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Risk Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
            activeTab === 'notifications' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
            activeTab === 'access' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Access Control Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 ${
            activeTab === 'system' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Component Status</span>
        </button>
      </div>

      {/* TAB 1: RISK CONFIGURATION */}
      {activeTab === 'risk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white">Risk Score Classification Thresholds</h3>
            <p className="text-xs text-slate-400">Calibrate overall project risk index score boundaries (0 - 100 range).</p>
          </div>

          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3.5 rounded-r text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Calibration Disclosure: </span>
              Risk thresholds are configurable application parameters and should be calibrated against validated model/business requirements before production use.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-400">Low Risk Threshold</span>
                <span className="font-mono text-white text-sm">0 – {settings.lowRiskThreshold}</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={settings.lowRiskThreshold}
                onChange={(e) => setSettings({ ...settings, lowRiskThreshold: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-slate-400">Projects with scores below {settings.lowRiskThreshold} are categorized as On Track.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-amber-400">Medium Risk Threshold</span>
                <span className="font-mono text-white text-sm">{settings.lowRiskThreshold + 1} – {settings.mediumRiskThreshold}</span>
              </div>
              <input
                type="range"
                min="46"
                max="70"
                value={settings.mediumRiskThreshold}
                onChange={(e) => setSettings({ ...settings, mediumRiskThreshold: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-slate-400">Projects with scores between {settings.lowRiskThreshold + 1} and {settings.mediumRiskThreshold} trigger moderate monitoring notes.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-red-400">High Risk Threshold</span>
                <span className="font-mono text-white text-sm">&gt; {settings.highRiskThreshold}</span>
              </div>
              <input
                type="range"
                min="71"
                max="90"
                value={settings.highRiskThreshold}
                onChange={(e) => setSettings({ ...settings, highRiskThreshold: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
              <p className="text-[10px] text-slate-400">Projects exceeding {settings.highRiskThreshold} trigger automated early warning alerts.</p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATION RULES */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white">Alert Dispatch & Notification Rules</h3>
            <p className="text-xs text-slate-400">Configure trigger conditions for in-app alert notifications and officer reminders.</p>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-white">Early Warning Trigger Notifications</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Push notifications when physical progress gap or milestone delay triggers warning.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.earlyWarningNotifications}
                onChange={(e) => setSettings({ ...settings, earlyWarningNotifications: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 accent-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-white">High Risk Escalation Alerts</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Immediate alert dispatch when project risk score exceeds {settings.highRiskThreshold}/100.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.highRiskAlerts}
                onChange={(e) => setSettings({ ...settings, highRiskAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 accent-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div>
                <div className="font-bold text-white">Action Resolution Due Reminders</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Automated reminders for assigned officers before prescriptive action target resolution dates.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.actionDueReminders}
                onChange={(e) => setSettings({ ...settings, actionDueReminders: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 accent-teal-500"
              />
            </label>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Email Service Dispatch</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  SMTP Integration Required
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Email dispatch is currently disabled. External SMTP gateway integration is required before enabling automated email notifications.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ACCESS CONTROL POLICIES */}
      {activeTab === 'access' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white">Session Security & Access Control Policies</h3>
            <p className="text-xs text-slate-400">Configure officer session timeouts, password strength rules, and multi-factor authentication.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <label className="block font-bold text-white">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 font-mono"
              />
              <p className="text-[10px] text-slate-400">Automatically terminates inactive sessions after configured duration.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <label className="block font-bold text-white">Password Complexity Policy</label>
              <select
                value={settings.passwordPolicy}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
              >
                <option value="Standard">Standard (8+ characters)</option>
                <option value="Strict">Strict (12+ characters, special symbols)</option>
                <option value="Government Compliance">Government Compliance (14+ characters, rotation policy)</option>
              </select>
            </div>

          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-white">
              <span>Two-Factor Authentication (2FA)</span>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                Future Integration Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              2FA integration available for future authentication hardening.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM COMPONENT STATUS */}
      {activeTab === 'system' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">System Architecture Health</h3>
              <p className="text-xs text-slate-400">Live operational status of core monitoring stack components.</p>
            </div>

            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-mono font-bold">
              Demo Environment
            </span>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-bold text-white">Frontend Web Application</div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-bold text-white">PRAEVISIO AI Risk Engine</div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-bold text-white">Database / Repository Layer</div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Operational (Demo Repository)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-bold text-white">Notification Service</div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                In-App Only
              </span>
            </div>

          </div>
        </div>
      )}

      {/* SECURITY DISCLAIMER FOOTER */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 leading-relaxed flex items-start space-x-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">SECURITY DISCLAIMER: </span>
          Security controls shown in this demonstration represent the application's access-control design. Production deployment should undergo security testing, infrastructure hardening and appropriate organizational review.
        </div>
      </div>

    </div>
  );
};
