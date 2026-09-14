import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  User as UserIcon, 
  Zap, 
  TrendingUp,
  Search,
  Calendar,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import type { RecommendedAction, Project } from '../types';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { GlassPanel } from './motion/GlassPanel';
import { AlertActionFlowTracker } from './analytics/AlertActionFlowTracker';
import { LoadingScanner } from './motion/LoadingScanner';
import { EmptyState } from './common/EmptyState';

interface RecommendedActionsProps {
  actions: RecommendedAction[];
  projects?: Project[];
  onUpdateActionStatus: (actionId: string, newStatus: RecommendedAction['status']) => void;
  onSelectProject: (projectId: string) => void;
  onSelectAction?: (actionId: string) => void;
  onShowToast?: (message: string) => void;
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({
  actions,
  onUpdateActionStatus,
  onSelectProject,
  onSelectAction,
  onShowToast
}) => {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  const filteredActions = (actions || []).filter(a => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || 
      a.projectName?.toLowerCase().includes(query) ||
      a.projectCode?.toLowerCase().includes(query) ||
      a.title?.toLowerCase().includes(query) ||
      (a.assignedTo && a.assignedTo.toLowerCase().includes(query));

    const matchesPrio = priorityFilter === 'All' || a.priority === priorityFilter;
    const matchesStat = statusFilter === 'All' || a.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;

    return matchesSearch && matchesPrio && matchesStat && matchesDept;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setDepartmentFilter('All');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onShowToast) onShowToast('Operational response queue refreshed.');
    }, 600);
  };

  // Summary counts
  const totalCount = actions ? actions.length : 0;
  const pendingCount = (actions || []).filter(a => a.status === 'Pending').length;
  const inProgressCount = (actions || []).filter(a => a.status === 'In Progress').length;
  const completedCount = (actions || []).filter(a => a.status === 'Completed' || a.status === 'Executed').length;
  const overdueCount = (actions || []).filter(a => a.priority === 'Urgent' && a.status !== 'Completed').length;

  const allDepartments = Array.from(new Set((actions || []).map(a => a.department).filter(Boolean)));

  return (
    <div className={`space-y-6 pb-20 font-sans transition-all duration-700 ease-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      
      {/* 1. WORKFLOW PIPELINE TRACKER */}
      <AlertActionFlowTracker currentStage="recommendation" />

      {/* 2. HEADER BANNER */}
      <GlassPanel variant="glowing" reflection className="p-6 relative overflow-hidden">
        <LoadingScanner active={isRefreshing} label="SYNCHRONIZING OPERATIONAL RESPONSE ACTIONS" position="top" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="text-yellow-400 bg-yellow-950/80 px-2.5 py-0.5 rounded border border-yellow-500/40 uppercase font-bold flex items-center space-x-1.5 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>OPERATIONAL RESPONSE COMMAND CENTER</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>● DISPATCH ENGINE</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>● ACTION PIPELINE</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>● EXECUTION TRACKER</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <Lightbulb className="w-7 h-7 text-yellow-400 shrink-0" />
              <span>PRESCRIPTIVE RECOMMENDED ACTIONS</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Track and coordinate prescriptive mitigation directives automatically generated from project risk telemetry to prevent cost overruns and schedule delays.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 flex items-center space-x-2 transition font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH QUEUE</span>
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* 3. ACTION HUD (5 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 font-mono text-xs">
        
        <GlassPanel variant="dark" reflection={false} className="p-3 sm:p-3.5 space-y-1 border-slate-800 min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">TOTAL ACTIONS</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            <AnimatedNumber value={totalCount} />
          </div>
          <span className="text-[9px] text-slate-500 block truncate">Active Directives</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 sm:p-3.5 space-y-1 border-amber-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">PENDING</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            <AnimatedNumber value={pendingCount} />
          </div>
          <span className="text-[9px] text-amber-300/80 block truncate">Awaiting Officer</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 sm:p-3.5 space-y-1 border-cyan-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block truncate">IN PROGRESS</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400">
            <AnimatedNumber value={inProgressCount} />
          </div>
          <span className="text-[9px] text-cyan-300/80 block truncate">Active Execution</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 sm:p-3.5 space-y-1 border-emerald-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block truncate">COMPLETED</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            <AnimatedNumber value={completedCount} />
          </div>
          <span className="text-[9px] text-emerald-300/80 block truncate">Mitigated</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 sm:p-3.5 space-y-1 border-rose-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-rose-400 block truncate">URGENT AT RISK</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            <AnimatedNumber value={overdueCount} />
          </div>
          <span className="text-[9px] text-rose-300/80 block truncate">Urgent Action</span>
        </GlassPanel>

      </div>

      {/* 4. SEARCH & GLASS FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 font-mono text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search actions by title, project code, rationale, or officer name..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Executed">Executed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {allDepartments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="All">All Departments</option>
                {allDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* Filter Chips */}
        {(priorityFilter !== 'All' || statusFilter !== 'All' || departmentFilter !== 'All' || searchTerm) && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Active Filters:</span>
              {priorityFilter !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-yellow-300">Priority: {priorityFilter}</span>}
              {statusFilter !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-yellow-300">Status: {statusFilter}</span>}
              {departmentFilter !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-yellow-300">Dept: {departmentFilter}</span>}
              {searchTerm && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-yellow-300">Query: "{searchTerm}"</span>}
            </div>

            <button onClick={handleClearFilters} className="text-[11px] text-rose-400 hover:underline font-bold">
              CLEAR ALL
            </button>
          </div>
        )}
      </div>

      {/* 5. ACTION COMMAND CARDS LIST */}
      <div className="space-y-4">
        {filteredActions.length > 0 ? (
          filteredActions.map((act) => (
            <div 
              key={act.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-yellow-500/40 transition-all font-sans"
            >
              {/* Top Card Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    act.priority === 'Urgent' ? 'bg-rose-950 text-rose-400 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
                    act.priority === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-yellow-950 text-yellow-300 border border-yellow-800'
                  }`}>
                    {act.priority} PRIORITY
                  </span>

                  <span className="text-cyan-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {act.projectCode}
                  </span>

                  <button
                    onClick={() => onSelectProject(act.projectId)}
                    className="font-bold text-white hover:text-cyan-400 hover:underline font-sans text-xs"
                  >
                    {act.projectName}
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800 text-[11px]">
                    AI Confidence: {act.aiConfidenceScore}%
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    act.status === 'Completed' || act.status === 'Executed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    act.status === 'In Progress' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>

              {/* Title & Rationale */}
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                  <span>{act.title}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{act.rationale}</p>
              </div>

              {/* 3-Column Meta Grid */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="flex items-start space-x-2.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">EXPECTED IMPACT</span>
                    <span className="font-semibold text-slate-200 font-sans">{act.expectedImpact}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <UserIcon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">ASSIGNED OFFICER</span>
                    <span className="font-semibold text-slate-200 font-sans">{act.assignedTo || 'Monitoring Officer'} ({act.assignedRole || 'PIU'})</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Calendar className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">TARGET RESOLUTION</span>
                    <span className="text-slate-200 font-bold">{act.targetResolutionDate || '2026-09-30'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-1 font-mono text-xs">
                <button
                  onClick={() => {
                    if (onSelectAction) onSelectAction(act.id);
                    window.location.hash = `#/actions/${act.id}`;
                  }}
                  className="text-cyan-400 hover:underline font-bold flex items-center space-x-1"
                >
                  <span>OPEN ACTION CASE FILE →</span>
                </button>

                <div className="flex items-center space-x-3">
                  {act.status === 'Pending' && (
                    <button
                      onClick={() => {
                        onUpdateActionStatus(act.id, 'In Progress');
                        if (onShowToast) onShowToast('Action status set to In Progress.');
                      }}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                    >
                      START ACTION
                    </button>
                  )}

                  {act.status !== 'Completed' && act.status !== 'Executed' && (
                    <button
                      onClick={() => {
                        onUpdateActionStatus(act.id, 'Completed');
                        if (onShowToast) onShowToast('Action status updated to Completed.');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MARK COMPLETED</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <EmptyState
            title="NO MATCHING PRESCRIPTIVE ACTIONS"
            description="Current operational response queue does not contain active directives matching your filter criteria."
            icon={ShieldCheck}
            actionLabel="CLEAR ALL FILTERS"
            onAction={handleClearFilters}
          />
        )}
      </div>

    </div>
  );
};
