import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Database,
  Activity, 
  AlertOctagon, 
  Lightbulb, 
  FileSpreadsheet, 
  Users, 
  Settings as SettingsIcon, 
  ChevronRight,
  Building2,
  LogOut,
  X,
  ShieldCheck,
  Key,
  ShieldAlert,
  Sparkles,
  Layers,
  Radio
} from 'lucide-react';
import type { User, EarlyWarning } from '../types';
import { canManageUsers, canViewAuditLogs, canManageSettings } from '../services/accessControlService';
import { PulseIndicator } from './motion/PulseIndicator';
import { AIOrbit } from './motion/AIOrbit';

interface SidebarProps {
  activePage: string;
  onSelectPage: (page: string) => void;
  currentUser: User;
  alerts: EarlyWarning[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenCopilot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  currentUser,
  alerts,
  mobileOpen,
  onCloseMobile,
  onLogout,
  onOpenCopilot
}) => {
  const newAlertsCount = alerts.filter(a => a.status === 'New').length;

  const isAdmin = currentUser.role === 'admin';
  const isSenior = currentUser.role === 'senior_director';
  const showAdminSection = canManageUsers(currentUser) || canViewAuditLogs(currentUser) || canManageSettings(currentUser);

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Intelligence', icon: FolderKanban, hash: '#/portfolio' },
    { 
      id: 'projects', 
      label: isAdmin || isSenior ? 'Projects Directory' : 'My Projects', 
      icon: Layers 
    },
    { id: 'data_management', label: 'Data Intelligence Center', icon: Database, hash: '#/data-management' },
    { id: 'digital_twin', label: 'Digital Twin Center', icon: Layers, hash: '#/digital-twin' },
    { id: 'analytics', label: 'Risk Analytics', icon: Activity },
    { 
      id: 'alerts', 
      label: 'Early Warnings', 
      icon: AlertOctagon,
      badge: newAlertsCount > 0 ? newAlertsCount : undefined,
      badgeColor: 'bg-red-600 text-white'
    },
    { id: 'actions', label: 'Recommended Actions', icon: Lightbulb },
    { id: 'notifications', label: 'Intelligence Event Center', icon: Radio, hash: '#/notifications' },
    { id: 'executive_reports', label: 'Executive Situation Room', icon: ShieldAlert, hash: '#/reports/executive' },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const adminMenuItems = [
    { id: 'admin_dashboard', label: 'Admin Overview', icon: ShieldCheck, hash: '#/admin' },
    { id: 'users', label: 'Users & Access', icon: Users, hash: '#/admin/users', permission: canManageUsers(currentUser) },
    { id: 'departments', label: 'Departments', icon: Building2, hash: '#/admin/departments', permission: canManageUsers(currentUser) },
    { id: 'roles', label: 'Roles & Matrix', icon: Key, hash: '#/admin/roles', permission: canManageUsers(currentUser) },
    { id: 'audit_logs', label: 'System Audit Logs', icon: ShieldAlert, hash: '#/admin/audit-logs', permission: canViewAuditLogs(currentUser) },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon, hash: '#/admin/settings', permission: canManageSettings(currentUser) },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between py-4">
      
      <div className="overflow-y-auto">
        {/* Branding Logo */}
        <div className="px-4 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/40">
              P
            </div>
            <div>
              <div className="font-black text-base tracking-wider text-white flex items-center space-x-1.5">
                <span>PRAEVISIO</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">v2.6</span>
              </div>
              <p className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase">AI Project Monitoring</p>
            </div>
          </div>
          
          {/* Close button for mobile drawer */}
          <button 
            onClick={onCloseMobile}
            aria-label="Close Mobile Navigation Menu"
            className="md:hidden text-slate-400 hover:text-white p-1 focus-ring touch-target-safe"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="px-4 pt-4 mb-2">
          <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            Main Monitoring
          </p>
        </div>

        <nav className="space-y-1 px-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  if (item.hash) window.location.hash = item.hash;
                  onCloseMobile();
                }}
                className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 focus-ring ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#06b6d4]" />
                )}

                <div className="flex items-center space-x-3 pl-1">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400 glow-text-cyan' : 'text-slate-500'}`} />
                  <span className={isActive ? 'font-bold text-white' : ''}>{item.label}</span>
                </div>
                
                {item.badge !== undefined ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Administration Section (Adaptive based on permissions) */}
        {showAdminSection && (
          <>
            <div className="px-4 pt-5 mb-2 border-t border-slate-800/80 mt-3">
              <p className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase flex items-center space-x-1.5">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Administration</span>
              </p>
            </div>

            <nav className="space-y-1 px-2">
              {adminMenuItems.map((item) => {
                if (item.permission === false) return null;

                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectPage(item.id);
                      if (item.hash) window.location.hash = item.hash;
                      onCloseMobile();
                    }}
                    className={`w-full relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_#f59e0b]" />
                    )}
                    <div className="flex items-center space-x-3 pl-1">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className={isActive ? 'font-bold text-white' : ''}>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </nav>
          </>
        )}

      </div>

      {/* Bottom Live System Indicators & Profile */}
      <div className="px-3 pt-3 border-t border-slate-800/80 space-y-3 shrink-0">
        
        {/* System Status Indicators Box */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center justify-between">
            <span>System Status</span>
            <AIOrbit size="sm" />
          </div>
          <div className="grid grid-cols-1 gap-1 text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>AI Risk Engine</span>
              <PulseIndicator color="emerald" label="Online" />
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Database Sync</span>
              <PulseIndicator color="cyan" label="Connected" />
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Alert Queue</span>
              <PulseIndicator color="amber" label="Active" />
            </div>
          </div>
        </div>

        {/* AI Copilot Entry Banner */}
        {onOpenCopilot && (
          <button
            onClick={() => {
              onOpenCopilot();
              onCloseMobile();
            }}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-transparent hover:from-cyan-500/30 border border-cyan-500/40 text-left transition flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center space-x-1">
                  <span>PRAEVISIO AI</span>
                </div>
                <div className="text-[9px] font-mono text-cyan-400">Intelligence Copilot</div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-cyan-500/40 group-hover:text-cyan-300">
              Ctrl+I
            </span>
          </button>
        )}

        {/* Logged in User Card */}
        <div 
          onClick={() => {
            onSelectPage('profile');
            onCloseMobile();
          }}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 cursor-pointer border border-slate-800 flex items-center justify-between transition shadow-sm hover:border-cyan-500/30"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
            />
            <div className="truncate text-left">
              <div className="text-xs font-extrabold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-400 capitalize truncate font-medium">{currentUser.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Team Footer */}
        <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-cyan-500" />
            <span className="font-bold text-slate-400">TEAM-CONNECT</span>
          </div>
          <span className="font-mono text-cyan-400 font-semibold">SIH 2026</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-950/80 backdrop-blur-xl text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800/80 flex-col no-print shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 bg-slate-950/95 backdrop-blur-xl text-slate-300 h-full border-r border-slate-800 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
