import React, { useState, useEffect, useMemo } from 'react';
import type { Project, EarlyWarning, RecommendedAction, User } from '../types';
import { 
  getOverallRiskMetrics, 
  getRiskDistribution, 
  getRiskTrend, 
  getTopRiskFactors, 
  getProjectRiskMatrix, 
  getPredictiveInsights 
} from '../services/analyticsService';
import { calculateExecutivePriorityProjects } from '../services/reportService';
import { GlassPanel } from './motion/GlassPanel';
import { PulseIndicator } from './motion/PulseIndicator';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { LoadingScanner } from './motion/LoadingScanner';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FolderKanban, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Filter, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Compass, 
  ArrowUpRight, 
  Target, 
  X,
  AlertOctagon,
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

interface ExecutiveCommandCenterProps {
  projects: Project[];
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  currentUser?: User;
  onSelectProject: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onSelectAction?: (actionId: string) => void;
  onOpenReportModal?: () => void;
}

export const ExecutiveCommandCenter: React.FC<ExecutiveCommandCenterProps> = ({
  projects,
  alerts,
  actions,
  onSelectProject,
  onSelectAlert,
  onSelectAction,
  onOpenReportModal
}) => {
  // Staged Entrance Reveal Animation
  const [revealStage, setRevealStage] = useState<number>(0);
  useEffect(() => {
    const t1 = setTimeout(() => setRevealStage(1), 100);
    const t2 = setTimeout(() => setRevealStage(2), 250);
    const t3 = setTimeout(() => setRevealStage(3), 400);
    const t4 = setTimeout(() => setRevealStage(4), 550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Display Modes
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  
  // Refresh Telemetry Scan Simulation
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshStepText, setRefreshStepText] = useState<string>('');

  // Global Executive Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [trendPeriod, setTrendPeriod] = useState<'30D' | '3M' | '6M' | '1Y'>('6M');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Matrix Selected Node Preview
  const [hoveredMatrixNode, setHoveredMatrixNode] = useState<any | null>(null);

  // Keyboard shortcut listener for Focus Mode ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Derived Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (departmentFilter !== 'All' && p.department !== departmentFilter) return false;
      if (locationFilter !== 'All' && p.state !== locationFilter) return false;
      if (riskLevelFilter !== 'All' && p.riskLevel !== riskLevelFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, departmentFilter, locationFilter, riskLevelFilter, statusFilter]);

  // Derived Data Metrics
  const metrics = useMemo(() => getOverallRiskMetrics(filteredProjects), [filteredProjects]);
  const distribution = useMemo(() => getRiskDistribution(filteredProjects), [filteredProjects]);
  const trendData = useMemo(() => getRiskTrend(filteredProjects, trendPeriod), [filteredProjects, trendPeriod]);
  const topRiskFactors = useMemo(() => getTopRiskFactors(filteredProjects), [filteredProjects]);
  const scatterMatrix = useMemo(() => getProjectRiskMatrix(filteredProjects), [filteredProjects]);
  const priorityItems = useMemo(() => calculateExecutivePriorityProjects(filteredProjects, alerts, actions), [filteredProjects, alerts, actions]);
  const insights = useMemo(() => getPredictiveInsights(filteredProjects), [filteredProjects]);

  const activeWarnings = useMemo(() => alerts.filter(a => a.status === 'New' || a.status === 'Open'), [alerts]);
  const pendingActions = useMemo(() => actions.filter(a => a.status === 'Pending' || a.status === 'In Progress'), [actions]);

  // Handle Refresh Execution
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshStepText('COLLECTING PROJECT DATA...');

    setTimeout(() => {
      setRefreshStepText('EVALUATING RISK ENGINE SIGNALS...');
    }, 500);

    setTimeout(() => {
      setRefreshStepText('UPDATING PORTFOLIO SITUATION ROOM...');
    }, 1000);

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshStepText('');
    }, 1500);
  };

  // Extract Departments & Locations for Filter Dropdowns
  const uniqueDepartments = useMemo(() => Array.from(new Set(projects.map(p => p.department).filter(Boolean))), [projects]);
  const uniqueLocations = useMemo(() => Array.from(new Set(projects.map(p => p.state).filter(Boolean))), [projects]);

  // Calculated Overall Portfolio Risk Color & Label
  const portfolioRiskScore = metrics.overallRiskIndex;
  const portfolioRiskCategory = portfolioRiskScore >= 75 ? 'HIGH RISK' : portfolioRiskScore >= 45 ? 'MEDIUM RISK' : 'LOW RISK';
  const portfolioRiskColor = portfolioRiskScore >= 75 ? 'text-red-400 border-red-500/40 bg-red-500/10' : portfolioRiskScore >= 45 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  return (
    <div className={`space-y-6 transition-all duration-500 ${isFocusMode ? 'fixed inset-0 z-50 bg-[#030712] p-6 overflow-y-auto' : ''}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE COMMAND HEADER & TELEMETRY STRIP                */}
      {/* ------------------------------------------------------------- */}
      <GlassPanel className="p-5 border-cyan-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1.5">
                <PulseIndicator color="cyan" size="sm" />
                <span>EXECUTIVE SITUATION ROOM</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 border border-slate-800 bg-slate-900/80 px-2 py-0.5 rounded">
                DEMO INTELLIGENCE ENVIRONMENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5 flex items-center space-x-3">
              <span>EXECUTIVE COMMAND CENTER</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Portfolio-level visibility into infrastructure project health, emerging risks, warnings, and required executive interventions.
            </p>
          </div>

          {/* Action Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Live Telemetry Status Badges */}
            <div className="hidden xl:flex items-center space-x-2 mr-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DATA ● READY</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>RISK ENGINE ● ONLINE</span>
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 focus-ring"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Refresh'}</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all focus-ring ${
                isFilterPanelOpen || departmentFilter !== 'All' || locationFilter !== 'All' || riskLevelFilter !== 'All' || statusFilter !== 'All'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(departmentFilter !== 'All' || locationFilter !== 'All' || riskLevelFilter !== 'All' || statusFilter !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>

            {/* Generate Executive Report Button */}
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 focus-ring"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Executive Report</span>
              </button>
            )}

            {/* Presentation Mode Toggle */}
            <button
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all focus-ring ${
                isPresentationMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presentation</span>
            </button>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all focus-ring"
              title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Fullscreen Focus Mode"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scanning Banner Progress Bar */}
        {isRefreshing && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-cyan-400">
              <LoadingScanner active label={refreshStepText} position="top" />
              <span>{refreshStepText}</span>
            </div>
            <span className="text-slate-500">REAL-TIME PORTFOLIO RECALCULATION</span>
          </div>
        )}

        {/* Global Executive Filter Panel */}
        {isFilterPanelOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fadeIn">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-500 outline-none"
              >
                <option value="All">All Departments ({projects.length})</option>
                {uniqueDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Location / State</label>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-500 outline-none"
              >
                <option value="All">All States / Locations</option>
                {uniqueLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Risk Severity</label>
              <select
                value={riskLevelFilter}
                onChange={e => setRiskLevelFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-500 outline-none"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Project Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:border-cyan-500 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            {(departmentFilter !== 'All' || locationFilter !== 'All' || riskLevelFilter !== 'All' || statusFilter !== 'All') && (
              <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-1">
                <span className="text-[11px] text-cyan-400 font-mono">
                  Showing {filteredProjects.length} of {projects.length} monitored projects
                </span>
                <button
                  onClick={() => {
                    setDepartmentFilter('All');
                    setLocationFilter('All');
                    setRiskLevelFilter('All');
                    setStatusFilter('All');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </GlassPanel>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE 8-KPI HUD STRIP                                 */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 animate-fadeIn">
          
          {/* Total Projects */}
          <GlassPanel className="p-3.5 border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Monitored</span>
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-white">
              <AnimatedNumber value={filteredProjects.length} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Active Portfolio</div>
          </GlassPanel>

          {/* High Risk Projects */}
          <GlassPanel className="p-3.5 border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between text-red-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">High Risk</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-black text-red-400">
              <AnimatedNumber value={metrics.highRiskCount} />
            </div>
            <div className="text-[10px] text-red-400/80 font-mono mt-0.5">Immediate Attention</div>
          </GlassPanel>

          {/* Medium Risk Projects */}
          <GlassPanel className="p-3.5 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Medium Risk</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400">
              <AnimatedNumber value={metrics.mediumRiskCount} />
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Close Watch</div>
          </GlassPanel>

          {/* Low Risk Projects */}
          <GlassPanel className="p-3.5 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Low Risk</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400">
              <AnimatedNumber value={metrics.lowRiskCount} />
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Healthy Trajectory</div>
          </GlassPanel>

          {/* Delay Risk */}
          <GlassPanel className="p-3.5 border-slate-800/80 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Schedule Delay</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-300">
              <AnimatedNumber value={metrics.scheduleDelayRiskCount} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Timeline Slippage</div>
          </GlassPanel>

          {/* Cost Risk */}
          <GlassPanel className="p-3.5 border-slate-800/80 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Cost Overrun</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-300">
              <AnimatedNumber value={metrics.costOverrunRiskCount} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Budget Expansion</div>
          </GlassPanel>

          {/* Active Warnings */}
          <GlassPanel className="p-3.5 border-slate-800/80 hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between text-red-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Alerts</span>
              <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            </div>
            <div className="text-xl font-black text-white">
              <AnimatedNumber value={activeWarnings.length} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Open Warnings</div>
          </GlassPanel>

          {/* Pending Actions */}
          <GlassPanel className="p-3.5 border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Actions</span>
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-300">
              <AnimatedNumber value={pendingActions.length} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pending Response</div>
          </GlassPanel>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CENTERPIECE: PORTFOLIO RISK GAUGE & TREND ANALYSIS         */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Radial Portfolio Risk Index Centerpiece (5 cols) */}
          <GlassPanel className="lg:col-span-5 p-6 border-cyan-500/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">PORTFOLIO RISK INDEX</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Weighted risk score across monitored infrastructure</p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${portfolioRiskColor}`}>
                {portfolioRiskCategory}
              </span>
            </div>

            {/* Radial SVG Gauge Centerpiece */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <div className="w-48 h-48 relative flex items-center justify-center">
                
                {/* Outer Ambient Pulsing Glow Ring */}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${portfolioRiskScore >= 75 ? 'bg-red-500' : portfolioRiskScore >= 45 ? 'bg-amber-500' : 'bg-cyan-500'}`} />

                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-900/90"
                    fill="transparent"
                  />
                  {/* Glowing Animated Value Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * portfolioRiskScore) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      portfolioRiskScore >= 75 ? 'text-red-500' : portfolioRiskScore >= 45 ? 'text-amber-400' : 'text-cyan-400'
                    }`}
                    fill="transparent"
                  />
                </svg>

                {/* Score Number Display */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black tracking-tighter text-white">
                    <AnimatedNumber value={portfolioRiskScore} />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider">OUT OF 100</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 text-center max-w-xs">
                <p className="text-xs text-slate-300 font-medium">
                  {portfolioRiskScore >= 75 
                    ? 'Portfolio exhibits elevated risk concentration driven by schedule delays.'
                    : portfolioRiskScore >= 45
                    ? 'Portfolio risk is moderately elevated across transport & urban sectors.'
                    : 'Portfolio trajectory is operating within healthy risk thresholds.'}
                </p>
              </div>
            </div>

            {/* Distribution Breakdown Bars */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex justify-between">
                <span>RISK DISTRIBUTION</span>
                <span>{filteredProjects.length} PROJECTS</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-3 rounded overflow-hidden bg-slate-950 p-0.5 border border-slate-800">
                {distribution.map(d => (
                  <div
                    key={d.category}
                    title={`${d.category}: ${d.count} projects (${d.percentage}%)`}
                    style={{ width: '100%', backgroundColor: d.color }}
                    className="h-full rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setRiskLevelFilter(d.category === 'Critical' ? 'High' : d.category as any)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                {distribution.map(d => (
                  <span key={d.category} className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.category}: {d.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Portfolio Risk Trend & Interpretation (7 cols) */}
          <GlassPanel className="lg:col-span-7 p-6 border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">PORTFOLIO RISK TREND</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Historical risk score trajectory over time</p>
                </div>

                {/* Period Selector Tabs */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                  {(['30D', '3M', '6M', '1Y'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setTrendPeriod(p)}
                      className={`px-2.5 py-1 rounded font-bold transition-all ${
                        trendPeriod === p ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="execRiskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[20, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="avgRiskScore" name="Avg Risk Score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#execRiskGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Natural Language Trend Interpretation Box */}
            <div className="mt-4 p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-start space-x-3 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
                  AI TREND INTERPRETATION
                </div>
                <p className="text-slate-200 mt-0.5 leading-relaxed">
                  Portfolio risk has <strong className="text-cyan-300">{trendData.trendDirection.toLowerCase()} ({trendData.trendChangeValue >= 0 ? `+${trendData.trendChangeValue}` : trendData.trendChangeValue} pts)</strong> over the selected {trendPeriod} period. Progress gap expansion in highway and metro rail projects is the leading contributor.
                </p>
              </div>
            </div>
          </GlassPanel>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. PORTFOLIO RISK MATRIX (PROGRESS GAP VS RISK SCORE)         */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 3 && (
        <GlassPanel className="p-6 border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>PORTFOLIO RISK MATRIX</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Physical Progress Gap (%) vs AI Calculated Risk Score (0-100)</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span>Critical Zone</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>Watch Zone</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /><span>Low Risk</span></span>
            </div>
          </div>

          {/* Interactive Scatter Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* SVG Matrix Map */}
            <div className="lg:col-span-8 bg-slate-950/80 rounded-xl p-4 border border-slate-800 relative h-72">
              
              {/* Quadrant Labels */}
              <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-600 uppercase">WATCH (Low Gap, High Risk)</div>
              <div className="absolute top-2 right-2 text-[9px] font-mono text-red-500/80 uppercase font-bold">CRITICAL ATTENTION (High Gap, High Risk)</div>
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-emerald-500/80 uppercase">LOW ATTENTION (Low Gap, Low Risk)</div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-amber-500/80 uppercase">MONITOR (High Gap, Low Risk)</div>

              {/* Grid Lines */}
              <div className="absolute inset-x-8 top-1/2 border-b border-dashed border-slate-800" />
              <div className="absolute inset-y-8 left-1/2 border-r border-dashed border-slate-800" />

              {/* Plot Nodes */}
              <div className="relative w-full h-full p-6">
                {scatterMatrix.map(node => {
                  const xPct = Math.min(92, Math.max(8, (node.progressGap / 30) * 100));
                  const yPct = Math.min(92, Math.max(8, 100 - node.riskScore));

                  const nodeColor = node.riskScore >= 75 ? '#ef4444' : node.riskScore >= 45 ? '#f59e0b' : '#06b6d4';

                  return (
                    <div
                      key={node.projectId}
                      style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      onMouseEnter={() => setHoveredMatrixNode(node)}
                      onClick={() => onSelectProject(node.projectId)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    >
                      <div
                        style={{ backgroundColor: nodeColor, boxShadow: `0 0 12px ${nodeColor}80` }}
                        className="w-4 h-4 rounded-full border-2 border-slate-950 transition-transform group-hover:scale-150 flex items-center justify-center"
                      >
                        <span className="text-[8px] font-mono font-black text-slate-950 opacity-0 group-hover:opacity-100">
                          {node.code.replace('PRJ-', '')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Axis Labels */}
              <div className="absolute bottom-1 right-4 text-[9px] font-mono text-slate-500">Progress Gap (%) →</div>
              <div className="absolute top-4 left-1 text-[9px] font-mono text-slate-500 -rotate-90">Risk Score →</div>
            </div>

            {/* Hover Node Preview Panel */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-72">
              {hoveredMatrixNode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{hoveredMatrixNode.code}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${hoveredMatrixNode.riskScore >= 75 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      Risk Score: {hoveredMatrixNode.riskScore}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{hoveredMatrixNode.name}</h4>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Actual Progress:</span>
                      <span className="font-mono text-white">{hoveredMatrixNode.actualProgress}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Target Progress:</span>
                      <span className="font-mono text-white">{hoveredMatrixNode.targetProgress}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Progress Gap:</span>
                      <span className="font-mono text-red-400 font-bold">-{hoveredMatrixNode.progressGap}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Primary Risk Driver:</span>
                      <span className="font-mono text-cyan-300">{hoveredMatrixNode.riskType}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProject(hoveredMatrixNode.projectId)}
                    className="w-full py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40 flex items-center justify-center space-x-1 mt-2 transition-all"
                  >
                    <span>OPEN PROJECT INTELLIGENCE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 text-xs">
                  <Compass className="w-8 h-8 text-slate-700 mb-2 animate-spin-slow" />
                  <p className="font-mono text-[11px] text-slate-400">HOVER NODE FOR TELEMETRY</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-xs">
                    Inspect physical progress gap vs AI risk score across all projects.
                  </p>
                </div>
              )}
            </div>

          </div>
        </GlassPanel>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PROJECTS REQUIRING EXECUTIVE ATTENTION                     */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 4 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>PROJECTS REQUIRING EXECUTIVE ATTENTION</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">RANKED BY COMPOSITE RISK SCORE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorityItems.slice(0, 3).map(item => {
              const proj = item.project;
              const gap = item.progressGap;
              const cardBorder = item.riskScore >= 75 ? 'border-red-500/40 bg-red-500/5' : 'border-amber-500/40 bg-amber-500/5';

              return (
                <GlassPanel key={proj.id} className={`p-5 ${cardBorder} flex flex-col justify-between hover:scale-[1.01] transition-transform`}>
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-slate-400">{proj.code}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${item.riskScore >= 75 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        RISK: {item.riskScore}/100
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 leading-snug">{proj.name}</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Actual Progress</div>
                        <div className="font-mono font-bold text-white">{proj.actualPhysicalProgress}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Progress Gap</div>
                        <div className="font-mono font-bold text-red-400">-{gap}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Delay Forecast</div>
                        <div className="font-mono text-amber-300">+{proj.delayDays} Days</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Cost Overrun</div>
                        <div className="font-mono text-purple-300">₹{proj.costOverrunForecastCr} Cr</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                  >
                    <span>OPEN PROJECT INTELLIGENCE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. EARLY WARNING & ACTION PIPELINE GRID                        */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* Executive Early Warning Queue */}
          <GlassPanel className="p-5 border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4" />
                <span>EXECUTIVE EARLY WARNING QUEUE</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{activeWarnings.length} Active Alerts</span>
            </div>

            <div className="space-y-2.5">
              {activeWarnings.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert ? onSelectAlert(alert.id) : onSelectProject(alert.projectId)}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {alert.severity}
                      </span>
                      <span className="font-bold text-white truncate">{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{alert.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Priority Action Execution Center */}
          <GlassPanel className="p-5 border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>EXECUTIVE ACTION CENTER</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{pendingActions.length} Pending Actions</span>
            </div>

            <div className="space-y-2.5">
              {pendingActions.slice(0, 4).map(action => (
                <div
                  key={action.id}
                  onClick={() => onSelectAction ? onSelectAction(action.id) : onSelectProject(action.projectId)}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {action.priority} PRIORITY
                      </span>
                      <span className="font-bold text-white truncate">{action.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{action.rationale}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </GlassPanel>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. EXPLAINABLE RISK FACTORS & RECOMMENDED PRIORITIES          */}
      {/* ------------------------------------------------------------- */}
      {revealStage >= 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* Why Are Projects At Risk? */}
          <GlassPanel className="p-5 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-2">
              WHY ARE PROJECTS AT RISK? (EXPLAINABLE RISK DRIVERS)
            </h3>
            <div className="space-y-2">
              {topRiskFactors.map((rf, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rf.factor}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Affects {rf.affectedProjectsCount} Monitored Projects</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${rf.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {rf.severity} SEVERITY
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Recommended Executive Priorities */}
          <GlassPanel className="p-5 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-2">
              RECOMMENDED EXECUTIVE PRIORITIES
            </h3>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5 text-xs">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="text-slate-200 font-medium leading-snug">{insight}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

        </div>
      )}

    </div>
  );
};
