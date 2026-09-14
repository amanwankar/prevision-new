import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  Download, 
  Search, 
  X,
  ShieldAlert,
  Activity,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import type { EarlyWarning, Project } from '../types';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { PulseIndicator } from './motion/PulseIndicator';
import { LoadingScanner } from './motion/LoadingScanner';
import { GlassPanel } from './motion/GlassPanel';
import { AlertActionFlowTracker } from './analytics/AlertActionFlowTracker';
import { EmptyState } from './common/EmptyState';

interface AlertsQueueProps {
  alerts: EarlyWarning[];
  projects?: Project[];
  onUpdateAlertStatus?: (alertId: string, newStatus: EarlyWarning['status']) => void;
  onSelectProject: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onCreateManualAlert?: (newAlert: EarlyWarning) => void;
  onShowToast?: (message: string) => void;
}

export const AlertsQueue: React.FC<AlertsQueueProps> = ({
  alerts,
  projects = [],
  onSelectProject,
  onSelectAlert,
  onCreateManualAlert,
  onShowToast
}) => {
  // Staged entrance animation state
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Multi-field Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskTypeFilter, setRiskTypeFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form State for Manual Alert Creation
  const [newProjectId, setNewProjectId] = useState<string>(projects[0]?.id || 'PRJ-001');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newRiskType, setNewRiskType] = useState<'Schedule Delay' | 'Cost Overrun' | 'Progress' | 'Milestone' | 'Other'>('Schedule Delay');

  // Multi-field Filtering logic
  const filteredAlerts = (alerts || []).filter(a => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || 
      a.projectName?.toLowerCase().includes(query) ||
      a.projectCode?.toLowerCase().includes(query) ||
      a.title?.toLowerCase().includes(query) ||
      (a.assignedOfficer && a.assignedOfficer.toLowerCase().includes(query));

    const matchesSev = severityFilter === 'All' || a.severity === severityFilter;
    const matchesStat = statusFilter === 'All' || 
      (statusFilter === 'Open' && (a.status === 'Open' || a.status === 'New')) ||
      a.status === statusFilter;
    const matchesType = riskTypeFilter === 'All' || a.riskType === riskTypeFilter;
    const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;
    const matchesLoc = locationFilter === 'All' || a.location === locationFilter;

    return matchesSearch && matchesSev && matchesStat && matchesType && matchesDept && matchesLoc;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSeverityFilter('All');
    setStatusFilter('All');
    setRiskTypeFilter('All');
    setDepartmentFilter('All');
    setLocationFilter('All');
  };

  const activeFilterCount = 
    (severityFilter !== 'All' ? 1 : 0) +
    (statusFilter !== 'All' ? 1 : 0) +
    (riskTypeFilter !== 'All' ? 1 : 0) +
    (departmentFilter !== 'All' ? 1 : 0) +
    (locationFilter !== 'All' ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onShowToast) onShowToast('Early warning risk feed synchronized with latest telemetry.');
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Severity', 'Project Code', 'Project Name', 'Alert Title', 'Risk Score', 'Risk Type', 'Status', 'Assigned Officer', 'Timestamp'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.severity,
      a.projectCode,
      `"${a.projectName.replace(/"/g, '""')}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      a.riskScore || 80,
      a.riskType || 'Schedule Delay',
      a.status,
      `"${a.assignedOfficer || 'Officer-in-Charge'}"`,
      `"${a.timestamp || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRAEVISIO_Early_Warnings_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('Early Warnings dataset exported to CSV successfully.');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === newProjectId) || projects[0];
    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';

    const created: EarlyWarning = {
      id: `ew-manual-${Date.now()}`,
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name,
      sector: proj.sector,
      department: proj.department,
      severity: newSeverity,
      title: newTitle || 'Manual Field Risk Dispatch',
      description: newDescription || 'Field monitoring officer manually logged elevated schedule variance observation.',
      triggerCondition: 'Manual Field Inspector Dispatch',
      timeAgo: 'Just now',
      timestamp: nowIso,
      status: 'Open',
      assignedOfficer: 'Field Operations Officer',
      recommendedAction: 'Conduct mandatory site verification audit within 48 hours.',
      riskScore: proj.riskScore || 80,
      riskType: newRiskType,
      location: proj.state || 'India',
      timeline: [
        { id: `tl-${Date.now()}`, timestamp: 'Just now', event: 'Manual early warning created by officer.' }
      ]
    };

    if (onCreateManualAlert) onCreateManualAlert(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    if (onShowToast) onShowToast('Manual Early Warning created and added to active queue.');
  };

  // Metrics calculation
  const totalCount = alerts.length > 0 ? alerts.length : 27;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const medCount = alerts.filter(a => a.severity === 'Medium').length;
  const ackCount = alerts.filter(a => a.status === 'Acknowledged').length;
  const reviewCount = alerts.filter(a => a.status === 'In Review').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  const allDepartments = Array.from(new Set(alerts.map(a => a.department).filter(Boolean)));
  const allLocations = Array.from(new Set(alerts.map(a => a.location).filter(Boolean)));

  return (
    <div className={`space-y-6 pb-20 font-sans transition-all duration-700 ease-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      
      {/* 1. PIPELINE TRACKER */}
      <AlertActionFlowTracker currentStage="warning" />

      {/* 2. CINEMATIC HEADER */}
      <GlassPanel variant="glowing" reflection className="p-6 relative overflow-hidden">
        <LoadingScanner active={isRefreshing} label="SYNCHRONIZING EARLY WARNING FEEDS" position="top" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded border border-orange-500/40 uppercase font-bold flex items-center space-x-1.5 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                <PulseIndicator color="orange" size="sm" />
                <span>LIVE PROJECT INTELLIGENCE FEED</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>● INTELLIGENCE ENGINE</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>● ALERT PIPELINE</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>● DATA MONITORING</span>
              </span>

              <span className="text-slate-500 font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                DEMO INTELLIGENCE ENVIRONMENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <AlertOctagon className="w-7 h-7 text-orange-400 shrink-0" />
              <span>EARLY WARNING CENTER</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Monitor emerging project risks, understand their root causes, and coordinate early prescriptive officer intervention before cost and schedule variance compound.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center space-x-2 transition"
              title="Sync Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-mono">SYNC TELEMETRY</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 transition transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE MANUAL WARNING</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* 3. WARNING SUMMARY HUD (7 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* Total */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-slate-800">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold uppercase">
            <span>TOTAL WARNINGS</span>
            <Activity className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            <AnimatedNumber value={totalCount} />
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Telemetry Queue</span>
          </div>
        </GlassPanel>

        {/* Critical */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-rose-500/40 bg-rose-950/10">
          <div className="flex items-center justify-between text-[9px] font-mono text-rose-400 font-bold uppercase">
            <span>CRITICAL</span>
            <PulseIndicator color="red" size="sm" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono shadow-sm">
            <AnimatedNumber value={criticalCount} />
          </div>
          <div className="text-[9px] text-rose-300/80 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Immediate Action</span>
          </div>
        </GlassPanel>

        {/* High */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-amber-500/40 bg-amber-950/10">
          <div className="flex items-center justify-between text-[9px] font-mono text-amber-400 font-bold uppercase">
            <span>HIGH</span>
            <AlertOctagon className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">
            <AnimatedNumber value={highCount} />
          </div>
          <div className="text-[9px] text-amber-300/80 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Elevated Risk</span>
          </div>
        </GlassPanel>

        {/* Medium */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-yellow-500/30">
          <div className="flex items-center justify-between text-[9px] font-mono text-yellow-300 font-bold uppercase">
            <span>MEDIUM</span>
            <ShieldAlert className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="text-xl font-black text-yellow-300 font-mono">
            <AnimatedNumber value={medCount} />
          </div>
          <div className="text-[9px] text-slate-400 font-mono">Watchlist Level</div>
        </GlassPanel>

        {/* Acknowledged */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-cyan-500/30">
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 font-bold uppercase">
            <span>ACKNOWLEDGED</span>
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400 font-mono">
            <AnimatedNumber value={ackCount} />
          </div>
          <div className="text-[9px] text-cyan-300/80 font-mono">Officer Logged</div>
        </GlassPanel>

        {/* In Review */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-purple-500/30">
          <div className="flex items-center justify-between text-[9px] font-mono text-purple-400 font-bold uppercase">
            <span>IN REVIEW</span>
            <Activity className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 font-mono">
            <AnimatedNumber value={reviewCount} />
          </div>
          <div className="text-[9px] text-purple-300/80 font-mono">Active Investigation</div>
        </GlassPanel>

        {/* Resolved */}
        <GlassPanel variant="dark" reflection={false} className="p-3.5 space-y-1 border-emerald-500/30">
          <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 font-bold uppercase">
            <span>RESOLVED</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            <AnimatedNumber value={resolvedCount} />
          </div>
          <div className="text-[9px] text-emerald-300/80 font-mono">Mitigated</div>
        </GlassPanel>

      </div>

      {/* 4. SEVERITY SPECTRUM HISTOGRAM & LIVE SIGNAL FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Severity Spectrum Visual Histogram */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                WARNING SEVERITY SPECTRUM & DISTRIBUTION
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">SELECT TO FILTER QUEUE</span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            
            <button
              onClick={() => setSeverityFilter(severityFilter === 'Critical' ? 'All' : 'Critical')}
              className={`p-3 rounded-2xl border transition-all text-left space-y-1 ${
                severityFilter === 'Critical' ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-400' : 'bg-slate-950 border-slate-800 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-rose-400">Critical</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="text-xl font-black text-white">{criticalCount}</div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.round((criticalCount / (totalCount || 1)) * 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 text-right">{Math.round((criticalCount / (totalCount || 1)) * 100)}%</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'High' ? 'All' : 'High')}
              className={`p-3 rounded-2xl border transition-all text-left space-y-1 ${
                severityFilter === 'High' ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400' : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400">High</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-xl font-black text-white">{highCount}</div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.round((highCount / (totalCount || 1)) * 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 text-right">{Math.round((highCount / (totalCount || 1)) * 100)}%</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'Medium' ? 'All' : 'Medium')}
              className={`p-3 rounded-2xl border transition-all text-left space-y-1 ${
                severityFilter === 'Medium' ? 'bg-yellow-950/80 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] ring-1 ring-yellow-400' : 'bg-slate-950 border-slate-800 hover:border-yellow-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-yellow-300">Medium</span>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
              </div>
              <div className="text-xl font-black text-white">{medCount}</div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${Math.round((medCount / (totalCount || 1)) * 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 text-right">{Math.round((medCount / (totalCount || 1)) * 100)}%</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'Low' ? 'All' : 'Low')}
              className={`p-3 rounded-2xl border transition-all text-left space-y-1 ${
                severityFilter === 'Low' ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400' : 'bg-slate-950 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-300">Low</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="text-xl font-black text-white">{alerts.filter(a => a.severity === 'Low').length}</div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.round((alerts.filter(a => a.severity === 'Low').length / (totalCount || 1)) * 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-500 text-right">{Math.round((alerts.filter(a => a.severity === 'Low').length / (totalCount || 1)) * 100)}%</div>
            </button>

          </div>
        </div>

        {/* Live Intelligence Signal Stream */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                LIVE DETECTED INTELLIGENCE SIGNALS
              </h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
              AUTO TELEMETRY
            </span>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map(sig => (
              <div 
                key={sig.id}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      sig.severity === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      sig.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {sig.severity}
                    </span>
                    <span className="text-white font-bold font-sans text-xs">{sig.title}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                    <span className="text-cyan-400 font-bold">{sig.projectCode}</span>
                    <span>•</span>
                    <span>{sig.projectName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${
                    (sig.riskScore || 80) >= 75 ? 'bg-rose-950/60 text-rose-400 border-rose-800' : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}>
                    {sig.riskScore || 80}
                  </span>

                  <button
                    onClick={() => {
                      if (onSelectAlert) onSelectAlert(sig.id);
                      window.location.hash = `#/alerts/${sig.id}`;
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
                    title="Inspect Warning"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. MULTI-FIELD GLASS FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search warnings by project name, code, warning title, or assigned officer..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open / New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Risk Type Filter */}
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Risk Types</option>
              <option value="Schedule Delay">Schedule Delay</option>
              <option value="Cost Overrun">Cost Overrun</option>
              <option value="Progress">Progress Gap</option>
              <option value="Milestone">Milestone Delay</option>
              <option value="Other">Other</option>
            </select>

            {/* Department Filter */}
            {allDepartments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Departments</option>
                {allDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {/* Location Filter */}
            {allLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Locations</option>
                {allLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

          </div>
        </div>

        {/* Filter Summary Chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Active Filters:</span>

              {severityFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>Severity: {severityFilter}</span>
                  <button onClick={() => setSeverityFilter('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}

              {statusFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}

              {riskTypeFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>Type: {riskTypeFilter}</span>
                  <button onClick={() => setRiskTypeFilter('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}

              {departmentFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>Dept: {departmentFilter}</span>
                  <button onClick={() => setDepartmentFilter('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}

              {locationFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>State: {locationFilter}</span>
                  <button onClick={() => setLocationFilter('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}

              {searchTerm && (
                <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 flex items-center space-x-1.5">
                  <span>Query: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[11px] text-rose-400 hover:underline font-bold"
            >
              CLEAR ALL
            </button>
          </div>
        )}

      </div>

      {/* 6. COMMAND-CENTER WARNING TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="font-extrabold text-white uppercase tracking-wider">EARLY WARNING COMMAND QUEUE</span>
          </div>
          <span className="text-[10px] text-slate-400">
            SHOWING <strong className="text-cyan-400">{filteredAlerts.length}</strong> OF <strong className="text-white">{alerts.length}</strong> WARNINGS
          </span>
        </div>

        {filteredAlerts.length > 0 ? (
          <div className="table-scroll-container">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">SEVERITY</th>
                  <th className="py-3 px-4 font-bold">PROJECT CODE & NAME</th>
                  <th className="py-3 px-4 font-bold">WARNING TITLE</th>
                  <th className="py-3 px-4 font-bold text-center">RISK SCORE</th>
                  <th className="py-3 px-4 font-bold">SIGNAL TYPE</th>
                  <th className="py-3 px-4 font-bold">DETECTED</th>
                  <th className="py-3 px-4 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAlerts.map((wrn) => (
                  <tr 
                    key={wrn.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (onSelectAlert) onSelectAlert(wrn.id);
                      window.location.hash = `#/alerts/${wrn.id}`;
                    }}
                  >
                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider inline-flex items-center space-x-1 ${
                        wrn.severity === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                        wrn.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        wrn.severity === 'Medium' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                        'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          wrn.severity === 'Critical' ? 'bg-rose-500 animate-ping' :
                          wrn.severity === 'High' ? 'bg-amber-400' : 'bg-cyan-400'
                        }`} />
                        <span>{wrn.severity}</span>
                      </span>
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-mono text-cyan-400 font-bold text-[11px]">{wrn.projectCode}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(wrn.projectId);
                          }}
                          className="font-bold text-slate-200 hover:text-white hover:underline text-left block text-xs"
                        >
                          {wrn.projectName}
                        </button>
                      </div>
                    </td>

                    {/* Warning Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-xs truncate" title={wrn.title}>
                      {wrn.title}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={`px-2.5 py-0.5 rounded text-xs ${
                        (wrn.riskScore || 80) >= 75 ? 'bg-rose-950 text-rose-400 border border-rose-800 font-black' :
                        (wrn.riskScore || 80) >= 55 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {wrn.riskScore || 80}
                      </span>
                    </td>

                    {/* Signal Type */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {wrn.riskType || 'Schedule Delay'}
                    </td>

                    {/* Detected Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      {wrn.timeAgo || wrn.timestamp || 'Today'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        wrn.status === 'Open' || wrn.status === 'New' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        wrn.status === 'Acknowledged' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        wrn.status === 'In Review' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {wrn.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectAlert) onSelectAlert(wrn.id);
                          window.location.hash = `#/alerts/${wrn.id}`;
                        }}
                        className="px-3 py-1 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold font-mono text-[10px] rounded-lg border border-slate-800 transition flex items-center space-x-1 ml-auto"
                      >
                        <span>INVESTIGATE</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="NO MATCHING RISK WARNING SIGNALS"
            description="Current project risk indicators do not contain active warnings matching your filter criteria."
            icon={ShieldCheck}
            actionLabel="CLEAR ALL FILTERS"
            onAction={handleClearFilters}
          />
        )}
      </div>

      {/* 7. MANUAL WARNING CREATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-scale-up font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                  CREATE MANUAL RISK WARNING
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Target Infrastructure Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-mono"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Warning Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Elevated Land Acquisition Clearance Delay"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Severity Tier</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-mono"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Signal Category</label>
                  <select
                    value={newRiskType}
                    onChange={(e) => setNewRiskType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 font-mono"
                  >
                    <option value="Schedule Delay">Schedule Delay</option>
                    <option value="Cost Overrun">Cost Overrun</option>
                    <option value="Progress">Progress Gap</option>
                    <option value="Milestone">Milestone Delay</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Detailed Field Observation</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter detailed observation or field inspector notes..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Dispatch Warning
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
