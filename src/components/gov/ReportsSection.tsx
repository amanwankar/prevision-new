import React, { useState, useMemo } from 'react';
import type { Project, ProjectSector, User } from '../../types';
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  Camera, 
  Search,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ReportsSectionProps {
  projects: Project[];
  currentUser: User | null;
  activeSector: ProjectSector | 'All';
  onSelectProject?: (projectId: string) => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  projects,
  currentUser,
  activeSector,
  onSelectProject
}) => {
  // Filter projects by active sector or search term
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects[0]?.id || '';
  });
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Filter projects according to user sector permissions and search
  const visibleProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSector = activeSector === 'All' || p.sector === activeSector;
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nodalAgency?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [projects, activeSector, searchTerm]);

  // Active project for the dossier view
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || visibleProjects[0] || projects[0];
  }, [projects, selectedProjectId, visibleProjects]);

  // Generate and trigger CSV download for single project
  const handleDownloadProjectCSV = (project: Project) => {
    const headers = [
      'Project ID',
      'Project Code',
      'Project Name',
      'Sector',
      'Department',
      'Nodal Agency',
      'Contractor',
      'Location',
      'State',
      'District',
      'Original Budget (Cr)',
      'Revised Budget (Cr)',
      'Expenditure to Date (Cr)',
      'Target Progress (%)',
      'Actual Progress (%)',
      'Financial Progress (%)',
      'Status',
      'Risk Score (0-100)',
      'Risk Level',
      'Primary Risk Driver',
      'Delay (Days)',
      'Cost Overrun Forecast (Cr)',
      'Stage',
      'Known Details',
      'Likely Risk Causes (Explain Cause)',
      'Early Warning',
      'Recommended Action'
    ];

    const row = [
      project.id,
      project.code || '',
      `"${(project.name || '').replace(/"/g, '""')}"`,
      `"${project.sector}"`,
      `"${project.department || ''}"`,
      `"${project.nodalAgency || ''}"`,
      `"${project.contractorName || ''}"`,
      `"${project.locationName || project.location_name || ''}"`,
      `"${project.state || ''}"`,
      `"${project.district || ''}"`,
      project.originalBudgetCr || 0,
      project.revisedBudgetCr || project.costCr || 0,
      project.expenditureToDateCr || 0,
      project.targetPhysicalProgress || 0,
      project.actualPhysicalProgress || project.physicalProgress || 0,
      project.financialDisbursementPercentage || 0,
      project.status,
      project.riskScore,
      project.riskLevel,
      `"${(project.primaryRisk || '').replace(/"/g, '""')}"`,
      project.delayDays || 0,
      project.costOverrunForecastCr || 0,
      `"${(project.stage || '').replace(/"/g, '""')}"`,
      `"${(project.knownDetails || '').replace(/"/g, '""')}"`,
      `"${(project.likelyRiskCauses || '').replace(/"/g, '""')}"`,
      `"${(project.earlyWarning || '').replace(/"/g, '""')}"`,
      `"${(project.recommendedAction || '').replace(/"/g, '""')}"`
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PREVISION_Report_${project.code || project.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Downloaded CSV Report for ${project.name}`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Generate and trigger CSV download for ALL visible projects
  const handleDownloadAllProjectsCSV = () => {
    const headers = [
      'Project ID',
      'Project Code',
      'Project Name',
      'Sector',
      'Nodal Agency',
      'Contractor',
      'Location',
      'Budget Cr',
      'Target Progress %',
      'Actual Progress %',
      'Status',
      'Risk Score',
      'Risk Level',
      'Primary Risk',
      'Delay Days',
      'Cost Overrun Cr',
      'Stage',
      'Likely Causes',
      'Early Warning',
      'Recommended Action'
    ];

    const rows = visibleProjects.map(p => [
      p.id,
      p.code || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sector}"`,
      `"${p.nodalAgency || ''}"`,
      `"${p.contractorName || ''}"`,
      `"${p.locationName || p.location_name || ''}"`,
      p.revisedBudgetCr || p.costCr || 0,
      p.targetPhysicalProgress || 0,
      p.actualPhysicalProgress || p.physicalProgress || 0,
      p.status,
      p.riskScore,
      p.riskLevel,
      `"${(p.primaryRisk || '').replace(/"/g, '""')}"`,
      p.delayDays || 0,
      p.costOverrunForecastCr || 0,
      `"${(p.stage || '').replace(/"/g, '""')}"`,
      `"${(p.likelyRiskCauses || '').replace(/"/g, '""')}"`,
      `"${(p.earlyWarning || '').replace(/"/g, '""')}"`,
      `"${(p.recommendedAction || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PREVISION_MultiSector_Consolidated_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Downloaded Consolidated CSV for ${visibleProjects.length} Projects`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Trigger browser print/PDF export
  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{downloadSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800 mb-1">
            <Sparkles size={14} className="text-blue-600" />
            <span>PREVISION Project Intelligence & Early Warning Reports</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Official Project Monitoring Dossiers & Export Center
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Download comprehensive audit reports encompassing verified field progress, PRAEVISIO 4-pillar risk explanations, early warning triggers, and dated recommended actions for all infrastructure assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadAllProjectsCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Download full multi-sector dataset as Excel/CSV"
          >
            <FileSpreadsheet size={15} />
            <span>Export All ({visibleProjects.length}) to CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Print or Save current report as PDF"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Selector & Quick Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Project ({visibleProjects.length})
              </span>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activeSector === 'All' ? 'All Sectors' : activeSector}
              </span>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by project name or agency..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Project List */}
            <div className="max-h-[560px] overflow-y-auto space-y-2 pr-1">
              {visibleProjects.map((p) => {
                const isSelected = p.id === currentProject?.id;
                const riskColor = 
                  p.riskLevel === 'Critical' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                  p.riskLevel === 'High' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                  'text-emerald-700 bg-emerald-50 border-emerald-200';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-semibold text-slate-500">
                          {p.code || p.id}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-600 truncate">
                          {p.sector}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                        <span>Prog: <strong className="text-slate-900">{p.actualPhysicalProgress || p.physicalProgress || 0}%</strong></span>
                        <span>Cost: <strong className="text-slate-900">₹{p.revisedBudgetCr || p.costCr} Cr</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${riskColor}`}>
                        {p.riskScore}/100
                      </span>
                      <div className="mt-2 text-[10px] text-slate-500">
                        {p.status}
                      </div>
                    </div>
                  </button>
                );
              })}

              {visibleProjects.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No projects match your search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Quick Dossier Actions */}
          {currentProject && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Active Dossier
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                  {currentProject.code || currentProject.id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 line-clamp-2">
                {currentProject.name}
              </h3>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadProjectCSV(currentProject)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintDossier}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md text-xs font-semibold transition cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Dossier</span>
                  </button>
                </div>

                {onSelectProject && (
                  <button
                    type="button"
                    onClick={() => onSelectProject(currentProject.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 rounded-md text-xs font-medium transition cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    <span>Open Interactive Project Detail</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Comprehensive Official Project Report (8 cols) */}
        <div className="lg:col-span-8">
          {currentProject ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden printable-report">
              {/* Dossier Top Banner */}
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded">
                      PREVISION DOSSIER
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {currentProject.code || currentProject.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Calendar size={13} />
                    <span>Report Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight leading-snug">
                  {currentProject.name}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Sector</div>
                    <div className="font-semibold text-slate-200 truncate">{currentProject.sector}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Nodal Agency</div>
                    <div className="font-semibold text-slate-200 truncate">{currentProject.nodalAgency || 'State Department'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Location</div>
                    <div className="font-semibold text-slate-200 truncate">{currentProject.locationName || currentProject.location_name || currentProject.state}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Contractor / Executing Agency</div>
                    <div className="font-semibold text-slate-200 truncate">{currentProject.contractorName || 'Under Tender / EPC JV'}</div>
                  </div>
                </div>
              </div>

              {/* Dossier Body */}
              <div className="p-6 space-y-6">
                {/* 1. Official Register Status & Stage */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-blue-700" />
                      <span>Official Register Details & Delivery Stage</span>
                    </h4>
                    {currentProject.stage && (
                      <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                        Stage: {currentProject.stage}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {currentProject.knownDetails || 'Project recorded in the official multi-sector monitoring database. Physical construction, geotechnical investigation, and milestone execution progressing under continuous field surveillance.'}
                  </p>
                </div>

                {/* 2. Key Progress & Financial Health Metrics */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Progress & Budgetary Execution Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[11px] text-slate-500 font-medium">Original Budget</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        ₹{currentProject.originalBudgetCr?.toLocaleString() || currentProject.costCr} Cr
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[11px] text-slate-500 font-medium">Revised / Approved</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        ₹{currentProject.revisedBudgetCr?.toLocaleString() || currentProject.costCr} Cr
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[11px] text-slate-500 font-medium">Actual Physical Progress</div>
                      <div className="text-base font-bold text-emerald-700 mt-0.5">
                        {currentProject.actualPhysicalProgress || currentProject.physicalProgress || 0}%
                      </div>
                      <div className="text-[10px] text-slate-400">Target: {currentProject.targetPhysicalProgress || 0}%</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[11px] text-slate-500 font-medium">Financial Disbursement</div>
                      <div className="text-base font-bold text-blue-700 mt-0.5">
                        {currentProject.financialDisbursementPercentage || 0}%
                      </div>
                      <div className="text-[10px] text-slate-400">₹{currentProject.expenditureToDateCr?.toLocaleString() || 0} Cr paid</div>
                    </div>
                  </div>
                </div>

                {/* 3. The PREVISION 4-Pillar Analysis Framework */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-slate-700" />
                      <span>PRAEVISIO 4-Pillar Decision Framework</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-600">
                      Predict • Explain • Warn • Recommend
                    </span>
                  </div>

                  <div className="p-4 space-y-4 divide-y divide-slate-100">
                    {/* Pillar 1: Predict Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-3">
                        <span className="text-xs font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          1. Predict Risk
                        </span>
                      </div>
                      <div className="md:col-span-9 text-xs text-slate-700 space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span>Risk Score: <strong className="text-slate-900">{currentProject.riskScore}/100</strong> ({currentProject.riskLevel} Risk)</span>
                          <span>•</span>
                          <span>Schedule Slippage: <strong className="text-slate-900">{currentProject.delayDays || 0} days</strong></span>
                          <span>•</span>
                          <span>Cost Overrun Forecast: <strong className="text-slate-900">₹{currentProject.costOverrunForecastCr || 0} Cr</strong></span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Target Finish: {currentProject.revisedTargetDate || currentProject.originalTargetDate} | AI Estimated Completion: {currentProject.aiPredictedDate || 'Under Computation'}
                        </div>
                      </div>
                    </div>

                    {/* Pillar 2: Explain Cause */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-3">
                      <div className="md:col-span-3">
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          2. Explain Cause
                        </span>
                      </div>
                      <div className="md:col-span-9 text-xs text-slate-700 leading-relaxed">
                        <p className="font-semibold text-slate-900 mb-0.5">
                          {currentProject.primaryRisk || 'Multi-factor execution constraints'}
                        </p>
                        <p className="text-slate-600">
                          {currentProject.likelyRiskCauses || 'Constraints identified from geological borings, municipal utility diversions, environmental approvals, and multi-agency alignment clearances.'}
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3: Early Warning */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-3">
                      <div className="md:col-span-3">
                        <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                          3. Early Warning
                        </span>
                      </div>
                      <div className="md:col-span-9 text-xs text-slate-700 leading-relaxed">
                        <p className="text-indigo-950 font-medium bg-indigo-50/80 p-2.5 rounded border border-indigo-200">
                          {currentProject.earlyWarning || 'Automated warning active: continuous tracking of milestone variance, contractor equipment mobilization, and pending inter-departmental clearances.'}
                        </p>
                      </div>
                    </div>

                    {/* Pillar 4: Recommended Action */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-3">
                      <div className="md:col-span-3">
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          4. Action Plan
                        </span>
                      </div>
                      <div className="md:col-span-9 text-xs text-slate-700 leading-relaxed">
                        <p className="text-emerald-950 font-medium bg-emerald-50/80 p-2.5 rounded border border-emerald-200">
                          {currentProject.recommendedAction || 'Convene weekly critical-path review with executing agency; establish dated utility dependency log; conduct independent physical audit.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Verified Field Inspection Images */}
                {Array.isArray(currentProject.images) && currentProject.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Camera size={14} className="text-slate-700" />
                      <span>Verified Field Inspection Visuals</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentProject.images.map((img) => (
                        <div key={img.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <div className="relative aspect-video bg-slate-200 overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.caption}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                              {img.verificationStatus || 'Verified'}
                            </div>
                          </div>
                          <div className="p-3 text-xs space-y-1">
                            <div className="font-semibold text-slate-900">{img.caption}</div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Date: {img.dateCaptured || img.date}</span>
                              <span>Source: {img.source || 'Field Verified'}</span>
                            </div>
                            {img.notes && (
                              <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 mt-1">
                                {img.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Key Milestones Table */}
                {Array.isArray(currentProject.milestones) && currentProject.milestones.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-700" />
                      <span>Critical Path Milestones Schedule</span>
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Milestone Description</th>
                            <th className="p-2.5">Planned End</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5 text-right">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {currentProject.milestones.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-medium text-slate-900">{m.name}</td>
                              <td className="p-2.5 text-slate-600">{m.plannedEndDate}</td>
                              <td className="p-2.5">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                  m.status === 'Delayed' ? 'bg-rose-100 text-rose-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-800">{m.progressPercentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Official Sign-Off Footer */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 gap-3">
                  <div>
                    Generated via PREVISION National Infrastructure Monitoring Platform
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Officer: <strong>{currentUser?.name || 'Authorized Inspector'}</strong></span>
                    <span>•</span>
                    <span>Designation: <strong>{currentUser?.designation || 'Sector Monitoring Officer'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Select a project from the left panel to generate its official dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
