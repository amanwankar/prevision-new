import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  ArrowUpRight, 
  Building2,
  X,
  Sparkles,
  Activity,
  ShieldAlert
} from 'lucide-react';
import type { Project, ProjectSector } from '../types';
import { calculateProjectPredictions } from '../services/predictionEngine';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { AnimatedProgress } from './motion/AnimatedProgress';
import { GlassPanel } from './motion/GlassPanel';
import { LoadingScanner } from './motion/LoadingScanner';
import { ProjectSignalMap } from './analytics/ProjectSignalMap';
import { ProjectQuickDrawer } from './analytics/ProjectQuickDrawer';

interface ProjectsDirectoryProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onAddProject: (newProj: Project) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const ProjectsDirectory: React.FC<ProjectsDirectoryProps> = ({
  projects,
  onSelectProject,
  onAddProject,
  searchTerm,
  onSearchChange
}) => {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'map'>('table');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Intelligence Drawer State
  const [quickDrawerProject, setQuickDrawerProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State for Registering New Infrastructure Project
  const [newCode, setNewCode] = useState(() => `MOSPI-HW-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState<ProjectSector>('Highways');
  const [newState, setNewState] = useState('Maharashtra');
  const [newAgency, setNewAgency] = useState('NHAI');
  const [newContractor] = useState('L&T Construction');
  const [newBudget, setNewBudget] = useState<number>(4500);
  const [newTargetProgress, setNewTargetProgress] = useState<number>(75);
  const [newActualProgress, setNewActualProgress] = useState<number>(55);
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');

  // Multi-Attribute Filtering
  const filteredProjects = (projects || []).filter(p => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || 
      p.name?.toLowerCase().includes(query) ||
      p.code?.toLowerCase().includes(query) ||
      p.nodalAgency?.toLowerCase().includes(query) ||
      (p.contractorName && p.contractorName.toLowerCase().includes(query));

    const matchesSector = selectedSector === 'All' || p.sector === selectedSector;
    const matchesRisk = selectedRisk === 'All' || p.riskLevel === selectedRisk;
    const matchesState = selectedState === 'All' || p.state === selectedState;
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'On Track' && p.riskScore < 50) ||
      (selectedStatus === 'At Risk' && p.riskScore >= 50 && p.riskScore < 75) ||
      (selectedStatus === 'Critical' && p.riskScore >= 75);

    return matchesSearch && matchesSector && matchesRisk && matchesState && matchesStatus;
  });

  const handleClearFilters = () => {
    onSearchChange('');
    setSelectedSector('All');
    setSelectedRisk('All');
    setSelectedState('All');
    setSelectedStatus('All');
  };

  const handleOpenDrawer = (proj: Project) => {
    setQuickDrawerProject(proj);
    setIsDrawerOpen(true);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const partialProj: Partial<Project> = {
      targetPhysicalProgress: Number(newTargetProgress),
      actualPhysicalProgress: Number(newActualProgress),
      originalBudgetCr: Number(newBudget),
      revisedBudgetCr: Number(newBudget),
      originalTargetDate: newTargetDate,
      financialDisbursementPercentage: Math.round((newActualProgress / newTargetProgress) * 90)
    };

    const predictions = calculateProjectPredictions(partialProj);

    const createdProject: Project = {
      id: `proj-${Date.now()}`,
      code: newCode,
      name: newName,
      sector: newSector,
      department: `${newAgency} / MoSPI`,
      state: newState,
      locationName: `${newState} Corridor`,
      lat: 19.076,
      lng: 72.877,
      nodalAgency: newAgency,
      contractorName: newContractor,
      originalBudgetCr: Number(newBudget),
      revisedBudgetCr: Number(newBudget),
      expenditureToDateCr: Math.round(newBudget * (newActualProgress / 100)),
      startDate: new Date().toISOString().split('T')[0],
      originalTargetDate: newTargetDate,
      revisedTargetDate: predictions.aiPredictedDate,
      aiPredictedDate: predictions.aiPredictedDate,
      targetPhysicalProgress: Number(newTargetProgress),
      actualPhysicalProgress: Number(newActualProgress),
      financialDisbursementPercentage: Math.round((newActualProgress / newTargetProgress) * 90),
      riskScore: predictions.riskScore,
      riskLevel: predictions.riskLevel,
      primaryRisk: predictions.delayDays > 100 ? 'Schedule Delay' : 'On Track',
      delayDays: predictions.delayDays,
      costOverrunForecastCr: predictions.costOverrunForecastCr,
      status: predictions.riskLevel === 'Critical' ? 'Critical Overrun' : predictions.delayDays > 100 ? 'Delayed' : 'On Track',
      riskFactors: predictions.explanations,
      milestones: [
        { id: 'm-1', name: 'Feasibility & Survey', plannedStartDate: '2024-01-01', plannedEndDate: '2024-06-30', actualEndDate: '2024-06-15', status: 'Completed', progressPercentage: 100 },
        { id: 'm-2', name: 'Main Civil Construction', plannedStartDate: '2024-07-01', plannedEndDate: newTargetDate, status: 'In Progress', progressPercentage: Number(newActualProgress) }
      ],
      sCurveData: [
        { month: 'Jan 25', target: 20, actual: 20, predicted: 20 },
        { month: 'Jul 25', target: 50, actual: 40, predicted: 38 },
        { month: 'Jan 26', target: 75, actual: 55, predicted: 55 }
      ],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'MoSPI System',
          role: 'Predictive Engine',
          note: 'Project registered in PRAEVISIO directory.',
          actionTaken: 'Calculated initial risk score benchmark.',
          previousRiskScore: 0,
          newRiskScore: predictions.riskScore
        }
      ]
    };

    onAddProject(createdProject);
    setShowAddModal(false);
    setNewName('');
  };

  // Metrics for Overview HUD
  const totalCount = projects.length;
  const onTrackCount = projects.filter(p => p.riskScore < 50).length;
  const atRiskCount = projects.filter(p => p.riskScore >= 50 && p.riskScore < 75).length;
  const highRiskCount = projects.filter(p => p.riskScore >= 75).length;
  const delayRiskCount = projects.filter(p => p.delayDays > 90).length;
  const costRiskCount = projects.filter(p => p.costOverrunForecastCr > 0).length;

  const allStates = Array.from(new Set(projects.map(p => p.state).filter(Boolean)));
  const highestRiskProjects = [...projects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  return (
    <div className={`space-y-6 pb-20 font-sans transition-all duration-700 ease-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      
      {/* 1. CINEMATIC HERO HEADER */}
      <GlassPanel variant="glowing" reflection className="p-6 relative overflow-hidden">
        <LoadingScanner active={isRefreshing} label="SYNCHRONIZING PROJECT INTELLIGENCE REPOSITORY" position="top" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40 uppercase font-bold flex items-center space-x-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span>PROJECT INTELLIGENCE COMMAND CENTER</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>● PROJECT DATABASE CONNECTED</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>● RISK ENGINE READY</span>
              </span>

              <span className="text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>● PROJECT SIGNALS ACTIVE</span>
              </span>

              <span className="text-slate-500 font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                DEMO INTELLIGENCE ENVIRONMENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <Building2 className="w-7 h-7 text-cyan-400 shrink-0" />
              <span>NATIONAL INFRASTRUCTURE REPOSITORY</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Monitor infrastructure projects, identify emerging cost and schedule risks, and prioritize early officer intervention across mega-projects in India.
            </p>
          </div>

          {/* Controls: View Switcher & Add Project */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* View Switcher */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-1 font-mono text-xs shadow-inner">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                  viewMode === 'table' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
                title="Command List Table"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">LIST</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                  viewMode === 'grid' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
                title="Intelligence Cards"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">CARDS</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                  viewMode === 'map' ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
                title="Digital Infrastructure Signal Map"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline">SIGNAL MAP</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center space-x-1.5 transition transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTER PROJECT</span>
            </button>
          </div>

        </div>
      </GlassPanel>

      {/* 2. PROJECT OVERVIEW HUD (6 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 font-mono text-xs">
        
        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-slate-800 min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">TOTAL PROJECTS</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            <AnimatedNumber value={totalCount} />
          </div>
          <span className="text-[9px] text-slate-500 block truncate">Monitored Portfolio</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-emerald-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block truncate">ON TRACK</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            <AnimatedNumber value={onTrackCount} />
          </div>
          <span className="text-[9px] text-emerald-300/80 block truncate">Low Risk Baseline</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-yellow-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-yellow-300 block truncate">AT RISK</span>
          <div className="text-xl sm:text-2xl font-black text-yellow-300">
            <AnimatedNumber value={atRiskCount} />
          </div>
          <span className="text-[9px] text-slate-400 block truncate">Watchlist Level</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-rose-500/40 bg-rose-950/10 min-w-0">
          <span className="text-[10px] uppercase font-bold text-rose-400 block truncate">HIGH RISK</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            <AnimatedNumber value={highRiskCount} />
          </div>
          <span className="text-[9px] text-rose-300/80 block truncate">Requires Attention</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-amber-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">DELAY RISK</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            <AnimatedNumber value={delayRiskCount} />
          </div>
          <span className="text-[9px] text-amber-300/80 block truncate">&gt;90 Days Delay</span>
        </GlassPanel>

        <GlassPanel variant="dark" reflection={false} className="p-3 space-y-1 border-purple-500/30 min-w-0">
          <span className="text-[10px] uppercase font-bold text-purple-400 block truncate">COST RISK</span>
          <div className="text-xl sm:text-2xl font-black text-purple-400">
            <AnimatedNumber value={costRiskCount} />
          </div>
          <span className="text-[9px] text-purple-300/80 block truncate">Budget Forecast</span>
        </GlassPanel>

      </div>

      {/* 3. PROJECTS REQUIRING ATTENTION SPOTLIGHT */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              PROJECTS REQUIRING IMMEDIATE ATTENTION
            </h3>
          </div>
          <span className="text-[10px] text-rose-400 font-bold bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-full">
            TOP ATTENTION NEEDED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {highestRiskProjects.map(hr => (
            <div 
              key={hr.id}
              className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-rose-500/50 transition cursor-pointer"
              onClick={() => handleOpenDrawer(hr)}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-bold text-[10px]">{hr.code}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-white font-bold font-sans text-xs truncate max-w-[150px]" title={hr.name}>{hr.name}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Gap: <strong className="text-rose-400">-{Math.max(0, hr.targetPhysicalProgress - hr.actualPhysicalProgress)}%</strong> • Delay: <strong className="text-amber-400">+{hr.delayDays}d</strong>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-lg text-xs">
                  {hr.riskScore}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(hr.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
                  title="Open XAI Record"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ADVANCED MULTI-ATTRIBUTE FILTERS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 font-mono text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search projects by code, name, agency, contractor... (Ctrl + K)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Sectors</option>
              <option value="Highways">Highways</option>
              <option value="Railways">Railways</option>
              <option value="Power & Energy">Power & Energy</option>
              <option value="Urban Transit">Urban Transit</option>
              <option value="Ports & Waterways">Ports & Waterways</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical (75-100)</option>
              <option value="High">High (60-74)</option>
              <option value="Medium">Medium (35-59)</option>
              <option value="Low">Low (0-34)</option>
            </select>

            {allStates.length > 0 && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All States</option>
                {allStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            )}

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical Overrun</option>
            </select>

          </div>

        </div>

        {/* Filter Summary Chips */}
        {(selectedSector !== 'All' || selectedRisk !== 'All' || selectedState !== 'All' || selectedStatus !== 'All' || searchTerm) && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Active Filters:</span>
              {selectedSector !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300">Sector: {selectedSector}</span>}
              {selectedRisk !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300">Risk: {selectedRisk}</span>}
              {selectedState !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300">State: {selectedState}</span>}
              {selectedStatus !== 'All' && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300">Status: {selectedStatus}</span>}
              {searchTerm && <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300">Query: "{searchTerm}"</span>}
            </div>

            <button onClick={handleClearFilters} className="text-[11px] text-rose-400 hover:underline font-bold">
              CLEAR ALL FILTERS
            </button>
          </div>
        )}

      </div>

      {/* 5. MAIN DISPLAY (COMMAND TABLE / CARDS / SIGNAL MAP) */}
      {viewMode === 'map' ? (
        <ProjectSignalMap 
          projects={filteredProjects} 
          onSelectProject={onSelectProject} 
          onOpenQuickDrawer={handleOpenDrawer} 
        />
      ) : viewMode === 'table' ? (
        /* TABLE MODE */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-white uppercase tracking-wider">PROJECT COMMAND QUEUE</span>
            </div>
            <span className="text-[10px] text-slate-400">
              SHOWING <strong className="text-cyan-400">{filteredProjects.length}</strong> OF <strong className="text-white">{projects.length}</strong> PROJECTS
            </span>
          </div>

          <div className="table-scroll-container">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">PROJECT CODE & NAME</th>
                  <th className="py-3.5 px-4 font-bold">SECTOR & STATE</th>
                  <th className="py-3.5 px-4 font-bold">BUDGET</th>
                  <th className="py-3.5 px-4 font-bold">PROGRESS (ACTUAL / TARGET)</th>
                  <th className="py-3.5 px-4 font-bold text-center">RISK SCORE</th>
                  <th className="py-3.5 px-4 font-bold text-center">DELAY PREDICTION</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProjects.map((p) => {
                  const gap = Math.max(0, p.targetPhysicalProgress - p.actualPhysicalProgress);
                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(p)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-cyan-400 font-bold text-[11px]">{p.code}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p.id);
                            }}
                            className="font-bold text-slate-200 hover:text-white hover:underline text-left block text-xs"
                          >
                            {p.name}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-slate-200 font-semibold">{p.sector}</div>
                        <div className="text-slate-400 text-[10px]">{p.state} • {p.nodalAgency}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">
                        ₹{p.originalBudgetCr.toLocaleString()} Cr
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-cyan-400">{p.actualPhysicalProgress}%</span>
                            <span className="text-slate-400 text-[10px]">Target: {p.targetPhysicalProgress}% {gap > 0 && <strong className="text-rose-400">(-{gap}%)</strong>}</span>
                          </div>
                          <AnimatedProgress 
                            value={p.actualPhysicalProgress} 
                            color={p.actualPhysicalProgress < p.targetPhysicalProgress ? 'amber' : 'cyan'} 
                            height="sm" 
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={`px-2.5 py-1 rounded text-xs ${
                          p.riskScore >= 75 ? 'bg-rose-950 text-rose-400 border border-rose-800 font-black shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                          p.riskScore >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {p.riskScore}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        +{p.delayDays} d
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p.id);
                          }}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold font-mono text-[10px] rounded-xl border border-slate-800 transition flex items-center space-x-1 ml-auto"
                        >
                          <span>OPEN XAI RECORD</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const isHigh = p.riskScore >= 75;
            const isMed = p.riskScore >= 50 && p.riskScore < 75;

            return (
              <div 
                key={p.id} 
                className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl space-y-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  isHigh ? 'border-rose-500/40 hover:border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]' :
                  isMed ? 'border-amber-500/40 hover:border-amber-500' :
                  'border-slate-800 hover:border-cyan-500/50'
                }`}
                onClick={() => handleOpenDrawer(p)}
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2 font-sans line-clamp-2">{p.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded font-bold text-xs shrink-0 ${
                    isHigh ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    isMed ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {p.riskScore} Risk
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sector / State:</span>
                    <span className="font-bold text-slate-200 font-sans">{p.sector} • {p.state}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-bold text-slate-200">₹{p.originalBudgetCr.toLocaleString()} Cr</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Physical Progress:</span>
                      <span className="font-bold text-cyan-400">{p.actualPhysicalProgress}%</span>
                    </div>
                    <AnimatedProgress value={p.actualPhysicalProgress} color="cyan" height="sm" />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Predicted Delay:</span>
                    <span className="font-bold text-amber-400">+{p.delayDays} days</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(p.id);
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold font-mono text-xs rounded-2xl transition border border-slate-800 flex items-center justify-center space-x-1.5"
                >
                  <span>INSPECT FULL XAI DETAILS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. QUICK INTELLIGENCE DRAWER */}
      <ProjectQuickDrawer
        project={quickDrawerProject}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectProject={onSelectProject}
      />

      {/* 7. REGISTER NEW PROJECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-scale-up font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>REGISTER NEW INFRASTRUCTURE PROJECT</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Project Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Sector</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value as ProjectSector)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  >
                    <option value="Highways">Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Urban Transit">Urban Transit</option>
                    <option value="Ports & Waterways">Ports & Waterways</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pune Metro Line 3 Extension"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">State / Territory</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Nodal Agency</label>
                  <input
                    type="text"
                    value={newAgency}
                    onChange={(e) => setNewAgency(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Budget (₹ Cr)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Target Progress %</label>
                  <input
                    type="number"
                    value={newTargetProgress}
                    onChange={(e) => setNewTargetProgress(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Actual Progress %</label>
                  <input
                    type="number"
                    value={newActualProgress}
                    onChange={(e) => setNewActualProgress(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="font-mono">
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Compute AI Risk & Register
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
