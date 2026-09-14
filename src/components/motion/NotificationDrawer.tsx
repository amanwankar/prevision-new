import React from 'react';
import { X, Clock, Radio, ArrowUpRight } from 'lucide-react';
import type { User, Project, EarlyWarning, RecommendedAction, SystemAuditLog } from '../../types';
import { 
  getAuthorizedNotifications, 
  markNotificationAsRead, 
  type IntelligenceEvent 
} from '../../services/notificationService';
import { CommandButton } from '../common/CommandButton';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  projects: Project[];
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  auditLogs?: SystemAuditLog[];
  onSelectProject: (projectId: string) => void;
  onSelectAlert: (alertId: string) => void;
  onSelectAction: (actionId: string) => void;
  onNavigateNotifications: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  projects,
  alerts,
  actions,
  auditLogs = [],
  onSelectProject,
  onSelectAlert,
  onSelectAction,
  onNavigateNotifications,
}) => {
  if (!isOpen) return null;

  const events = getAuthorizedNotifications(currentUser, projects, alerts, actions, auditLogs);
  const unreadCount = events.filter((e) => !e.isRead).length;

  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  const handleItemClick = (ev: IntelligenceEvent) => {
    markNotificationAsRead(ev.id);
    onClose();

    if (ev.warningId) {
      onSelectAlert(ev.warningId);
    } else if (ev.actionId) {
      onSelectAction(ev.actionId);
    } else if (ev.projectId) {
      onSelectProject(ev.projectId);
    } else {
      onNavigateNotifications();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Clickable Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md animate-fadeIn" 
        onClick={onClose} 
      />

      <div className="relative z-10 max-w-md w-full h-full max-h-[100dvh] bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.35)] p-4 sm:p-5 overflow-y-auto no-print animate-slideLeft font-sans flex flex-col justify-between">
      
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-base font-black text-white">
              INTELLIGENCE EVENTS
            </h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                {unreadCount} UNREAD
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close Notifications Drawer"
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-xl transition focus-ring touch-target-safe"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications Event List */}
        <div className="my-5 space-y-3">
          {events.slice(0, 8).map((ev) => (
            <div
              key={ev.id}
              onClick={() => handleItemClick(ev)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-cyan-500/40 ${
                !ev.isRead
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${getSeverityBadgeStyle(ev.severity)}`}>
                  {ev.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{ev.createdAt}</span>
                </span>
              </div>

              <h3 className="text-xs font-bold text-white line-clamp-1">{ev.title}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{ev.description}</p>

              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span>REF: {ev.projectCode || 'MOSPI-SYS'}</span>
                <span className="text-cyan-400 flex items-center space-x-0.5">
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <CommandButton
          variant="primary"
          onClick={() => {
            onNavigateNotifications();
            onClose();
          }}
          className="w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <span>VIEW FULL EVENT CENTER</span>
          <ArrowUpRight className="w-4 h-4" />
        </CommandButton>
      </div>

    </div>
  </div>
  );
};
