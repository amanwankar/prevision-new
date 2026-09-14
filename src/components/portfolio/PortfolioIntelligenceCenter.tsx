import React, { useState, useMemo } from 'react';
import type { Project, EarlyWarning, RecommendedAction, User, RiskHistory } from '../../types';
import { 
  getPortfolioSummary, 
  getPortfolioHealthDimensions, 
  getProjectPriorityRadar, 
  getPriorityProjects, 
  getDepartmentIntelligence, 
  getAttentionQueue, 
  generateExecutiveSummary 
} from '../../services/portfolioIntelligenceService';
import { IntelligenceField } from '../background/IntelligenceField';
import { PortfolioHealthIndex } from './PortfolioHealthIndex';
import { ProjectPriorityRadar } from './ProjectPriorityRadar';
import { PriorityProjectBoard } from './PriorityProjectBoard';
import { CrossProjectComparison } from './CrossProjectComparison';
import { ProjectComparisonDrawer } from './ProjectComparisonDrawer';
import { InfrastructureNetwork } from './InfrastructureNetwork';
import { PortfolioAttentionQueue } from './PortfolioAttentionQueue';
import { 
  Search, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Building2,
  X
} from 'lucide-react';

interface PortfolioIntelligenceCenterProps {
  projects: Project[];
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  riskHistory?: RiskHistory[];
  currentUser?: User | null;
  onSelectProject: (projectId: string) => void;
  onOpenExecution: (projectId: string) => void;
  onNavigatePage: (page: string, hash?: string) => void;
  onOpenCopilot?: () => void;
}

export type PortfolioViewMode = 'OVERVIEW' | 'RISK' | 'EXECUTION' | 'WARNINGS' | 'ACTIONS' | 'DATA QUALITY';

export const PortfolioIntelligenceCenter: React.FC<PortfolioIntelligenceCenterProps> = ({
  projects,
  alerts = [],
  actions = [],
  onSelectProject,
  onOpenExecution,
  onOpenCopilot
}) => {
  // UI States
  const [viewMode, setViewMode] = useState<PortfolioViewMode>('OVERVIEW');
  const [isExecutiveFocus, setIsExecutiveFocus] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  // Filter Projects Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDepartment === 'ALL' || p.department === selectedDepartment;
      
      const matchesRisk = selectedRiskFilter === 'ALL' || p.riskLevel === selectedRiskFilter;

      return matchesSearch && matchesDept && matchesRisk;
    });
  }, [projects, searchQuery, selectedDepartment, selectedRiskFilter]);

  // Derived Intelligence Calculations
  const summaryMetrics = getPortfolioSummary(filteredProjects, alerts, actions);
  const healthDimensions = getPortfolioHealthDimensions(filteredProjects);
  const radarNodes = getProjectPriorityRadar(filteredProjects);
  const priorityProjects = getPriorityProjects(filteredProjects, alerts, actions);
  const deptIntel = getDepartmentIntelligence(filteredProjects, alerts, actions);
  const attentionItems = getAttentionQueue(filteredProjects, alerts, actions);
  const execSummary = generateExecutiveSummary(filteredProjects, alerts, actions);

  const departmentsList = Array.from(new Set(projects.map(p => p.department || 'Infrastructure Development')));

  return (
    <div className={`space-y-8 font-sans relative min-h-screen text-slate-100 pb-24 ${isExecutiveFocus ? 'p-8 bg-slate-950 fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      
      {/* Atmosphere Background */}
      <IntelligenceField projectState={summaryMetrics.overallHealthStatus === 'CRITICAL' ? 'critical' : summaryMetrics.overallHealthStatus === 'AT RISK' ? 'high_risk' : 'calm'} />

      {/* TOP COMMAND HEADER */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/30 shadow-2xl">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>PRAEVISIO NATIONAL PORTFOLIO SITUATION ROOM</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono tracking-tight flex items-center space-x-2">
            <span>PORTFOLIO INTELLIGENCE</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
              SIH 2026
            </span>
          </h1>
        </div>

        {/* View Mode Switcher & Focus Mode */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950/80 rounded-xl p-1 border border-slate-800 text-xs font-mono">
            {(['OVERVIEW', 'RISK', 'EXECUTION', 'WARNINGS', 'ACTIONS', 'DATA QUALITY'] as PortfolioViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  viewMode === mode 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>COPILOT</span>
            </button>
          )}

          <button
            onClick={() => setIsExecutiveFocus(!isExecutiveFocus)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition flex items-center space-x-1.5"
          >
            {isExecutiveFocus ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isExecutiveFocus ? 'EXIT FOCUS' : 'PORTFOLIO FOCUS'}</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by project name, code, or sector..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 text-slate-200 border border-slate-800 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 text-slate-200 border border-slate-800 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {(searchQuery || selectedDepartment !== 'ALL' || selectedRiskFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('ALL');
                setSelectedRiskFilter('ALL');
              }}
              className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>CLEAR FILTERS</span>
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          Showing <strong className="text-white">{filteredProjects.length}</strong> of {projects.length} projects
        </span>
      </div>

      {/* 2. HERO METRICS */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">Total Monitored</span>
          <span className="text-2xl font-black text-white block mt-1">{summaryMetrics.totalProjects}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">Need Attention</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">{summaryMetrics.projectsRequiringAttention}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">High-Risk Projects</span>
          <span className="text-2xl font-black text-red-400 block mt-1">{summaryMetrics.highRiskProjectsCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">Projects Behind Plan</span>
          <span className="text-2xl font-black text-amber-300 block mt-1">{summaryMetrics.projectsBehindPlanCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">Active Warnings</span>
          <span className="text-2xl font-black text-red-400 block mt-1">{summaryMetrics.activeWarningsCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-[10px] text-slate-500 uppercase block">Pending Actions</span>
          <span className="text-2xl font-black text-cyan-400 block mt-1">{summaryMetrics.pendingActionsCount}</span>
        </div>
      </div>

      {/* 3. PORTFOLIO HEALTH INDEX */}
      <div className="relative z-10">
        <PortfolioHealthIndex
          overallHealthStatus={summaryMetrics.overallHealthStatus}
          healthDimensions={healthDimensions}
        />
      </div>

      {/* 4. PROJECT PRIORITY RADAR & INFRASTRUCTURE NETWORK */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectPriorityRadar
            radarNodes={radarNodes}
            onSelectProject={(proj) => setDrawerProject(proj)}
          />
        </div>

        <div className="space-y-6">
          <InfrastructureNetwork
            projects={filteredProjects}
            selectedProjectId={drawerProject?.id}
            onSelectProject={(id) => {
              const p = projects.find(proj => proj.id === id);
              if (p) setDrawerProject(p);
            }}
          />

          {/* 18. EXECUTIVE SUMMARY BRIEF */}
          <div className="bg-slate-900/90 rounded-2xl border border-purple-500/30 p-5 shadow-2xl font-mono text-xs space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>PORTFOLIO INTELLIGENCE BRIEF</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{execSummary.portfolioStateText}</p>
            <p className="text-amber-300 font-semibold">{execSummary.keySignalText}</p>
            <p className="text-cyan-300">{execSummary.topPriorityText}</p>
          </div>
        </div>
      </div>

      {/* 5. PRIORITY PROJECT BOARD */}
      <div className="relative z-10">
        <PriorityProjectBoard
          priorityProjects={priorityProjects}
          onSelectProject={(proj) => setDrawerProject(proj)}
          onOpenExecution={onOpenExecution}
        />
      </div>

      {/* 6. CROSS-PROJECT COMPARISON */}
      <div className="relative z-10">
        <CrossProjectComparison allProjects={projects} />
      </div>

      {/* 11. DEPARTMENT INTELLIGENCE & ATTENTION QUEUE */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        
        {/* Department Intelligence */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>DEPARTMENT INTELLIGENCE</span>
            </h3>
            <span className="text-slate-400 text-[10px]">Sectoral Distribution</span>
          </div>

          <div className="space-y-2">
            {deptIntel.map((dept) => (
              <div 
                key={dept.departmentName}
                onClick={() => setSelectedDepartment(dept.departmentName)}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 cursor-pointer border border-slate-800 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-bold text-white block">{dept.departmentName}</span>
                  <span className="text-[10px] text-slate-400">{dept.totalProjects} Projects ({dept.highRiskProjects} High Risk)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-cyan-300 block">{dept.averageRiskScore}/100</span>
                  <span className="text-[9px] text-slate-500">Avg Risk Index</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Attention Queue */}
        <PortfolioAttentionQueue
          items={attentionItems}
          onNavigateHash={(hash) => window.location.hash = hash}
        />

      </div>

      {/* 7. PROJECT COMPARISON DRAWER */}
      <ProjectComparisonDrawer
        project={drawerProject}
        alerts={alerts}
        actions={actions}
        onClose={() => setDrawerProject(null)}
        onOpenProject={onSelectProject}
        onOpenExecution={onOpenExecution}
      />

    </div>
  );
};
