import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Download,
  Clock
} from 'lucide-react';
import type { Project } from '../types';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { PulseIndicator } from './motion/PulseIndicator';
import { LoadingScanner } from './motion/LoadingScanner';
import { AnimatedRiskScore } from './motion/AnimatedRiskScore';
import { AnimatedProgress } from './motion/AnimatedProgress';
import { AnalyticsPipelineStream } from './analytics/AnalyticsPipelineStream';
import { ProjectComparisonTool } from './analytics/ProjectComparisonTool';
import { 
  getOverallRiskMetrics,
  getRiskDistribution,
  getRiskTrend,
  getRiskTypeDistribution,
  getTopRiskFactors,
  getProjectRiskMatrix,
  getDepartmentRisk,
  getLocationRisk,
  getHighRiskProjects,
  getEmergingRisks,
  exportAnalyticsReportCSV,
  type ScatterMatrixPoint
} from '../services/analyticsService';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  ScatterChart, 
  Scatter,
  ZAxis
} from 'recharts';

interface RiskAnalyticsProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onShowToast?: (message: string) => void;
}

export const RiskAnalytics: React.FC<RiskAnalyticsProps> = ({ 
  projects, 
  onSelectProject,
  onShowToast 
}) => {
  // State Filters
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | '6M' | '1Y'>('6M');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All');
  const [selectedScatterPoint, setSelectedScatterPoint] = useState<ScatterMatrixPoint | null>(null);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // Filter projects dataset based on selections
  const filteredProjects = projects.filter(p => {
    if (selectedDepartment !== 'All' && p.department !== selectedDepartment) return false;
    if (selectedLocation !== 'All' && p.state !== selectedLocation) return false;
    if (selectedRiskLevel !== 'All') {
      const isHigh = p.riskScore >= 75;
      const isMed = p.riskScore >= 50 && p.riskScore < 75;
      const isLow = p.riskScore < 50;
      if (selectedRiskLevel === 'High' && !isHigh) return false;
      if (selectedRiskLevel === 'Medium' && !isMed) return false;
      if (selectedRiskLevel === 'Low' && !isLow) return false;
    }
    return true;
  });

  // Calculate Data Slices from Analytics Service
  const metrics = getOverallRiskMetrics(filteredProjects);
  const distribution = getRiskDistribution(filteredProjects);
  const trendData = getRiskTrend(filteredProjects);
  const riskTypes = getRiskTypeDistribution(filteredProjects);
  const topFactors = getTopRiskFactors(filteredProjects);
  const scatterPoints = getProjectRiskMatrix(filteredProjects);
  const deptRiskList = getDepartmentRisk(filteredProjects);
  const locRiskList = getLocationRisk(filteredProjects);
  const highRiskProjects = getHighRiskProjects(filteredProjects);
  const emergingRisks = getEmergingRisks(filteredProjects);

  // Departments & Locations for Filter Dropdowns
  const allDepartments = Array.from(new Set(projects.map(p => p.department)));
  const allLocations = Array.from(new Set(projects.map(p => p.state)));

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      onShowToast?.('Analytics model refreshed with latest telemetry.');
    }, 600);
  };

  const handleExportCSV = () => {
    exportAnalyticsReportCSV(filteredProjects);
    onShowToast?.('Exported Risk Analytics dataset to CSV.');
  };

  const clearAllFilters = () => {
    setSelectedDepartment('All');
    setSelectedLocation('All');
    setSelectedRiskLevel('All');
  };

  const activeFilterCount = (selectedDepartment !== 'All' ? 1 : 0) + 
                            (selectedLocation !== 'All' ? 1 : 0) + 
                            (selectedRiskLevel !== 'All' ? 1 : 0);

  return (
    <div className="space-y-6 pb-20 font-sans relative">
      
      {/* 1. PAGE HEADER & REFRESH ACTION TOOLBAR */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden glass-reflection animate-stagger-fade">
        <LoadingScanner />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>PREDICTIVE ANALYTICS CENTER</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Macro Risk Intelligence Console
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Understand where infrastructure risk is emerging, why it is increasing, and which national projects require immediate mitigation.
            </p>
          </div>

          {/* Right Header Status & Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <PulseIndicator color="cyan" size="sm" />
              <span className="text-cyan-400 font-bold">ANALYTICS ENGINE ACTIVE</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{lastRefreshedTime}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH ENGINE'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>EXPORT CSV</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. PIPELINE DATA STREAM VISUALIZATION */}
      <AnalyticsPipelineStream isRefreshing={isRefreshing} />

      {/* 3. HERO OVERALL RISK INDEX & KPI ANALYTICS STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hero Overall Risk Index Gauge */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between glass-reflection">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              OVERALL NATIONAL RISK INDEX
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              128 PROJECTS MONITORED
            </span>
          </div>

          <div className="my-6 flex items-center justify-center space-x-6">
            <AnimatedRiskScore score={metrics.overallRiskIndex} size={110} />
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">
                <AnimatedNumber value={metrics.overallRiskIndex} /> <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-xs font-extrabold font-mono text-rose-400 uppercase tracking-wide">
                {metrics.overallRiskIndex >= 70 ? 'HIGH ATTENTION REQUIRED' : 'MODERATE RISK STATE'}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Weighted aggregate across active infrastructure sectors.
              </div>
            </div>
          </div>

          {/* Quick Counter Summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center font-mono text-xs">
            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-rose-400 font-bold text-base"><AnimatedNumber value={metrics.highRiskCount} /></div>
              <div className="text-[9px] text-slate-500 uppercase">HIGH RISK</div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-amber-400 font-bold text-base"><AnimatedNumber value={metrics.projectsRequiringAttentionCount} /></div>
              <div className="text-[9px] text-slate-500 uppercase">ATTENTION</div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-purple-400 font-bold text-base"><AnimatedNumber value={emergingRisks.length} /></div>
              <div className="text-[9px] text-slate-500 uppercase">EMERGING</div>
            </div>
          </div>

        </div>

        {/* 6 KPI Cards Strip */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-rose-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>HIGH-RISK</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">
              <AnimatedNumber value={metrics.highRiskCount} />
            </div>
            <div className="text-[10px] text-rose-400">Score &gt;= 75/100</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>AVERAGE RISK</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300">
              <AnimatedNumber value={metrics.averageRiskScore} />
            </div>
            <div className="text-[10px] text-slate-400">National mean</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>SCHEDULE RISK</span>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300">
              <AnimatedNumber value={metrics.scheduleDelayRiskCount} />
            </div>
            <div className="text-[10px] text-purple-400">Delay predicted</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>COST RISK</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              <AnimatedNumber value={metrics.costOverrunRiskCount} />
            </div>
            <div className="text-[10px] text-amber-400">Budget gap</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>EMERGING</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-teal-300">
              <AnimatedNumber value={emergingRisks.length} />
            </div>
            <div className="text-[10px] text-teal-400">Accelerating velocity</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>ACTION NEEDED</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300">
              <AnimatedNumber value={metrics.projectsRequiringAttentionCount} />
            </div>
            <div className="text-[10px] text-emerald-400">Pending mitigation</div>
          </div>

        </div>

      </div>

      {/* 4. GLASS FILTER BAR & ACTIVE FILTER CHIPS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Filter className="w-4 h-4" />
            <span>ANALYTICS FILTER CONTROLS</span>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-rose-400 hover:underline flex items-center space-x-1"
            >
              <span>Clear All ({activeFilterCount})</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">DEPARTMENT</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="All">All Departments ({allDepartments.length})</option>
              {allDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">LOCATION / STATE</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="All">All Locations ({allLocations.length})</option>
              {allLocations.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">RISK SEVERITY LEVEL</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              <option value="All">All Severities</option>
              <option value="High">High Risk (&gt;= 75)</option>
              <option value="Medium">Medium Risk (50 - 74)</option>
              <option value="Low">Low Risk (&lt; 50)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. SIGNATURE VISUALIZATION: PROJECT RISK MATRIX (2D SCATTER CHART) */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-4 glass-reflection">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIGNATURE 2D VISUALIZATION</span>
            </div>
            <h2 className="text-xl font-black text-white font-mono">
              NATIONAL PROJECT RISK MATRIX
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Plotting Physical Progress Gap (%) against Calculated Risk Index (0-100). Hover or click points to inspect projects.
            </p>
          </div>

          {selectedScatterPoint && (
            <div className="bg-slate-950 border border-cyan-500/40 p-3 rounded-2xl flex items-center space-x-3 text-xs font-mono">
              <div>
                <div className="font-bold text-white">{selectedScatterPoint.name}</div>
                <div className="text-[10px] text-slate-400">{selectedScatterPoint.code} • Risk: {selectedScatterPoint.riskScore}</div>
              </div>
              <button
                onClick={() => onSelectProject(selectedScatterPoint.projectId)}
                className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-xl flex items-center space-x-1 hover:bg-cyan-400 transition"
              >
                <span>OPEN</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2D Scatter Plot Area */}
        <div className="h-72 w-full relative">
          <div className="absolute top-2 left-4 text-[10px] font-mono font-bold text-rose-500/50 uppercase pointer-events-none">
            CRITICAL ZONE (HIGH RISK + LARGE PROGRESS GAP)
          </div>
          <div className="absolute bottom-2 right-4 text-[10px] font-mono font-bold text-emerald-500/50 uppercase pointer-events-none">
            OPTIMAL ZONE (LOW RISK + ON TRACK)
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                type="number" 
                dataKey="progressGap" 
                name="Progress Gap" 
                unit="%" 
                stroke="#64748b" 
                tick={{ fontSize: 10 }} 
                label={{ value: 'Physical Progress Gap (%)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis 
                type="number" 
                dataKey="riskScore" 
                name="Risk Score" 
                domain={[0, 100]} 
                stroke="#64748b" 
                tick={{ fontSize: 10 }}
                label={{ value: 'Risk Index (0-100)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
              />
              <ZAxis range={[60, 120]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const data: ScatterMatrixPoint = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-cyan-500/50 p-3 rounded-2xl text-xs font-mono shadow-2xl space-y-1">
                      <div className="font-bold text-white">{data.name}</div>
                      <div className="text-slate-400">ID: {data.code}</div>
                      <div className="text-rose-400 font-bold">Risk Index: {data.riskScore}/100</div>
                      <div className="text-amber-400">Progress Gap: {data.progressGap}%</div>
                      <div className="text-cyan-300">Signal: {data.riskType}</div>
                    </div>
                  );
                }}
              />
              <Scatter 
                data={scatterPoints} 
                onClick={(pt) => setSelectedScatterPoint(pt as unknown as ScatterMatrixPoint)}
                cursor="pointer"
              >
                {scatterPoints.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.riskScore >= 80 ? '#f43f5e' :
                      entry.riskScore >= 65 ? '#f59e0b' :
                      entry.riskScore >= 50 ? '#8b5cf6' :
                      '#34d399'
                    } 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 6. TREND INTELLIGENCE & "WHY IS RISK CHANGING?" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                NATIONAL RISK TREND TRAJECTORY
              </h3>
            </div>

            <div className="flex items-center space-x-1">
              {(['7D', '30D', '90D', '6M', '1Y'] as const).map(rng => (
                <button
                  key={rng}
                  onClick={() => setDateRange(rng)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dateRange === rng ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.points}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#8b5cf6', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="avgRiskScore" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Interpretation: "Why is Risk Changing?" */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                TREND INTERPRETATION
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                trendData.trendDirection === 'Increasing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                trendData.trendDirection === 'Decreasing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {trendData.trendDirection === 'Increasing' ? '↑ INCREASING (+4.2)' : '→ STABLE'}
              </span>
            </div>

            <div className="space-y-2 font-sans">
              <div className="font-extrabold text-white text-sm">
                Why is national risk score changing?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Overall national risk score increased by +4.2 points primarily due to schedule variance and delayed land acquisition clearances across high-priority highway and metro sector projects.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-1">
            <div className="text-[10px] text-purple-400 font-bold">PRIMARY DRIVER REASONING</div>
            <div className="text-slate-200 text-xs font-mono">
              3 high-cost highway projects reported &gt;12% physical progress gap in Section 4.
            </div>
          </div>
        </div>

      </div>

      {/* 7. RISK DRIVERS & SECTOR BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Risk Factor Contribution Bars */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              ANALYTICAL RISK DRIVERS
            </h3>
            <span className="text-[10px] text-rose-400 font-bold">SYSTEMIC FACTORS</span>
          </div>

          <div className="space-y-3.5">
            {topFactors.map(rf => (
              <div key={rf.factor} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold text-[11px] truncate max-w-[180px]" title={rf.factor}>{rf.factor}</span>
                  <span className="text-rose-400 font-bold">{rf.avgContributionScore}/100</span>
                </div>
                <AnimatedProgress value={rf.avgContributionScore} color="rose" height="sm" />
                <div className="text-[10px] text-slate-500">
                  Affecting {rf.affectedProjectsCount} national projects
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Risk Breakdown Table */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              RISK BY DEPARTMENT
            </h3>
            <span className="text-[10px] text-cyan-400 font-bold">{deptRiskList.length} SECTORS</span>
          </div>

          <div className="space-y-2.5">
            {deptRiskList.map(dept => (
              <div key={dept.department} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white font-sans text-xs">{dept.department}</div>
                  <div className="text-[10px] text-slate-400">{dept.totalProjects} Projects • {dept.highRiskCount} High Risk</div>
                </div>

                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  dept.avgRiskScore >= 75 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  dept.avgRiskScore >= 55 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {dept.avgRiskScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Risk Breakdown Table */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              RISK BY LOCATION (STATES)
            </h3>
            <span className="text-[10px] text-purple-400 font-bold">{locRiskList.length} REGIONS</span>
          </div>

          <div className="space-y-2.5">
            {locRiskList.slice(0, 5).map(loc => (
              <div key={loc.location} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white font-sans text-xs">{loc.location}</div>
                  <div className="text-[10px] text-slate-400">{loc.totalProjects} Projects • {loc.highRiskCount} High Risk</div>
                </div>

                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  loc.avgRiskScore >= 75 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  loc.avgRiskScore >= 55 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  Avg {loc.avgRiskScore}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 8. RISK DISTRIBUTION DONUT & SIGNAL CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              RISK LEVEL DISTRIBUTION
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">4 SEVERITY TIERS</span>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <div className="text-xl font-black text-white font-mono">{filteredProjects.length}</div>
              <div className="text-[9px] font-mono text-slate-500">PROJECTS</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            {distribution.map(d => (
              <div key={d.category} className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300 font-bold">{d.category}</span>
                </div>
                <span className="text-white font-bold">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Categories Distribution */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              PRIMARY RISK SIGNAL CATEGORIES
            </h3>
            <span className="text-[10px] text-cyan-400">TELEMETRY BREAKDOWN</span>
          </div>

          <div className="space-y-3">
            {riskTypes.map(rt => (
              <div key={rt.type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">{rt.type}</span>
                  <span className="text-cyan-400 font-bold">{rt.count} Projects ({rt.percentage}%)</span>
                </div>
                <AnimatedProgress value={rt.percentage} color="cyan" height="sm" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 9. EMERGING RISK DETECTION & HIGHEST RISK RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Emerging Risks Section */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                EMERGING RISKS DETECTION
              </h3>
            </div>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded-full">
              ACCELERATING VELOCITY
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {emergingRisks.map(em => (
              <div key={em.projectId} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-teal-400 font-bold">{em.projectCode}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-white font-bold font-sans">{em.projectName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Signal: {em.riskType}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-rose-400 font-bold text-xs flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{em.previousRisk} → {em.currentRisk}</span>
                  </div>
                  <button
                    onClick={() => onSelectProject(em.projectId)}
                    className="text-[10px] text-cyan-400 hover:underline font-bold mt-1 inline-block"
                  >
                    INSPECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Risk Ranking */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                HIGHEST RISK PROJECTS RANKING
              </h3>
            </div>
            <span className="text-[10px] text-rose-400 font-bold">TOP ATTENTION NEEDED</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {highRiskProjects.slice(0, 5).map((hr, idx) => (
              <div key={hr.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold text-[10px]">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white font-sans text-xs">{hr.name}</div>
                    <div className="text-[10px] text-slate-400">{hr.code} • {hr.department}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-800 px-2.5 py-0.5 rounded-md text-xs">
                    {hr.riskScore}/100
                  </span>
                  <button
                    onClick={() => onSelectProject(hr.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
                    title="Open Project"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 10. MULTI-PROJECT COMPARISON TOOL */}
      <ProjectComparisonTool projects={projects} onSelectProject={onSelectProject} />

    </div>
  );
};
