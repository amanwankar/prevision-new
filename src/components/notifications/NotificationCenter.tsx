import React, { useState, useMemo } from 'react';
import type { Project, EarlyWarning, RecommendedAction, User, SystemAuditLog } from '../../types';
import { 
  getAuthorizedNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  calculateSmartSummary,
  type IntelligenceEvent, 
  type EventSeverity 
} from '../../services/notificationService';
import { NotificationDetailModal } from './NotificationDetailModal';
import { 
  Radio, 
  Search, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Lightbulb, 
  Activity, 
  CheckCheck, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { CommandButton } from '../common/CommandButton';
import { StaggerContainer, StaggerItem } from '../motion/StaggerContainer';

interface NotificationCenterProps {
  currentUser: User | null;
  projects: Project[];
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  auditLogs?: SystemAuditLog[];
  onSelectProject: (projectId: string) => void;
  onSelectAlert: (alertId: string) => void;
  onSelectAction: (actionId: string) => void;
  onOpenCopilot?: () => void;
  onNavigateExecutive?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  projects,
  alerts,
  actions,
  auditLogs = [],
  onSelectProject,
  onSelectAlert,
  onSelectAction,
  onOpenCopilot,
  onNavigateExecutive
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<IntelligenceEvent | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Derive authorized events
  const rawEvents = useMemo(() => {
    if (refreshTrigger < 0) return [];
    return getAuthorizedNotifications(currentUser, projects, alerts, actions, auditLogs);
  }, [currentUser, projects, alerts, actions, auditLogs, refreshTrigger]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((ev) => {
      const matchesSearch =
        searchTerm === '' ||
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.projectName && ev.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ev.projectCode && ev.projectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ev.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'UNREAD' && !ev.isRead) ||
        (categoryFilter === 'HIGH_PRIORITY' && (ev.severity === 'CRITICAL' || ev.severity === 'HIGH')) ||
        (categoryFilter === 'RISK' && ev.category === 'RISK_DETECTED') ||
        (categoryFilter === 'WARNINGS' && ev.category === 'EARLY_WARNING') ||
        (categoryFilter === 'ACTIONS' && (ev.category === 'ACTION_REQUIRED' || ev.category === 'ACTION_UPDATED')) ||
        (categoryFilter === 'AUDIT' && ev.category === 'AUDIT_EVENT');

      const matchesSeverity = severityFilter === 'ALL' || ev.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [rawEvents, searchTerm, categoryFilter, severityFilter]);

  // HUD Metrics
  const summaryMetrics = useMemo(() => {
    const total = rawEvents.length;
    const unread = rawEvents.filter((e) => !e.isRead).length;
    const highPriority = rawEvents.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
    const riskEvents = rawEvents.filter((e) => e.category === 'RISK_DETECTED').length;
    const actionEvents = rawEvents.filter((e) => e.category === 'ACTION_REQUIRED' || e.category === 'ACTION_UPDATED').length;
    return { total, unread, highPriority, riskEvents, actionEvents };
  }, [rawEvents]);

  const smartSummary = calculateSmartSummary(rawEvents);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(rawEvents);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEventClick = (ev: IntelligenceEvent) => {
    markNotificationAsRead(ev.id);
    setSelectedEvent(ev);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getSeverityBadgeStyle = (severity: EventSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              INTELLIGENCE EVENT CENTER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
              LIVE EVENT STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Monitor important project, risk, warning, action, and system events.
          </p>
        </div>

        {/* Global CTAs: Copilot & Executive Impact */}
        <div className="flex items-center space-x-2 shrink-0">
          {onOpenCopilot && (
            <CommandButton
              variant="primary"
              size="sm"
              onClick={onOpenCopilot}
              className="text-xs font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>ASK PRAEVISIO</span>
            </CommandButton>
          )}

          {onNavigateExecutive && (
            <CommandButton
              variant="secondary"
              size="sm"
              onClick={onNavigateExecutive}
              className="text-xs font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>EXECUTIVE IMPACT</span>
            </CommandButton>
          )}
        </div>
      </div>

      {/* Top HUD Summary Metrics */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StaggerItem>
          <MetricCard
            label="TOTAL EVENTS"
            value={summaryMetrics.total}
            sublabel="ALL RECORDED"
            icon={Radio}
            color="cyan"
          />
        </StaggerItem>

        <StaggerItem>
          <MetricCard
            label="UNREAD EVENTS"
            value={summaryMetrics.unread}
            sublabel="PENDING REVIEW"
            icon={Clock}
            color="amber"
          />
        </StaggerItem>

        <StaggerItem>
          <MetricCard
            label="HIGH PRIORITY"
            value={summaryMetrics.highPriority}
            sublabel="CRITICAL & HIGH"
            icon={ShieldAlert}
            color="red"
          />
        </StaggerItem>

        <StaggerItem>
          <MetricCard
            label="RISK EVENTS"
            value={summaryMetrics.riskEvents}
            sublabel="AI RISK ENGINE"
            icon={Activity}
            color="purple"
          />
        </StaggerItem>

        <StaggerItem>
          <MetricCard
            label="ACTION EVENTS"
            value={summaryMetrics.actionEvents}
            sublabel="RESPONSES"
            icon={Lightbulb}
            color="emerald"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Smart Intelligence Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-transparent border border-cyan-500/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-slate-200 font-medium font-sans">{smartSummary}</span>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-mono text-cyan-400 hover:text-white transition flex items-center space-x-1 shrink-0 ml-2"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 space-y-4 shadow-sm">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: '🌐 ALL EVENTS' },
            { id: 'UNREAD', label: '🔴 UNREAD' },
            { id: 'HIGH_PRIORITY', label: '⚠️ HIGH PRIORITY' },
            { id: 'RISK', label: '📈 RISK DETECTED' },
            { id: 'WARNINGS', label: '🚨 WARNINGS' },
            { id: 'ACTIONS', label: '⚡ ACTIONS' },
            { id: 'AUDIT', label: '🛡️ AUDIT LOGS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Severity Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search event title, project name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
            <option value="INFO">Informational</option>
          </select>
        </div>

      </div>

      {/* Main Event Stream List */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => {
            const badgeStyle = getSeverityBadgeStyle(ev.severity);

            return (
              <div
                key={ev.id}
                onClick={() => handleEventClick(ev)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-cyan-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !ev.isRead
                    ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start space-x-3 overflow-hidden">
                  {/* Unread indicator dot */}
                  {!ev.isRead ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0 mt-1.5" />
                  )}

                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeStyle}`}>
                        {ev.severity}
                      </span>
                      {ev.projectCode && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {ev.projectCode}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">{ev.createdAt}</span>
                    </div>

                    <h3 className="text-xs font-bold text-white leading-snug">{ev.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ev.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <CommandButton
                    variant="ghost"
                    size="sm"
                    className="text-xs text-cyan-300 hover:text-white"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </CommandButton>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
            <Radio className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-white">NO ACTIVE INTELLIGENCE EVENTS</h3>
            <p className="text-xs text-slate-400">Current filters contain no matching platform notification events.</p>
          </div>
        )}
      </div>

      {/* Selected Notification Detail Modal */}
      <NotificationDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSelectProject={onSelectProject}
        onSelectAlert={onSelectAlert}
        onSelectAction={onSelectAction}
        onOpenCopilot={onOpenCopilot}
      />

    </div>
  );
};
