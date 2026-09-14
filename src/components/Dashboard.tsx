import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  IndianRupee, 
  ShieldAlert, 
  ChevronRight,
  PieChart as PieIcon,
  ArrowUpRight,
  TrendingUp,
  Filter,
  AlertCircle,
  Lightbulb,
  Activity,
  Cpu,
  ScatterChart as ScatterIcon
} from 'lucide-react';
import type { Project, EarlyWarning, RecommendedAction, User, RiskHistory } from '../types';
import { getRiskColorClass } from '../config/riskThresholds';
import { IndiaMap } from './IndiaMap';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

import { AnimatedNumber } from './motion/AnimatedNumber';
import { AnimatedRiskScore } from './motion/AnimatedRiskScore';
import { AICore } from './motion/AICore';
import { GlassPanel } from './motion/GlassPanel';
import { LoadingScanner } from './motion/LoadingScanner';
import { AnimatedProgress } from './motion/AnimatedProgress';
import { PulseIndicator } from './motion/PulseIndicator';
import { KPISkeleton, CardSkeleton, ChartSkeleton } from './common/SkeletonLoader';

interface DashboardProps {
  projects: Project[];
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  riskHistory: RiskHistory[];
  currentUser: User;
  onSelectProject: (id: string) => void;
  onSelectPage: (page: string) => void;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  alerts,
  actions,
  riskHistory,
  currentUser: _currentUser,
  onSelectProject,
  onSelectPage,
  isLoading = false
}) => {
  // Filter States
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [trendTimeframe, setTrendTimeframe] = useState<'7d' | '30d' | '90d' | '6m' | '1y'>('6m');

  // Filtered Projects List
  const filteredProjects = (projects || []).filter(p => {
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || p.department?.includes(departmentFilter);
    const matchesLoc = locationFilter === 'All' || p.state === locationFilter;
    return matchesRisk && matchesStatus && matchesDept && matchesLoc;
  });

  // KPI Calculations
  const totalCount = projects ? projects.length : 0;
  const criticalRiskCount = projects ? projects.filter(p => p.riskLevel === 'Critical' || p.riskScore >= 85).length : 0;
  const highRiskCount = projects ? projects.filter(p => (p.riskLevel === 'High' || p.riskScore >= 75) && p.riskScore < 85 && p.riskLevel !== 'Critical').length : 0;
  const mediumRiskCount = projects ? projects.filter(p => p.riskLevel === 'Medium' || (p.riskScore >= 35 && p.riskScore < 75)).length : 0;
  const lowRiskCount = projects ? projects.filter(p => p.riskLevel === 'Low' || p.riskScore < 35).length : 0;
  const delayRiskCount = projects ? projects.filter(p => p.delayDays > 60 || (p.primaryRisk && p.primaryRisk.includes('Delay'))).length : 0;
  const costOverrunCount = projects ? projects.filter(p => p.costOverrunForecastCr > 0 || (p.primaryRisk && p.primaryRisk.includes('Cost'))).length : 0;
  const actionRequiredCount = actions ? actions.filter(a => a.status === 'Pending' || a.status === 'In Progress').length : 0;

  // Donut Chart Data — all values calculated from actual project data
  const donutData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: highRiskCount, color: '#f97316' },
    { name: 'Critical Risk', value: criticalRiskCount, color: '#ef4444' }
  ];

  // Scatter Plot Data for Project Risk Matrix
  const riskMatrixData = projects.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    gap: Math.max(0, p.targetPhysicalProgress - p.actualPhysicalProgress),
    riskScore: p.riskScore,
    riskLevel: p.riskLevel,
    primaryRisk: p.primaryRisk,
    z: 100
  }));

  // Top High-Risk Project for XAI Feature Breakdown Panel
  const topRiskProject = [...projects].sort((a, b) => b.riskScore - a.riskScore)[0] || projects[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton rows={2} />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* DASHBOARD HERO INTELLIGENCE SECTION */}
      <GlassPanel variant="glowing" reflection className="p-4 sm:p-6">
        {/* Subtle Ambient Background Light */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-2xl min-w-0 flex-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <AICore size="sm" />
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase break-words-safe">
                <span>PRAEVISIO • PREDICTIVE INFRASTRUCTURE INTELLIGENCE</span>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight break-words-safe">
              Predict risks before they become project failures.
            </h1>
            
            <div className="flex items-center space-x-2.5 text-[11px] sm:text-xs font-mono text-cyan-300 font-bold tracking-wider">
              <span>PREDICT</span>
              <span className="text-slate-600">→</span>
              <span>EXPLAIN</span>
              <span className="text-slate-600">→</span>
              <span>ACT</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Real-time executive monitoring across national infrastructure corridors. Powered by multi-source early warning telemetry and explainable risk scoring algorithms.
            </p>
          </div>

          {/* Right Side: Overall Risk Index Gauge */}
          <div className="flex items-center space-x-4 sm:space-x-5 bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 shrink-0 w-full sm:w-auto shadow-inner">
            
            {/* Radial Glowing Score Meter */}
            <AnimatedRiskScore score={72} size={72} strokeWidth={7} />

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase truncate">Overall Risk Index</div>
              <div className="text-xs sm:text-sm font-extrabold text-orange-400 flex items-center space-x-1.5 mt-0.5">
                <PulseIndicator color="orange" size="sm" />
                <span className="truncate">HIGH ATTENTION REQUIRED</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 font-mono font-bold mt-1 flex items-center space-x-1 flex-wrap">
                <span>↑ 8.4%</span>
                <span className="text-slate-400 font-normal">vs prev period</span>
              </div>
            </div>

          </div>

        </div>
      </GlassPanel>

      {/* DASHBOARD COMMAND FILTER CONTROLS */}
      <div className="glass-panel-dark p-3 sm:p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 shrink-0">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-mono text-[11px]">COMMAND FILTERS:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs min-w-0">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 focus:outline-none text-xs w-full min-w-0"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk (&ge;75)</option>
            <option value="Medium">Medium Risk (35-74)</option>
            <option value="Low">Low Risk (&lt;35)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 focus:outline-none text-xs w-full min-w-0"
          >
            <option value="All">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 focus:outline-none text-xs w-full min-w-0"
          >
            <option value="All">All Departments</option>
            <option value="NHAI">MoRTH / NHAI</option>
            <option value="Railways">Ministry of Railways</option>
            <option value="Water">Water Supply</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 focus:outline-none text-xs w-full min-w-0"
          >
            <option value="All">All Locations</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>
      </div>

      {/* 6 PREMIUM KPI GLASS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* CARD 1: Total Projects */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">TOTAL PROJECTS</span>
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              <AnimatedNumber value={totalCount} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>Monitored</span>
              <span className="text-cyan-400 font-bold">100%</span>
            </div>
          </div>
        </div>

        {/* CARD 2: High Risk */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-orange-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 truncate">HIGH RISK</span>
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono glow-text-amber">
              <AnimatedNumber value={highRiskCount} />
            </div>
            <div className="text-[10px] text-orange-400/90 font-medium mt-1 flex items-center justify-between">
              <span>↑ 3 projects</span>
              <span className="font-bold">Review</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Medium Risk */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 border border-amber-500/20 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-amber-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 truncate">MEDIUM RISK</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              <AnimatedNumber value={mediumRiskCount} />
            </div>
            <div className="text-[10px] text-amber-400/80 font-medium mt-1 flex items-center justify-between">
              <span>Observation</span>
              <span className="font-mono font-bold">34</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Delay Risk */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">DELAY RISK</span>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              <AnimatedNumber value={delayRiskCount} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Schedule gap</span>
              <span className="text-amber-400 font-mono font-bold">21</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Cost Overrun */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-slate-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">COST OVERRUN</span>
            <IndianRupee className="w-4 h-4 text-red-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-red-400 font-mono">
              <AnimatedNumber value={costOverrunCount} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Budget risk</span>
              <span className="text-red-400 font-mono font-bold">14</span>
            </div>
          </div>
        </div>

        {/* CARD 6: Actions Required */}
        <div className="glass-panel-dark-interactive rounded-2xl p-3 sm:p-4 border border-cyan-500/30 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-cyan-400 gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 truncate">ACTION REQUIRED</span>
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono glow-text-cyan">
              <AnimatedNumber value={actionRequiredCount} />
            </div>
            <div className="text-[10px] text-cyan-400/90 font-medium mt-1 flex items-center justify-between">
              <span>Pending review</span>
              <span className="font-bold">26</span>
            </div>
          </div>
        </div>

      </div>

      {/* INTERACTIVE MAP COMPONENT */}
      <IndiaMap projects={filteredProjects} onSelectProject={onSelectProject} />

      {/* MAIN INTELLIGENCE LAYOUT: ASYMMETRIC DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / LARGE: RISK TREND CHART */}
        <div className="lg:col-span-8 glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Macro Portfolio Risk Trend</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">30-day moving average AI risk score trajectory</p>
            </div>

            {/* Timeframe Tabs */}
            <div className="flex items-center space-x-1 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['7d', '30d', '90d', '6m', '1y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTrendTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition ${
                    trendTimeframe === tf 
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#06b6d4', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 0 15px rgba(6,182,212,0.2)' }}
                />
                <Area type="monotone" dataKey="avgRiskScore" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#cyanGrad)" name="Average Risk Score" />
                <Area type="monotone" dataKey="highRiskCount" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#purpleGrad)" name="High Risk Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: RISK DISTRIBUTION DONUT CHART */}
        <div className="lg:col-span-4 glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Risk Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">AI Categorized</span>
          </div>

          <div className="relative h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#030712" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-3xl font-black text-white font-mono">{totalCount}</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-widest">PROJECTS</span>
            </div>
          </div>

          {/* Legend Grid with Data percentages */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                <span>LOW RISK</span>
                <span className="font-mono">{Math.round((lowRiskCount/totalCount)*100)}%</span>
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{lowRiskCount}</div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                <span>MEDIUM RISK</span>
                <span className="font-mono">{Math.round((mediumRiskCount/totalCount)*100)}%</span>
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{mediumRiskCount}</div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-orange-500/20">
              <div className="flex items-center justify-between text-[10px] text-orange-400 font-bold">
                <span>HIGH RISK</span>
                <span className="font-mono">{Math.round((highRiskCount/totalCount)*100)}%</span>
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{highRiskCount}</div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-red-500/20">
              <div className="flex items-center justify-between text-[10px] text-red-400 font-bold">
                <span>CRITICAL</span>
                <span className="font-mono">4%</span>
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">5</div>
            </div>
          </div>
        </div>

      </div>

      {/* PROJECT RISK MATRIX (SCATTER MATRIX) */}
      <div className="glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <ScatterIcon className="w-4 h-4 text-cyan-400" />
              <span>Project Risk Matrix (Progress Gap vs AI Risk Score)</span>
            </h3>
            <p className="text-xs text-slate-400">Interactive telemetry matrix — Click nodes to open project deep-dive</p>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="flex items-center space-x-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span>Low Risk</span></span>
            <span className="flex items-center space-x-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>Medium Risk</span></span>
            <span className="flex items-center space-x-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-400" /><span>High Risk</span></span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="gap" name="Progress Gap %" unit="%" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Progress Gap (Planned % - Actual %)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="number" dataKey="riskScore" name="Risk Score" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'AI Risk Score', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
              <ZAxis type="number" dataKey="z" range={[60, 200]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-cyan-500/40 p-3 rounded-xl shadow-2xl space-y-1 text-xs">
                      <div className="font-bold text-white">{data.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{data.code}</div>
                      <div className="text-slate-300">Risk Score: <span className="font-bold text-orange-400 font-mono">{data.riskScore}</span></div>
                      <div className="text-slate-300">Progress Gap: <span className="font-bold text-amber-400 font-mono">{data.gap}%</span></div>
                      <div className="text-[10px] text-slate-400 pt-1">Primary: {data.primaryRisk}</div>
                    </div>
                  );
                }}
              />
              <Scatter 
                data={riskMatrixData} 
                fill="#06b6d4" 
                onClick={(e: any) => e?.payload?.id && onSelectProject(e.payload.id)}
                className="cursor-pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HIGH-RISK PROJECTS TABLE */}
      <div className="glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>High-Risk Infrastructure Projects</span>
            </h3>
            <p className="text-xs text-slate-400">Priority projects requiring operational intervention</p>
          </div>
          
          <button
            onClick={() => onSelectPage('projects')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Full Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">Project</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Progress (Actual / Planned)</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Primary Risk Factor</th>
                  <th className="p-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProjects.slice(0, 6).map((p) => {
                  const riskStyle = getRiskColorClass(p.riskScore);
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => onSelectProject(p.id)}
                      className={`hover:bg-slate-800/40 transition cursor-pointer group ${
                        p.riskScore >= 75 ? 'animate-high-risk-glow' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-extrabold text-white text-xs group-hover:text-cyan-300 transition">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code} • {p.department}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{p.state}</td>
                      <td className="p-3">
                        <div className="font-mono font-semibold text-slate-200 mb-1">{p.actualPhysicalProgress}% / {p.targetPhysicalProgress}%</div>
                        <div className="w-28">
                          <AnimatedProgress 
                            value={p.actualPhysicalProgress} 
                            max={100} 
                            variant={p.actualPhysicalProgress < p.targetPhysicalProgress ? 'warning' : 'cyan'} 
                            height="h-1.5"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] border ${riskStyle.badge}`}>
                          {p.riskScore} / 100
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{p.primaryRisk}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p.id);
                          }}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto"
                        >
                          <span>View Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            No projects found matching the selected parameters.
          </div>
        )}
      </div>

      {/* EXPLAINABLE AI (XAI) & EARLY WARNING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EXPLAINABLE AI FEATURE BREAKDOWN */}
        <div className="lg:col-span-6 glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4 border border-purple-500/20 relative overflow-hidden">
          <LoadingScanner active label="SCANNING TELEMETRY FACTORS" position="top" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3 pt-2">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Explainable AI Risk Breakdown</span>
            </h3>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">XAI Telemetry</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{topRiskProject.name}</span>
              <span className="text-orange-400 font-mono font-bold">Risk Score: {topRiskProject.riskScore}/100</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Schedule Variance</span>
                  <span className="font-mono text-cyan-400 font-bold">86%</span>
                </div>
                <AnimatedProgress value={86} variant="cyan" glow height="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Progress Gap</span>
                  <span className="font-mono text-cyan-400 font-bold">74%</span>
                </div>
                <AnimatedProgress value={74} variant="cyan" height="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Delayed Milestones</span>
                  <span className="font-mono text-purple-400 font-bold">68%</span>
                </div>
                <AnimatedProgress value={68} variant="purple" glow height="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Cost Utilization Pressure</span>
                  <span className="font-mono text-amber-400 font-bold">42%</span>
                </div>
                <AnimatedProgress value={42} variant="amber" height="h-2" />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>AI EXPLANATION NARRATIVE</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Risk is primarily driven by schedule variance and lower-than-planned physical progress. Multiple delayed milestones increase the likelihood of further schedule slippage.
              </p>
            </div>
          </div>
        </div>

        {/* AI EARLY WARNINGS PANEL */}
        <div className="lg:col-span-6 glass-panel-dark rounded-2xl p-5 shadow-sm space-y-4 border border-orange-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>AI Early Warnings Queue</span>
            </h3>
            <button
              onClick={() => onSelectPage('alerts')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              View Queue ({alerts.length})
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 2).map((alt) => (
              <div 
                key={alt.id}
                onClick={() => onSelectProject(alt.projectId)}
                className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl space-y-2 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      alt.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {alt.severity} RISK
                    </span>
                    <span className="text-xs font-bold text-white">{alt.projectName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{alt.timeAgo}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{alt.description}</p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-cyan-400 font-bold flex items-center space-x-1">
                    <span>Review Warning Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
