import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';
import type { Project, ProjectSector, User } from '../../types';
import { StatusBadge } from './StatusBadge';
import { matchSector } from '../../data/userStore';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'updated' | 'cost' | 'progress'>('updated');

  const isOfficer = currentUser.role !== 'admin';
  const officerSector = currentUser.sector || currentUser.assignedSectors?.[0] || 'Railways';
  const effectiveSector = isOfficer ? officerSector : activeSector;

  // Filter projects strictly by effectiveSector (Officers only ever see their sector's projects)
  const sectorProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!isOfficer && effectiveSector === 'All') return true;
      return matchSector(p.sector, effectiveSector as string);
    });
  }, [projects, effectiveSector, isOfficer]);

  // Apply search and status filter
  const filteredProjects = useMemo(() => {
    return sectorProjects.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.state && p.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.district && p.district.toLowerCase().includes(searchQuery.toLowerCase()));

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

      return matchesSearch && matchesStatus;
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
  }, [sectorProjects, searchQuery, statusFilter, sortBy]);

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

          <div className="shrink-0 flex items-center gap-2">
            {!isOfficer && effectiveSector !== 'All' && (
              <button
                type="button"
                onClick={() => onSelectSector('All')}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
              >
                View All Sectors
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock size={14} className="text-blue-700" />
              <span>Monitoring Cycle: <strong>FY 2026-27 Q2</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Summary Strip (Total, On Track [Green], At Risk [Yellow], Delayed [Red], Total Cost, Avg Progress) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">{metrics.total}</div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <Layers size={12} className="text-blue-600" />
            <span>Monitored assets</span>
          </div>
        </div>

        {/* On Track (Green) */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>On Track</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-700">{metrics.onTrackCount}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            {metrics.total > 0 ? `${Math.round((metrics.onTrackCount / metrics.total) * 100)}% of sector` : '0%'}
          </div>
        </div>

        {/* At Risk (Yellow/Amber) */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>At Risk</span>
            <AlertTriangle size={15} className="text-amber-600" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-amber-700">{metrics.atRiskCount}</div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            Requires intervention
          </div>
        </div>

        {/* Delayed (Red) */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Delayed</span>
            <AlertCircle size={15} className="text-rose-600" />
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-rose-700">{metrics.delayedCount}</div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">
            Over schedule/budget
          </div>
        </div>

        {/* Total Cost in ₹ Crores */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sector Budget</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-blue-900 truncate" title={`₹${metrics.totalCostCr.toLocaleString()} Cr`}>
            ₹{metrics.totalCostCr.toLocaleString()} <span className="text-xs text-slate-500 font-normal">Cr</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Sanctioned Outlay</div>
        </div>

        {/* Average Progress */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Progress</div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">{metrics.avgProgress}%</div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full" 
              style={{ width: `${metrics.avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter Pills, Sort & View Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, code, state, or district..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1 text-[11px]">Filter:</span>
            
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({sectorProjects.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('On Track')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'On Track'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>On Track ({metrics.onTrackCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('At Risk')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'At Risk'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <AlertTriangle size={13} />
              <span>At Risk ({metrics.atRiskCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Delayed')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'Delayed'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle size={13} />
              <span>Delayed ({metrics.delayedCount})</span>
            </button>
          </div>

          {/* Right Tools: Sort & View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
            const progress = project.physicalProgress || project.actualPhysicalProgress || 0;
            const target = project.targetPhysicalProgress || 100;
            const coverImage = project.images?.[0]?.url || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="gov-card flex flex-col justify-between overflow-hidden cursor-pointer transition hover:border-blue-300 hover:shadow-md group"
              >
                {/* Project Image Header with Status Tag */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* Status Badge in Top Right */}
                  <div className="absolute top-3 right-3 shadow-xs">
                    <StatusBadge status={project.status} size="sm" />
                  </div>

                  {/* Sector Tag in Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded bg-blue-900/90 text-white text-[11px] font-bold tracking-wide backdrop-blur-xs border border-white/20">
                      {project.sector}
                    </span>
                  </div>

                  {/* Bottom Image Info: Code & District */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-[11px] font-mono text-blue-200">{project.code}</div>
                    <div className="text-xs font-semibold flex items-center gap-1 text-slate-100">
                      <MapPin size={12} className="text-amber-400 shrink-0" />
                      <span className="truncate">{project.locationName}</span>
                    </div>
                  </div>
                </div>

                {/* Project Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Project Name */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                      {project.name}
                    </h3>
                    
                    {/* Key Attributes Summary */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Sanctioned Cost</span>
                        <strong className="text-sm text-slate-900 font-bold">
                          ₹{cost.toLocaleString()} Cr
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Last Updated</span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{project.lastUpdated || '12 Sep 2026'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Details Footer */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Physical Progress</span>
                        <span className="font-bold text-slate-900">
                          {progress}% <span className="text-slate-400 text-[10px]">/ target {target}%</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            progress < target - 15
                              ? 'bg-rose-600'
                              : progress < target - 5
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500">Agency: {project.nodalAgency}</span>
                      <span className="font-bold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition text-xs">
                        <span>Inspect Project</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Government Tabular View */
        <div className="gov-table-container shadow-xs">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Project Code & Name</th>
                <th>Sector</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-right">Cost (₹ Cr)</th>
                <th>Last Updated</th>
                <th>Progress</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
                const progress = project.physicalProgress || project.actualPhysicalProgress || 0;

                return (
                  <tr 
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
                    <td>
                      <div className="font-bold text-slate-900 hover:text-blue-700">
                        {project.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {project.code} • Agency: {project.nodalAgency}
                      </div>
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {project.sector}
                      </span>
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
                    <td className="text-right font-bold text-slate-900 text-sm">
                      ₹{cost.toLocaleString()} Cr
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{project.lastUpdated || '12 Sep 2026'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 w-9">{progress}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-700 h-1.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
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
                        <span>Details</span>
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
