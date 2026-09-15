import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Building2, 
  Eye, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronRight
} from 'lucide-react';
import type { Project, ProjectSector, User } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ProjectCard } from './ProjectCard';
import { matchSector } from '../../data/userStore';

interface AllProjectsViewProps {
  projects: Project[];
  sectors: ProjectSector[];
  currentUser?: User;
  onSelectProject: (projectId: string) => void;
}

export const AllProjectsView: React.FC<AllProjectsViewProps> = ({
  projects,
  sectors,
  currentUser,
  onSelectProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'cost' | 'updated' | 'progress'>('cost');

  const isOfficer = currentUser && currentUser.role !== 'admin';
  const officerSector = currentUser?.sector || currentUser?.assignedSectors?.[0] || 'Railways';

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // If officer, lock strictly to their sector
      if (isOfficer) {
        if (!matchSector(p.sector, officerSector as string)) return false;
      } else if (selectedSector !== 'ALL') {
        if (!matchSector(p.sector, selectedSector)) return false;
      }

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.state && p.state.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'On Track') matchesStatus = p.status === 'On Track' || p.status === 'Completed';
        else if (selectedStatus === 'At Risk') matchesStatus = p.status === 'At Risk';
        else if (selectedStatus === 'Delayed') matchesStatus = p.status === 'Delayed' || p.status === 'Critical Overrun';
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
  }, [projects, searchQuery, selectedSector, selectedStatus, sortBy, isOfficer, officerSector]);

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
            {isOfficer ? `${officerSector} Directory` : 'Central Directory'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {isOfficer ? `${officerSector} Capital Projects` : 'All National Capital Infrastructure Projects'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isOfficer 
              ? `Authorized directory of capital works under surveillance within the ${officerSector} jurisdiction.` 
              : 'Comprehensive repository of multi-sector public works under surveillance across all states & Union Territories.'}
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
          Displaying: <strong className="text-slate-900">{filteredProjects.length}</strong> {isOfficer ? `${officerSector} Projects` : `of ${projects.length} Total Projects`}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or state..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>

          {/* Sector Select - ONLY shown to Admin */}
          {!isOfficer ? (
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer font-medium"
              >
                <option value="ALL">All Sectors ({projects.length})</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center px-3 py-2 text-xs bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-semibold">
              <Building2 size={14} className="text-blue-700 mr-2 shrink-0" />
              <span className="truncate">Sector: {officerSector} (Locked)</span>
            </div>
          )}

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer font-medium"
            >
              <option value="ALL">All Health Statuses</option>
              <option value="On Track">On Track (Green)</option>
              <option value="At Risk">At Risk (Yellow)</option>
              <option value="Delayed">Delayed (Red)</option>
            </select>
          </div>

          {/* Sort & Toggle */}
          <div className="flex items-center justify-between gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer"
            >
              <option value="cost">Cost (High to Low)</option>
              <option value="updated">Last Updated</option>
              <option value="progress">Physical Progress</option>
            </select>

            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <TableIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500'
                }`}
                title="Cards View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Presentation */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Projects Found</h4>
          <p className="text-xs text-slate-500 mt-1">Adjust your search or filter parameters to view results.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="gov-table-container shadow-xs">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Project Name</th>
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
              {filteredProjects.map((p) => {
                const cost = p.costCr || p.revisedBudgetCr || p.originalBudgetCr || 0;
                const progress = p.physicalProgress || p.actualPhysicalProgress || 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
                    <td>
                      <div className="font-bold text-slate-900 hover:text-blue-700">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.code}</div>
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {p.sector}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-slate-700 text-xs">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{p.locationName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-4">{p.state}</div>
                    </td>
                    <td>
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="text-right font-bold text-slate-900 text-sm">
                      ₹{cost.toLocaleString()} Cr
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{p.lastUpdated || '12 Sep 2026'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 w-8">{progress}%</span>
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
                          onSelectProject(p.id);
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-xs transition border border-blue-200 flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onSelect={() => onSelectProject(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
