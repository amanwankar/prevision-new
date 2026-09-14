import React, { useState, useMemo } from 'react';
import type { Project, User } from '../../types';
import { 
  calculateDataQuality, 
  getRiskAnalysisReadiness, 
  type DataQualityResult 
} from '../../services/dataQualityService';
import { DataPipelineVisualization } from './DataPipelineVisualization';
import { BulkImportModal } from './BulkImportModal';
import { 
  Database, 
  Search, 
  Plus, 
  Upload, 
  Play, 
  Edit, 
  FolderKanban
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { CommandButton } from '../common/CommandButton';

interface DataManagementCenterProps {
  currentUser?: User | null;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigateNewProject: () => void;
  onNavigateEditProject: (projectId: string) => void;
  onRunRiskAnalysis: (projectId: string) => void;
  onImportProjects: (importedProjects: Project[]) => void;
}

export const DataManagementCenter: React.FC<DataManagementCenterProps> = ({
  projects,
  onSelectProject,
  onNavigateNewProject,
  onNavigateEditProject,
  onRunRiskAnalysis,
  onImportProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedQualityFilter, setSelectedQualityFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activePipelineStage, setActivePipelineStage] = useState(3);

  // Compute Data Quality Results for all projects
  const projectQualityMap = useMemo(() => {
    const map = new Map<string, DataQualityResult>();
    projects.forEach((p) => {
      map.set(p.id, calculateDataQuality(p));
    });
    return map;
  }, [projects]);

  // Aggregate HUD Statistics
  const stats = useMemo(() => {
    let readyCount = 0;
    let reviewCount = 0;
    let totalQuality = 0;
    let totalIssues = 0;
    let criticalErrors = 0;

    projects.forEach((p) => {
      const q = projectQualityMap.get(p.id) || calculateDataQuality(p);
      totalQuality += q.overallScore;
      totalIssues += q.issues.length;

      if (q.status === 'DATA READY') readyCount++;
      if (q.status === 'NEEDS REVIEW' || q.status === 'INCOMPLETE') reviewCount++;
      if (q.status === 'VALIDATION ERROR') criticalErrors++;
    });

    const avgQuality = projects.length > 0 ? Math.round(totalQuality / projects.length) : 85;

    return {
      completeDataCount: readyCount,
      requiringAttentionCount: reviewCount,
      avgQuality,
      totalIssues,
      criticalErrors,
    };
  }, [projects, projectQualityMap]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      // Department Filter
      if (selectedDept !== 'ALL' && p.department !== selectedDept) return false;

      // Data Quality Status Filter
      const q = projectQualityMap.get(p.id);
      if (selectedStatusFilter !== 'ALL' && q?.status !== selectedStatusFilter) return false;

      // Quality Score Range Filter
      if (selectedQualityFilter === 'HIGH' && (q?.overallScore || 0) < 85) return false;
      if (selectedQualityFilter === 'MEDIUM' && ((q?.overallScore || 0) < 70 || (q?.overallScore || 0) >= 85)) return false;
      if (selectedQualityFilter === 'LOW' && (q?.overallScore || 0) >= 70) return false;

      return true;
    });
  }, [projects, searchTerm, selectedDept, selectedStatusFilter, selectedQualityFilter, projectQualityMap]);

  // Handle Scan Simulation
  const handleRunGlobalScan = () => {
    setIsScanning(true);
    setActivePipelineStage(0);

    const interval = setInterval(() => {
      setActivePipelineStage((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setIsScanning(false);
          return 3;
        }
        return prev + 1;
      });
    }, 600);
  };

  const getStatusBadge = (status: DataQualityResult['status']) => {
    switch (status) {
      case 'DATA READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'NEEDS REVIEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INCOMPLETE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'VALIDATION ERROR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const departments = Array.from(new Set(projects.map((p) => p.department)));

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 border border-cyan-500/30 shadow-2xl">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                PRAEVISIO DATA INTELLIGENCE CENTER
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              DATA INTELLIGENCE CENTER
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Prepare reliable project intelligence before risk analysis begins. Validate, normalize, and verify data quality as the foundation of AI risk forecasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CommandButton
              onClick={onNavigateNewProject}
              variant="primary"
              icon={Plus}
            >
              NEW PROJECT INTAKE
            </CommandButton>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Upload className="h-4 w-4 text-cyan-400" />
              IMPORT BULK DATA
            </button>
          </div>
        </div>

        {/* Live Summary Indicators HUD */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            label="DATA READY PROJECTS"
            value={stats.completeDataCount.toString()}
            sublabel={`of ${projects.length} total monitored`}
            trend="up"
            color="cyan"
          />
          <MetricCard
            label="NEEDS ATTENTION"
            value={stats.requiringAttentionCount.toString()}
            sublabel="warnings or missing inputs"
            trend="down"
            color="amber"
          />
          <MetricCard
            label="AVG DATA QUALITY"
            value={`${stats.avgQuality}/100`}
            sublabel="portfolio score index"
            trend="up"
            color="purple"
          />
          <MetricCard
            label="VALIDATION ISSUES"
            value={stats.totalIssues.toString()}
            sublabel="signals identified"
            trend="down"
            color="amber"
          />
          <MetricCard
            label="CRITICAL ERRORS"
            value={stats.criticalErrors.toString()}
            sublabel="blocking risk engine"
            trend="down"
            color="red"
          />
        </div>

        {/* Animated Pipeline Visualizer */}
        <div className="mt-8">
          <DataPipelineVisualization
            activeStage={activePipelineStage}
            isScanning={isScanning}
            onRunScan={handleRunGlobalScan}
          />
        </div>
      </div>

      {/* 2. SEARCH & FILTER SUITE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search project name, code (ID), or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 font-medium transition-colors"
            />
          </div>

          {/* Department dropdown */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-400"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Validation Status dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-400"
          >
            <option value="ALL">ALL VALIDATION STATUSES</option>
            <option value="DATA READY">DATA READY</option>
            <option value="NEEDS REVIEW">NEEDS REVIEW</option>
            <option value="INCOMPLETE">INCOMPLETE</option>
            <option value="VALIDATION ERROR">VALIDATION ERROR</option>
          </select>

          {/* Quality score dropdown */}
          <select
            value={selectedQualityFilter}
            onChange={(e) => setSelectedQualityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-400"
          >
            <option value="ALL">ALL QUALITY SCORES</option>
            <option value="HIGH">HIGH (85 - 100)</option>
            <option value="MEDIUM">MEDIUM (70 - 84)</option>
            <option value="LOW">LOW (&lt; 70)</option>
          </select>

          {(searchTerm || selectedDept !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedQualityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
                setSelectedStatusFilter('ALL');
                setSelectedQualityFilter('ALL');
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-mono text-xs font-bold transition-colors"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      </div>

      {/* 3. PROJECT DATA MANAGEMENT TABLE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide uppercase font-mono">
              PROJECT DATA INTELLIGENCE DIRECTORY ({filteredProjects.length})
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            SINGLE SOURCE OF TRUTH METRICS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">PROJECT CODE & TITLE</th>
                <th className="p-4">DEPARTMENT</th>
                <th className="p-4">BUDGET (₹ CR)</th>
                <th className="p-4">TIMELINE & PROGRESS</th>
                <th className="p-4">DATA QUALITY SCORE</th>
                <th className="p-4">VALIDATION STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProjects.map((p) => {
                const qResult = projectQualityMap.get(p.id) || calculateDataQuality(p);
                const readiness = getRiskAnalysisReadiness(p);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Project Code & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold text-cyan-400">
                          {p.code}
                        </span>
                        <div>
                          <button
                            onClick={() => onSelectProject(p.id)}
                            className="font-bold text-white hover:text-cyan-300 transition-colors text-left text-sm"
                          >
                            {p.name}
                          </button>
                          <span className="block text-[11px] text-slate-400">{p.sector}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 font-mono text-slate-300">
                      {p.department}
                    </td>

                    {/* Budget */}
                    <td className="p-4 font-mono">
                      <span className="font-bold text-white">₹{p.originalBudgetCr} Cr</span>
                      <span className="block text-[10px] text-slate-400">
                        Spent: ₹{p.expenditureToDateCr || 0} Cr
                      </span>
                    </td>

                    {/* Timeline & Progress */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Progress:</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {p.actualPhysicalProgress}% / {p.targetPhysicalProgress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-28 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
                            style={{ width: `${Math.min(100, p.actualPhysicalProgress)}%` }}
                          />
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Target: {p.originalTargetDate}
                        </span>
                      </div>
                    </td>

                    {/* Data Quality Score */}
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-extrabold ${
                            qResult.overallScore >= 85
                              ? 'text-emerald-400'
                              : qResult.overallScore >= 70
                              ? 'text-cyan-400'
                              : qResult.overallScore >= 50
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {qResult.overallScore}
                        </span>
                        <span className="text-[10px] text-slate-500">/ 100</span>
                      </div>
                      <span className="block text-[10px] text-slate-400">
                        {qResult.issues.length} signal(s)
                      </span>
                    </td>

                    {/* Validation Status */}
                    <td className="p-4 font-mono">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                          qResult.status
                        )}`}
                      >
                        {qResult.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigateEditProject(p.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                          title="Edit Project Data"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRunRiskAnalysis(p.id)}
                          disabled={!readiness.canRunRiskAnalysis}
                          className={`p-2 rounded-lg transition-colors ${
                            readiness.canRunRiskAnalysis
                              ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                          title="Run Risk Analysis"
                        >
                          <Play className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportProjects={onImportProjects}
      />
    </div>
  );
};
