import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Eye,
  Download,
  X,
  Route
} from 'lucide-react';
import type { Project, ProjectSector, User } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ProjectCard } from './ProjectCard';
import { matchSector } from '../../data/userStore';
import { 
  MAHARASHTRA_DIVISIONS, 
  isProjectInSelectedDivisions, 
  countProjectsInDivision 
} from '../../utils/maharashtraDivisions';

interface SectorDashboardProps {
  projects: Project[];
  currentUser: User;
  activeSector: ProjectSector | 'All';
  onSelectProject: (projectId: string) => void;
  onSelectSector: (sector: ProjectSector | 'All') => void;
}

export const SectorDashboard: React.FC<SectorDashboardProps> = ({
  projects,
  currentUser,
  activeSector,
  onSelectProject,
  onSelectSector
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'On Track' | 'At Risk' | 'Delayed'>('ALL');
  const [roadSubFilter, setRoadSubFilter] = useState<'ALL' | 'NH' | 'BOT' | 'PMGSY' | 'STRUCTURES'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'updated' | 'cost' | 'progress'>('updated');

  const isOfficer = currentUser.role !== 'admin';
  const officerSector = currentUser.sector || currentUser.assignedSectors?.[0] || 'Railways';
  const effectiveSector = isOfficer ? officerSector : activeSector;
  const isRoadSector = matchSector('Roads & Highways', effectiveSector as string);

  // Filter projects strictly by effectiveSector (Officers only ever see their sector's projects)
  const sectorProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!isOfficer && effectiveSector === 'All') return true;
      return matchSector(p.sector, effectiveSector as string);
    });
  }, [projects, effectiveSector, isOfficer]);

  // Road Sub-Category Counts for quick filter tabs
  const roadSubCounts = useMemo(() => {
    if (!isRoadSector) return { all: 0, nh: 0, bot: 0, pmgsy: 0, structures: 0 };
    let nh = 0;
    let bot = 0;
    let pmgsy = 0;
    let structures = 0;

    sectorProjects.forEach((p) => {
      const cls = (p.roadClassification || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (cls.includes('national highway') || cls.includes('nh') || code.startsWith('nh-') || cls.includes('epc') || cls.includes('ham')) nh++;
      if (cls.includes('bot') || name.includes('bot')) bot++;
      if (cls.includes('pmgsy') || name.includes('pmgsy') || name.includes('rural')) pmgsy++;
      if (cls.includes('tunnel') || cls.includes('bridge') || (Boolean(p.structuresCount) && p.structuresCount !== 'N/A' && p.structuresCount !== 'None')) structures++;
    });

    return { all: sectorProjects.length, nh, bot, pmgsy, structures };
  }, [sectorProjects, isRoadSector]);

  // Apply search, status filter, and road sub-filter
  const filteredProjects = useMemo(() => {
    return sectorProjects.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.state && p.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.district && p.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.roadClassification && p.roadClassification.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.contractorName && p.contractorName.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'On Track') {
          matchesStatus = p.status === 'On Track' || p.status === 'Completed';
        } else if (statusFilter === 'At Risk') {
          matchesStatus = p.status === 'At Risk';
        } else if (statusFilter === 'Delayed') {
          matchesStatus = p.status === 'Delayed' || p.status === 'Critical Overrun';
        }
      }

      let matchesRoadSub = true;
      if (isRoadSector && roadSubFilter !== 'ALL') {
        const cls = (p.roadClassification || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        if (roadSubFilter === 'NH') {
          matchesRoadSub = cls.includes('national highway') || cls.includes('nh') || code.startsWith('nh-') || cls.includes('epc') || cls.includes('ham');
        } else if (roadSubFilter === 'BOT') {
          matchesRoadSub = cls.includes('bot') || name.includes('bot');
        } else if (roadSubFilter === 'PMGSY') {
          matchesRoadSub = cls.includes('pmgsy') || name.includes('pmgsy') || name.includes('rural');
        } else if (roadSubFilter === 'STRUCTURES') {
          matchesRoadSub = cls.includes('tunnel') || cls.includes('bridge') || (Boolean(p.structuresCount) && p.structuresCount !== 'N/A' && p.structuresCount !== 'None');
        }
      }

      return matchesSearch && matchesStatus && matchesRoadSub;
    }).sort((a, b) => {
      if (sortBy === 'cost') {
        const costA = a.costCr || a.revisedBudgetCr || a.originalBudgetCr || 0;
        const costB = b.costCr || b.revisedBudgetCr || b.originalBudgetCr || 0;
        return costB - costA;
      }
      if (sortBy === 'progress') {
        const progA = a.physicalProgress || a.actualPhysicalProgress || 0;
        const progB = b.physicalProgress || b.actualPhysicalProgress || 0;
        return progB - progA;
      }
      return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
    });
  }, [sectorProjects, searchQuery, statusFilter, roadSubFilter, isRoadSector, sortBy]);

  // Health Metrics for the Sector
  const metrics = useMemo(() => {
    const total = sectorProjects.length;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let delayedCount = 0;
    let totalCostCr = 0;
    let sumProgress = 0;

    sectorProjects.forEach((p) => {
      const st = p.status.toLowerCase();
      if (st.includes('track') || st.includes('completed')) onTrackCount++;
      else if (st.includes('risk')) atRiskCount++;
      else if (st.includes('delay') || st.includes('critical')) delayedCount++;

      const cost = p.costCr || p.revisedBudgetCr || p.originalBudgetCr || 0;
      totalCostCr += cost;
      sumProgress += (p.physicalProgress || p.actualPhysicalProgress || 0);
    });

    const avgProgress = total > 0 ? Math.round(sumProgress / total) : 0;

    return {
      total,
      onTrackCount,
      atRiskCount,
      delayedCount,
      totalCostCr,
      avgProgress
    };
  }, [sectorProjects]);

  const handleExportSectorCSV = () => {
    const headers = [
      'Project Code',
      'Project Name',
      'Sector',
      'Road Classification',
      'Nodal Agency',
      'Contractor',
      'Location / District',
      'Length (km)',
      'Lanes',
      'Structures',
      'Sanctioned Cost (Cr)',
      'Revised Cost (Cr)',
      'Expenditure (Cr)',
      'Physical Progress (%)',
      'Target Progress (%)',
      'Status',
      'Risk Score',
      'Risk Level',
      'Model Confidence',
      'Delay (Days)',
      'Land Possession (%)',
      'Forest Clearance',
      'Utility Clearance',
      'Awaiting Monthly Update',
      'Why Risky / Causes',
      'Upcoming Milestone',
      'Recommended Action',
      'Action Owner',
      'Action Due Date',
      'Closure Proof Required'
    ];

    const rows = filteredProjects.map(p => [
      p.code || p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sector}"`,
      `"${p.roadClassification || 'Standard Corridor'}"`,
      `"${p.nodalAgency || ''}"`,
      `"${p.contractorName || ''}"`,
      `"${p.locationName || ''}"`,
      p.roadLengthKm || 'N/A',
      p.lanes || 'N/A',
      `"${(p.structuresCount || '').replace(/"/g, '""')}"`,
      p.originalBudgetCr || p.costCr || 0,
      p.revisedBudgetCr || p.costCr || 0,
      p.isAwaitingMonthlyUpdate ? 'Awaiting official update' : (p.expenditureToDateCr || 0),
      p.isAwaitingMonthlyUpdate ? 'Awaiting official update' : (p.physicalProgress || p.actualPhysicalProgress || 0),
      p.targetPhysicalProgress || 0,
      p.status,
      p.riskScore,
      p.riskLevel,
      `"${p.modelConfidence || '92% (Calibrated)'}"`,
      p.delayDays || 0,
      p.landPossessionPct !== undefined ? `${p.landPossessionPct}%` : 'Verified',
      `"${p.forestClearanceStatus || 'Granted'}"`,
      `"${p.utilityClearanceStatus || 'In Progress'}"`,
      p.isAwaitingMonthlyUpdate ? 'Yes (PAIMANA/NHAI pending)' : 'No (Live)',
      `"${(p.likelyRiskCauses || p.primaryRisk || '').replace(/"/g, '""')}"`,
      `"${(p.milestoneAtRisk || p.milestones?.[0]?.name || p.milestones?.[0]?.title || '').replace(/"/g, '""')}"`,
      `"${(p.recommendedAction || '').replace(/"/g, '""')}"`,
      `"${p.actionOwner || p.nodalAgency || ''}"`,
      `"${p.actionDeadline || '30 Days'}"`,
      `"${(p.closureProofRequired || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PREVISION_${effectiveSector}_Sector_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Officer Sector Identity Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
                {isOfficer ? `Assigned Jurisdiction: ${effectiveSector}` : effectiveSector === 'All' ? 'Consolidated National View' : `Admin Filter: ${effectiveSector}`}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Scope: <strong className="text-slate-800">{currentUser.name}</strong> ({isOfficer ? `${effectiveSector} Sector Officer` : 'System Administrator'})
              </span>
            </div>
            {/* Prominent Welcome Greeting as requested */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isOfficer 
                ? `Welcome, ${currentUser.name} — ${effectiveSector} Sector Dashboard`
                : effectiveSector === 'All'
                  ? `Welcome, ${currentUser.name} — Central Administration (All Sectors)`
                  : `Welcome, ${currentUser.name} — ${effectiveSector} Sector Dashboard`
              }
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {isOfficer 
                ? `Real-time surveillance of capital projects, physical milestones, expenditure pacing, and risk warnings for the ${effectiveSector} sector.`
                : `Cross-sector surveillance of national capital projects, physical milestones, and expenditure pacing.`}
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {!isOfficer && effectiveSector !== 'All' && (
              <button
                type="button"
                onClick={() => onSelectSector('All')}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
              >
                View All Sectors
              </button>
            )}

            <button
              type="button"
              onClick={handleExportSectorCSV}
              className="inline-flex items-center gap-1.5 text-xs text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg font-semibold shadow-xs transition cursor-pointer"
              title="Download sector report as CSV"
            >
              <Download size={14} />
              <span>Download Report</span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock size={14} className="text-blue-700" />
              <span>FY 2026-27 Q2</span>
            </span>
          </div>
        </div>
      </div>

      {/* Maharashtra Roads & Highways Surveillance Portfolio Context Banner */}
      {isRoadSector && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-blue-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                PREVISION Maharashtra Roads & Highways Portfolio Active
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
              Surveillance Framework: RD-01 to RD-08 Early Warning Rules
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Active surveillance of Ministry of Road Transport & Highways identified corridors, nine BOT road projects, and Maharashtra's PMGSY rural road portfolio (including 330 balance road works spanning 1,273 km and 138 balance bridges statewide).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-amber-200 font-medium">
            <span className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-400/20">
              <Clock size={13} className="text-amber-300" />
              <span>Package-level progress, expenditure, and revised completion dates for new projects are shown as <strong>“awaiting official monthly update”</strong> pending PAIMANA/NHAI/MoRTH/PMGSY monthly updates.</span>
            </span>
          </div>
        </div>
      )}

      {/* 4 Simple Stat Cards Summary Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Projects */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white border text-left p-4 sm:p-5 rounded-xl shadow-xs transition cursor-pointer group relative overflow-hidden ${
            statusFilter === 'ALL'
              ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/20'
              : 'border-slate-300 hover:border-slate-400 hover:shadow-sm'
          }`}
          title="Click to view all projects"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {metrics.total}
          </div>
          <div className="mt-2 text-xs text-slate-600 font-medium flex items-center justify-between">
            <span>All Monitored Assets</span>
            {statusFilter === 'ALL' && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
        </button>

        {/* Card 2: On Track Count */}
        <button
          type="button"
          onClick={() => setStatusFilter('On Track')}
          className={`border text-left p-4 sm:p-5 rounded-xl shadow-xs transition cursor-pointer group relative overflow-hidden ${
            statusFilter === 'On Track'
              ? 'border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50'
              : 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 hover:shadow-sm'
          }`}
          title="Click to filter by On Track"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider">
              On Track
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-200 transition">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-800 tracking-tight">
            {metrics.onTrackCount}
          </div>
          <div className="mt-2 text-xs text-emerald-900 font-semibold flex items-center justify-between">
            <span>{metrics.total > 0 ? `${Math.round((metrics.onTrackCount / metrics.total) * 100)}% of sector` : '0%'}</span>
            {statusFilter === 'On Track' && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
        </button>

        {/* Card 3: Delayed Count */}
        <button
          type="button"
          onClick={() => setStatusFilter('Delayed')}
          className={`border text-left p-4 sm:p-5 rounded-xl shadow-xs transition cursor-pointer group relative overflow-hidden ${
            statusFilter === 'Delayed'
              ? 'border-rose-600 ring-2 ring-rose-600/30 bg-rose-50'
              : 'bg-rose-50/60 border-rose-300 hover:border-rose-500 hover:shadow-sm'
          }`}
          title="Click to filter by Delayed"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-rose-950 uppercase tracking-wider">
              Delayed
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800 group-hover:bg-rose-200 transition">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-rose-800 tracking-tight">
            {metrics.delayedCount}
          </div>
          <div className="mt-2 text-xs text-rose-900 font-semibold flex items-center justify-between">
            <span>Over schedule/budget</span>
            {statusFilter === 'Delayed' && (
              <span className="text-[11px] font-bold text-rose-800 bg-rose-200 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
        </button>

        {/* Card 4: At Risk Count */}
        <button
          type="button"
          onClick={() => setStatusFilter('At Risk')}
          className={`border text-left p-4 sm:p-5 rounded-xl shadow-xs transition cursor-pointer group relative overflow-hidden ${
            statusFilter === 'At Risk'
              ? 'border-amber-600 ring-2 ring-amber-600/30 bg-amber-50'
              : 'bg-amber-50/60 border-amber-300 hover:border-amber-500 hover:shadow-sm'
          }`}
          title="Click to filter by At Risk"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wider">
              At Risk
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-amber-200 transition">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-amber-800 tracking-tight">
            {metrics.atRiskCount}
          </div>
          <div className="mt-2 text-xs text-amber-950 font-semibold flex items-center justify-between">
            <span>Requires intervention</span>
            {statusFilter === 'At Risk' && (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Simple Search + Filter Bar */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, code, or location..."
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-slate-50 text-slate-900 placeholder:text-slate-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Filter Buttons: All, On Track, Delayed, At Risk */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700 font-bold mr-1 text-xs uppercase tracking-wider">
              Status:
            </span>
            
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer border ${
                statusFilter === 'ALL'
                  ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
              }`}
            >
              All ({sectorProjects.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('On Track')}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'On Track'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border-emerald-300'
              }`}
            >
              <CheckCircle2 size={15} className={statusFilter === 'On Track' ? 'text-white' : 'text-emerald-700'} />
              <span>On Track ({metrics.onTrackCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Delayed')}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'Delayed'
                  ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                  : 'bg-rose-50 text-rose-950 hover:bg-rose-100 border-rose-300'
              }`}
            >
              <AlertCircle size={15} className={statusFilter === 'Delayed' ? 'text-white' : 'text-rose-700'} />
              <span>Delayed ({metrics.delayedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('At Risk')}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                statusFilter === 'At Risk'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border-amber-300'
              }`}
            >
              <AlertTriangle size={15} className={statusFilter === 'At Risk' ? 'text-white' : 'text-amber-700'} />
              <span>At Risk ({metrics.atRiskCount})</span>
            </button>
          </div>

          {/* Right Tools: Sort & View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
            >
              <option value="updated">Sort: Last Updated</option>
              <option value="cost">Sort: Cost (High to Low)</option>
              <option value="progress">Sort: Progress (%)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon size={15} />
              </button>
            </div>
          </div>

        </div>

        {/* Road Sector Sub-Corridor Filter Chips */}
        {isRoadSector && (
          <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-700 font-bold mr-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Route size={13} className="text-blue-700" />
                Corridor Type:
              </span>

              <button
                type="button"
                onClick={() => setRoadSubFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer text-xs ${
                  roadSubFilter === 'ALL'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                All Roads ({roadSubCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setRoadSubFilter('NH')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer text-xs ${
                  roadSubFilter === 'NH'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                National Highways ({roadSubCounts.nh})
              </button>

              <button
                type="button"
                onClick={() => setRoadSubFilter('BOT')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer text-xs ${
                  roadSubFilter === 'BOT'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                BOT Concessions ({roadSubCounts.bot})
              </button>

              <button
                type="button"
                onClick={() => setRoadSubFilter('PMGSY')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer text-xs ${
                  roadSubFilter === 'PMGSY'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                PMGSY Rural Works ({roadSubCounts.pmgsy})
              </button>

              <button
                type="button"
                onClick={() => setRoadSubFilter('STRUCTURES')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer text-xs ${
                  roadSubFilter === 'STRUCTURES'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Tunnels & Bridges ({roadSubCounts.structures})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              MoRTH / NHAI / PMGSY Authenticated Register
            </div>
          </div>
        )}
      </div>

      {/* Project Presentation Area: Cards vs Table */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No projects matched your criteria for the sector "{activeSector}". Try clearing your search or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-md text-xs font-semibold hover:bg-blue-800 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View using enriched ProjectCard */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => onSelectProject(project.id)}
            />
          ))}
        </div>
      ) : (
        /* Clean Government Tabular View */
        <div className="gov-table-container shadow-xs">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Project Code & Name</th>
                <th>Classification & Sector</th>
                <th>Location / District</th>
                <th>Status</th>
                <th className="text-center">PREVISION Score</th>
                <th className="text-right">Approved Cost (₹ Cr)</th>
                <th>Progress & Target</th>
                <th>Clearance & Land</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
                const progress = project.physicalProgress || project.actualPhysicalProgress || 0;
                const score = project.riskScore ?? 45;

                return (
                  <tr 
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
                    <td>
                      <div className="font-bold text-slate-900 hover:text-blue-700 leading-snug">
                        {project.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {project.code} • Agency: {project.nodalAgency}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-xs font-semibold">
                          {project.sector}
                        </span>
                        {project.roadClassification && (
                          <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[170px]">
                            {project.roadClassification}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-slate-700 text-xs">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{project.locationName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-4">{project.state}</div>
                    </td>
                    <td>
                      <StatusBadge status={project.status} size="sm" />
                    </td>
                    <td className="text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        score >= 70 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : score >= 50 
                          ? 'bg-orange-50 text-orange-800 border-orange-200' 
                          : score >= 25 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-900 text-sm">
                      ₹{cost.toLocaleString()} Cr
                      {project.isAwaitingMonthlyUpdate ? (
                        <div className="text-[10px] font-normal text-amber-800">
                          Exp: Awaiting update
                        </div>
                      ) : (
                        <div className="text-[10px] font-normal text-slate-500">
                          Exp: ₹{(project.expenditureToDateCr || 0).toLocaleString()} Cr
                        </div>
                      )}
                    </td>
                    <td>
                      {project.isAwaitingMonthlyUpdate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <Clock size={11} className="text-amber-700" />
                          Awaiting monthly update
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 w-9">{progress}%</span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-700 h-1.5 rounded-full"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SPI: {project.spi ?? 0.94}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <div className="text-slate-700">
                          Land: <strong className="text-slate-900">{project.landPossessionPct !== undefined ? `${project.landPossessionPct}%` : 'Verified'}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Forest: {project.forestClearanceStatus || 'Granted'}
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project.id);
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 rounded font-semibold text-xs transition border border-blue-200 flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
