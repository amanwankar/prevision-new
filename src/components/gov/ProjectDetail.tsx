import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  Send, 
  X, 
  Layers, 
  ShieldAlert, 
  FileText,
  FileCheck,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Network,
  CheckSquare,
  Droplets,
  Plane,
  Anchor,
  Zap,
  Train,
  Compass,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import type { Project, ProjectStatus, ProjectImage } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ProjectMap } from './ProjectMap';
import { ProjectImageGallery } from './ProjectImageGallery';
import { PredictiveIntelligencePanel } from './PredictiveIntelligencePanel';

type ReadinessChecklist = NonNullable<Project['readinessChecklist']>;
type ProgrammePackages = NonNullable<Project['programmePackages']>;

const DEFAULT_AIRPORT_CHECKLIST: ReadinessChecklist = [
  { id: 'RC-1', item: 'Runway Friction & Pavement Classification Number (PCN) calibration', category: 'Aerodrome', status: 'Completed', targetDate: '15-Mar-2026', responsibleAgency: 'DGCA / AAI', notes: 'Runway surface meets ICAO Annex 14 standards.' },
  { id: 'RC-2', item: 'Air Traffic Control (ATC) Tower Fit-out & CNS Radar trials', category: 'ATC & Navigation', status: 'Completed', targetDate: '30-Mar-2026', responsibleAgency: 'AAI', notes: 'DVOR and Instrument Landing System (ILS) Category IIIB flight calibration completed.' },
  { id: 'RC-3', item: 'Terminal 1 Passenger Baggage Handling & Security Screening', category: 'Terminal', status: 'In Progress', targetDate: '30-Apr-2026', responsibleAgency: 'BCAS / NMIAL', notes: 'In-line 5-level baggage screening system installation 85% finished.' },
  { id: 'RC-4', item: 'Operational Readiness and Airport Transfer (ORAT) volunteer trials', category: 'Commercial Trials', status: 'Pending Inspection', targetDate: '15-May-2026', responsibleAgency: 'NMIAL / Airlines', notes: 'Scheduled full-scale mock passenger processing flights.' },
  { id: 'RC-5', item: 'BCAS Final Aerodrome Security Clearance Certificate', category: 'Security', status: 'In Progress', targetDate: '30-May-2026', responsibleAgency: 'BCAS', notes: 'Perimeter intrusion detection system (PIDS) testing underway.' }
];

const DEFAULT_PORT_PACKAGES: ProgrammePackages = [
  { id: 'PKG-1', name: 'Offshore Breakwater & Land Reclamation (1,448 Ha)', category: 'Marine Works', progressPercentage: 30, completionTarget: '2028-12', contractor: 'International Dredging Consortium', status: 'In Progress' },
  { id: 'PKG-2', name: 'Approach Channel & Port Basin Deep Capital Dredging (20m depth)', category: 'Dredging', progressPercentage: 20, completionTarget: '2029-06', contractor: 'Capital Dredging Joint Venture', status: 'In Progress' },
  { id: 'PKG-3', name: 'Quay Wall & Container Berth Superstructures (Phase 1)', category: 'Berths', progressPercentage: 15, completionTarget: '2029-12', contractor: 'Marine Infrastructure EPC', status: 'In Progress' },
  { id: 'PKG-4', name: 'Dedicated Hinterland Rail Connectivity to Western DFC (32 km)', category: 'Rail Evacuation', progressPercentage: 18, completionTarget: '2029-03', contractor: 'DFCCIL / RVNL', status: 'Delayed' },
  { id: 'PKG-5', name: '8-Lane Dedicated Expressway Link to Delhi-Mumbai Expressway', category: 'Road Evacuation', progressPercentage: 25, completionTarget: '2029-01', contractor: 'NHAI / Package Concessionaire', status: 'In Progress' }
];

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus, note: string) => void;
  onAddImage?: (projectId: string, newImage: ProjectImage) => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateStatus,
  onAddImage,
  onSelectProject
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'readiness' | 'milestones' | 'audit'>('overview');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>(project.status);
  const [officerNote, setOfficerNote] = useState('');

  const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
  const expenditure = project.expenditureToDateCr || 0;
  const progress = project.physicalProgress || project.actualPhysicalProgress || 0;
  const targetProgress = project.targetPhysicalProgress || 100;
  const financialPct = cost > 0 ? Math.round((expenditure / cost) * 100) : 0;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStatus) {
      onUpdateStatus(project.id, newStatus, officerNote);
    }
    setIsUpdateModalOpen(false);
    setOfficerNote('');
  };

  const handleGalleryAddImage = (newImage: ProjectImage) => {
    if (onAddImage) {
      onAddImage(project.id, newImage);
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Project Code',
      'Project Name',
      'Sector',
      'Nodal Agency',
      'Contractor',
      'Location',
      'Sanctioned Cost (Cr)',
      'Expenditure (Cr)',
      'Physical Progress (%)',
      'Target Progress (%)',
      'Status',
      'Risk Score',
      'Risk Level',
      'Primary Risk Driver',
      'Delay (Days)',
      'Stage',
      'Known Details',
      'Likely Risk Causes',
      'Early Warning',
      'Recommended Action'
    ];

    const row = [
      project.code || project.id,
      `"${(project.name || '').replace(/"/g, '""')}"`,
      `"${project.sector}"`,
      `"${project.nodalAgency || ''}"`,
      `"${project.contractorName || ''}"`,
      `"${project.locationName || ''}"`,
      cost,
      expenditure,
      progress,
      targetProgress,
      project.status,
      project.riskScore,
      project.riskLevel,
      `"${(project.primaryRisk || '').replace(/"/g, '""')}"`,
      project.delayDays || 0,
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
    link.setAttribute('download', `PREVISION_${project.code || project.id}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Sector Dashboard</span>
        </button>

        <div className="text-xs text-slate-500">
          Project ID: <strong className="font-mono text-slate-800">{project.code}</strong>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-900 text-white text-xs font-bold tracking-wide">
                {project.sector}
              </span>
              <StatusBadge status={project.status} size="md" />
              <span className="text-xs text-slate-500 font-medium">
                Last Updated: <strong className="text-slate-800">{project.lastUpdated || '12 Sep 2026'}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-600" />
                <strong className="text-slate-900">{project.locationName}</strong>, {project.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-700" />
                <span>Agency: <strong>{project.nodalAgency}</strong></span>
              </span>
              <span>•</span>
              <span>Contractor: <strong>{project.contractorName}</strong></span>
            </div>
          </div>

          {/* Action Buttons: Download Report & Update Status */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition cursor-pointer"
              title="Download full project audit dossier as CSV"
            >
              <Download size={14} />
              <span>Download Report</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              title="Print project dossier to PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewStatus(project.status);
                setIsUpdateModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <FileCheck size={14} />
              <span>Update Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential Project Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cost / Sanctioned Outlay */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Sanctioned Cost
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            ₹{cost.toLocaleString()} <span className="text-xs text-slate-500 font-normal">Cr</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Expenditure: ₹{expenditure.toLocaleString()} Cr ({financialPct}%)
          </div>
        </div>

        {/* Physical Progress */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Physical Progress
            </span>
            <span className="text-xs font-bold text-blue-800">{progress}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                progress < targetProgress - 10 ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Target to date: {targetProgress}%
          </div>
        </div>

        {/* Schedule & Target Date */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Target Completion
          </span>
          <div className="mt-1 text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar size={16} className="text-blue-700" />
            <span>{project.revisedTargetDate || project.originalTargetDate}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Commenced: {project.startDate}
          </div>
        </div>

        {/* Health / Current Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Health Condition
          </span>
          <div className="my-1">
            <StatusBadge status={project.status} size="lg" />
          </div>
          <div className="text-[11px] text-slate-500">
            Primary Risk: {project.primaryRisk || 'None'}
          </div>
        </div>
      </div>

      {/* PREVISION Multi-Horizon ML Predictive Intelligence & EVM Deep-Dive */}
      <PredictiveIntelligencePanel project={project} />

      {/* 1. Real Interactive Project Map */}
      <ProjectMap project={project} />

      {/* 2. Project Images Section (Below the Map) */}
      <ProjectImageGallery
        images={project.images || []}
        projectLatitude={project.latitude ?? project.lat}
        projectLongitude={project.longitude ?? project.lng}
        projectName={project.name}
        onAddImage={handleGalleryAddImage}
        canUpload={true}
      />

      {/* 3. Detailed Project Administration & Execution Sub-Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 cursor-pointer transition ${
            activeTab === 'overview'
              ? 'border-blue-700 text-blue-800 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Contract Scope & Financials
        </button>

        {/* Tab 2: Sector Readiness & Commissioning / Dependencies */}
        {(project.readinessChecklist || project.programmePackages || project.crossSectorDependencies || project.headworksProgressPct !== undefined || project.generationCapacityMW !== undefined) && (
          <button
            type="button"
            onClick={() => setActiveTab('readiness')}
            className={`py-3 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
              activeTab === 'readiness'
                ? 'border-blue-700 text-blue-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare size={14} />
            <span>
              {project.sector === 'Civil Aviation / Airports'
                ? `Commissioning Readiness (${project.readinessChecklist?.length || 0})`
                : project.sector === 'Shipping & Ports'
                ? `Programme Packages (${project.programmePackages?.length || 0})`
                : project.sector === 'Power & Renewable Energy'
                ? `Grid Evacuation (${project.generationCapacityMW || 0} MW)`
                : project.sector === 'Water Resources / Bulk Water Supply'
                ? 'Headworks vs Canals'
                : 'Sector Readiness & Sync'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`py-3 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
            activeTab === 'milestones'
              ? 'border-blue-700 text-blue-800 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={14} />
          <span>Milestones Timeline ({project.milestones?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-3 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-blue-700 text-blue-800 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={14} />
          <span>Officer Audit & Compliance Trail ({project.auditTrail?.length || 0})</span>
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Executive Project Scope
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {project.name} is a high-priority national capital infrastructure initiative under the {project.sector} department. It connects crucial economic corridors across {project.locationName} in {project.state}. The project is managed by {project.nodalAgency} and executed by engineering contractor {project.contractorName}.
              </p>

              {/* Financial Progress Breakdown Table */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Budget & Financial Expenditure Breakdown</h4>
                <div className="gov-table-container">
                  <table className="gov-table text-xs">
                    <thead>
                      <tr>
                        <th>Financial Metric</th>
                        <th className="text-right">Amount (₹ Crores)</th>
                        <th>Status / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Original Sanctioned Budget</td>
                        <td className="text-right font-semibold">₹{project.originalBudgetCr.toLocaleString()} Cr</td>
                        <td className="text-slate-500">Approved by Cabinet Committee</td>
                      </tr>
                      <tr>
                        <td>Revised Sanctioned Budget</td>
                        <td className="text-right font-semibold">₹{(project.revisedBudgetCr || project.originalBudgetCr).toLocaleString()} Cr</td>
                        <td className="text-slate-500">Includes escalations and RoW adjustments</td>
                      </tr>
                      <tr>
                        <td>Cumulative Expenditure to Date</td>
                        <td className="text-right font-bold text-blue-700">₹{expenditure.toLocaleString()} Cr</td>
                        <td className="text-emerald-700 font-medium">Verified by Comptroller & Auditor</td>
                      </tr>
                      <tr>
                        <td>Balance Funds Remaining</td>
                        <td className="text-right font-bold text-slate-900">
                          ₹{(cost - expenditure).toLocaleString()} Cr
                        </td>
                        <td className="text-slate-500">{100 - financialPct}% remaining allocation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Cross-Sector Dependencies Matrix */}
            {project.crossSectorDependencies && project.crossSectorDependencies.length > 0 && (
              <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Network size={16} className="text-purple-700" />
                    <span>Cross-Sector Dependencies Matrix</span>
                  </h3>
                  <span className="text-xs font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                    {project.crossSectorDependencies.length} Inter-Department Linkages
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Critical infrastructure synchronisation points requiring coordinated inter-agency approvals, utility shifting, or joint commissioning.
                </p>

                <div className="space-y-2.5">
                  {project.crossSectorDependencies.map((dep, idx) => (
                    <div 
                      key={dep.id || idx} 
                      className={`p-3 rounded-lg border text-xs space-y-1.5 transition ${
                        dep.criticality === 'High' 
                          ? 'bg-rose-50/70 border-rose-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{dep.linkedProjectName}</span>
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                            {dep.linkedSector}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            dep.criticality === 'High' 
                              ? 'bg-rose-100 text-rose-800 border-rose-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {dep.criticality} Criticality
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            dep.status === 'Critical Bottleneck' || dep.status === 'Delayed'
                              ? 'bg-rose-600 text-white border-rose-700'
                              : dep.status === 'At Risk'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-700'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {dep.summary}
                      </p>

                      <div className="pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                        <span>
                          Type: <strong className="text-slate-800">{dep.dependencyType}</strong>
                        </span>
                        {dep.responsibleDepartment && (
                          <span>
                            Department: <strong className="text-slate-800">{dep.responsibleDepartment}</strong>
                          </span>
                        )}
                        {dep.targetResolutionDate && (
                          <span>
                            Target Resolution: <strong className="text-slate-800">{dep.targetResolutionDate}</strong>
                          </span>
                        )}
                        {onSelectProject && dep.linkedProjectId && (
                          <button
                            type="button"
                            onClick={() => onSelectProject(dep.linkedProjectId!)}
                            className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 ml-auto cursor-pointer"
                          >
                            <span>Inspect Linked Project</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sector Technical Specifications Dossier */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Compass size={15} className="text-blue-700" />
                <span>Sector Technical Specifications</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Civil Aviation Fields */}
                {project.runwayLengthMeters && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Runway Length</span>
                    <strong className="text-slate-900 text-sm">{project.runwayLengthMeters.toLocaleString()} m</strong>
                    <span className="text-[10px] text-slate-500 block">CAT-IIIB ILS Capable</span>
                  </div>
                )}
                {project.terminalCapacityMPPA && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Pax Capacity</span>
                    <strong className="text-slate-900 text-sm">{project.terminalCapacityMPPA} MPPA</strong>
                    <span className="text-[10px] text-slate-500 block">Million Pax / Year</span>
                  </div>
                )}
                {project.dgcaLicensingStatus && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">DGCA Aerodrome</span>
                    <strong className="text-slate-900 text-xs truncate block" title={project.dgcaLicensingStatus}>
                      {project.dgcaLicensingStatus}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Licensing Status</span>
                  </div>
                )}

                {/* Water Resources Fields */}
                {project.headworksProgressPct !== undefined && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block text-[10px]">Dam Headworks</span>
                    <strong className="text-blue-950 text-sm">{project.headworksProgressPct}%</strong>
                    <span className="text-[10px] text-slate-500 block">Civil Impoundment</span>
                  </div>
                )}
                {(project.canalNetworkProgressPct !== undefined || project.canalsProgressPct !== undefined) && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block text-[10px]">Canals Network</span>
                    <strong className="text-blue-950 text-sm">{project.canalNetworkProgressPct ?? project.canalsProgressPct}%</strong>
                    <span className="text-[10px] text-slate-500 block">Field Conveyance</span>
                  </div>
                )}
                {project.commandAreaHectares && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block text-[10px]">Command Area</span>
                    <strong className="text-blue-950 text-sm">{project.commandAreaHectares.toLocaleString()}</strong>
                    <span className="text-[10px] text-slate-500 block">Hectares Irrigated</span>
                  </div>
                )}

                {/* Power & Renewables Fields */}
                {project.generationCapacityMW && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[10px]">Generation Capacity</span>
                    <strong className="text-amber-950 text-sm">{project.generationCapacityMW.toLocaleString()} MW</strong>
                    <span className="text-[10px] text-slate-500 block">Clean Power</span>
                  </div>
                )}
                {project.storageCapacityMWh && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[10px]">BESS Storage</span>
                    <strong className="text-amber-950 text-sm">{project.storageCapacityMWh} MWh</strong>
                    <span className="text-[10px] text-slate-500 block">Battery Storage</span>
                  </div>
                )}
                {project.towersErectedCount !== undefined && (
                  <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[10px]">Towers Erected</span>
                    <strong className="text-amber-950 text-sm">{project.towersErectedCount} / {project.towersTargetCount}</strong>
                    <span className="text-[10px] text-slate-500 block">Transmission Towers</span>
                  </div>
                )}

                {/* Metro Transit Fields */}
                {project.undergroundRouteKm !== undefined && (
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Underground Route</span>
                    <strong className="text-indigo-950 text-sm">{project.undergroundRouteKm} km</strong>
                    <span className="text-[10px] text-slate-500 block">Twin Tunnels</span>
                  </div>
                )}
                {project.elevatedRouteKm !== undefined && (
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Elevated Route</span>
                    <strong className="text-indigo-950 text-sm">{project.elevatedRouteKm} km</strong>
                    <span className="text-[10px] text-slate-500 block">Viaduct & Pier</span>
                  </div>
                )}
                {project.depotLandStatus && (
                  <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Depot Facility</span>
                    <strong className="text-indigo-950 text-xs truncate block" title={project.depotLandStatus}>
                      {project.depotLandStatus}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Stabling & Maintenance</span>
                  </div>
                )}

                {/* Road Technical Fields */}
                {project.roadLengthKm && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Corridor Length</span>
                    <strong className="text-slate-900 text-sm">{project.roadLengthKm} km</strong>
                    <span className="text-[10px] text-slate-500 block">{project.lanes || 4}-Lane Highway</span>
                  </div>
                )}
                {project.structuresCount && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Civil Structures</span>
                    <strong className="text-slate-900 text-xs truncate block" title={project.structuresCount}>
                      {project.structuresCount}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Bridges, ROBs, Flyovers</span>
                  </div>
                )}
                {project.landPossessionPct !== undefined && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Land Handover</span>
                    <strong className="text-slate-900 text-sm">{project.landPossessionPct}%</strong>
                    <span className="text-[10px] text-slate-500 block">Right of Way Cleared</span>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Drivers if At Risk or Delayed */}
            {project.riskFactors && project.riskFactors.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-600" />
                    <span>Identified Risk Drivers & Roadblocks</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Status: <strong className="text-amber-800">{project.status}</strong>
                  </span>
                </div>
                <div className="space-y-2">
                  {project.riskFactors.map((rf) => (
                    <div key={rf.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{rf.factor}</span>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {rf.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{rf.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Execution Information & Recent Notes */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Contract & Field Administration
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nodal Agency:</span>
                  <strong className="text-slate-800">{project.nodalAgency}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Prime Contractor:</span>
                  <strong className="text-slate-800">{project.contractorName}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Commencement:</span>
                  <span className="text-slate-800 font-medium">{project.startDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Target Date:</span>
                  <span className="text-slate-800 font-medium">{project.revisedTargetDate || project.originalTargetDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="text-slate-800 font-medium">{project.district ? `${project.district}, ` : ''}{project.state}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Physical Progress:</span>
                  <span className="text-blue-700 font-bold">{progress}% (Target: {targetProgress}%)</span>
                </div>
              </div>
            </div>

            {/* Officer Audit Trail / Notes Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Officer Inspection Trail
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              {project.auditTrail && project.auditTrail.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {project.auditTrail.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800">{log.author}</span>
                        <span>{log.date}</span>
                      </div>
                      <p className="text-slate-700">{log.note}</p>
                      {log.actionTaken && (
                        <div className="text-[11px] font-semibold text-blue-700">
                          Action: {log.actionTaken}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No formal inspection logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Sector Readiness & Commissioning / Packages */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          {/* 1. Airport Commissioning Readiness Checklist */}
          {project.sector === 'Civil Aviation / Airports' && (
            <div className="bg-white border border-sky-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Plane className="text-sky-700" size={20} />
                    <h3 className="text-base font-bold text-slate-900">
                      Aerodrome Commissioning & Regulatory Readiness Audit
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Multi-agency compliance matrix mandated for DGCA Aerodrome Licensing, BCAS security validation, and commercial launch.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Readiness Score</span>
                    <span className="font-mono text-xl font-black text-sky-900">
                      {project.commissioningReadinessScore || 78}/100
                    </span>
                  </div>
                  <div className="h-9 w-px bg-slate-200" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">DGCA Aerodrome License</span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      {project.dgcaLicensingStatus || 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="gov-table-container">
                <table className="gov-table text-xs">
                  <thead>
                    <tr>
                      <th>Commissioning Item</th>
                      <th>Category</th>
                      <th>Responsible Entity</th>
                      <th>Scheduled Target</th>
                      <th>Inspection Status</th>
                      <th>Auditor Notes & Closure Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.readinessChecklist && project.readinessChecklist.length > 0 ? project.readinessChecklist : DEFAULT_AIRPORT_CHECKLIST).map((chk, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900">
                          {chk.item}
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {chk.category || 'Commissioning'}
                          </span>
                        </td>
                        <td className="text-slate-700 font-medium">
                          {chk.responsibleAgency || chk.agency || 'AAI / DGCA'}
                        </td>
                        <td className="font-mono text-slate-600">
                          {chk.targetDate || 'Q2 2026'}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            chk.status === 'Completed' || chk.status === 'Ready'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : chk.status === 'In Progress'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {chk.status}
                          </span>
                        </td>
                        <td className="text-slate-600 text-[11px]">
                          {chk.notes || chk.details || 'Awaiting formal inspection submission.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Shipping & Ports Programme Packages & Hinterland Evacuation */}
          {project.sector === 'Shipping & Ports' && (
            <div className="bg-white border border-teal-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Anchor className="text-teal-700" size={20} />
                    <h3 className="text-base font-bold text-slate-900">
                      Marine Packages & Hinterland Evacuation Synchronisation
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Multi-contract programme delivery monitoring core port basin construction alongside dedicated rail and road corridors.
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-900 bg-teal-100 px-2.5 py-1 rounded border border-teal-300">
                  {project.programmePackages?.length || 0} Core Work Packages Active
                </span>
              </div>

              {/* Programme Packages Table */}
              <div className="gov-table-container">
                <table className="gov-table text-xs">
                  <thead>
                    <tr>
                      <th>Package Name & Scope</th>
                      <th>Category</th>
                      <th>Contractor</th>
                      <th>Progress</th>
                      <th>Target Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.programmePackages && project.programmePackages.length > 0 ? project.programmePackages : DEFAULT_PORT_PACKAGES).map((pkg, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900">
                          {pkg.name || pkg.packageName || `Package ${idx + 1}`}
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {pkg.category || 'Port Package'}
                          </span>
                        </td>
                        <td className="text-slate-700">
                          {pkg.contractor || pkg.contractorOrConcessionaire || 'To be awarded'}
                        </td>
                        <td>
                          {(() => {
                            const progressVal = pkg.progressPercentage ?? pkg.progressPct ?? 0;
                            return (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 w-8">{progressVal}%</span>
                                <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${progressVal}%` }} />
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="font-mono text-slate-600">
                          {pkg.completionTarget || '2028-2029'}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            pkg.status === 'Completed' || pkg.status === 'Operational'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : pkg.status === 'Delayed'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-teal-50 text-teal-800 border-teal-300'
                          }`}>
                            {pkg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Water Resources Headworks vs Canal Network Synchronisation */}
          {project.sector === 'Water Resources / Bulk Water Supply' && (
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-xs space-y-5">
              {(() => {
                const headworksPct = project.headworksProgressPct ?? 82;
                const canalPct = project.canalNetworkProgressPct ?? project.canalsProgressPct ?? 35;
                const gap = headworksPct - canalPct;
                const hasSevereGap = gap > 30;

                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Droplets className="text-blue-700" size={20} />
                          <h3 className="text-base font-bold text-slate-900">
                            Dam Headworks vs Canal Distribution Network Synchronization
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          PRAEVISIO irrigation gap surveillance: detecting water impoundment that lacks downstream canal or pipe distribution to agricultural fields.
                        </p>
                      </div>
                      {hasSevereGap && (
                        <span className="text-xs font-bold text-rose-900 bg-rose-100 px-2.5 py-1 rounded border border-rose-300 flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-rose-700" />
                          <span>Severe Canal Lag Detected (+{gap}% Gap)</span>
                        </span>
                      )}
                    </div>

                    {/* Progress Comparison Visual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">Dam Headworks & Barrage Impoundment</span>
                          <span className="font-mono text-sm font-black text-blue-900">{headworksPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${headworksPct}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Spillway, earthwork dam, and main reservoir capacity ready.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">Canal Distribution & Field Outlets</span>
                          <span className={`font-mono text-sm font-black ${canalPct < 40 ? 'text-amber-800' : 'text-emerald-800'}`}>
                            {canalPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${canalPct < 40 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${canalPct}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Branch canals, distributaries, and micro-irrigation pipe networks.
                        </p>
                      </div>
                    </div>

                    {/* Command Area Potential */}
                    {project.commandAreaHectares && (
                      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-slate-600 font-medium">Envisaged Gross Irrigation Command Area:</span>
                          <strong className="text-blue-950 text-sm ml-2">{project.commandAreaHectares.toLocaleString()} Hectares</strong>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Sub-schemes & lift stages: <strong>{project.subSchemesCount || 'Multiple Packages'}</strong>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* 4. Power & Renewables Evacuation Lines & Storage Sync */}
          {project.sector === 'Power & Renewable Energy' && (
            <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-700" size={20} />
                    <h3 className="text-base font-bold text-slate-900">
                      Grid Evacuation & Substation Capacity Synchronization
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Ensuring transmission line corridor and substation commissioning matches solar/wind plant commissioning to prevent clean energy curtailment.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Clean Power Generation</span>
                  <span className="font-mono text-lg font-black text-amber-900">
                    {project.generationCapacityMW?.toLocaleString() || '—'} MW
                  </span>
                </div>
              </div>

              {/* Evacuation & Storage Grid Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Generation Capacity</span>
                  <strong className="text-slate-900 text-sm font-bold">{project.generationCapacityMW?.toLocaleString() || '4,500'} MW</strong>
                  <span className="text-[10px] text-slate-500 block">Solar / Wind Generation</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">BESS Storage</span>
                  <strong className="text-slate-900 text-sm font-bold">{project.storageCapacityMWh || '85'} MWh</strong>
                  <span className="text-[10px] text-slate-500 block">Battery Energy Storage</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Towers Erected</span>
                  <strong className="text-slate-900 text-sm font-bold">
                    {project.towersErectedCount || 420} / {project.towersTargetCount || 560}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">Transmission Structures</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Conductor Stringing</span>
                  <strong className="text-slate-900 text-sm font-bold">
                    {project.stringingKmCompleted || 110} / {project.stringingKmTarget || 185} km
                  </strong>
                  <span className="text-[10px] text-slate-500 block">High-Voltage Line</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                <span className="text-slate-700">
                  Current Evacuation Readiness Status: <strong className="text-amber-950">{project.evacuationReadinessStatus || 'Transmission line right-of-way clearance pending in 3 forest spans'}</strong>
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Synchronized with MSETCL / CTUIL
                </span>
              </div>
            </div>
          )}

          {/* 5. Urban Transport (Metro) Alignment, Depot & Rolling Stock */}
          {project.sector === 'Urban Transport (Metro)' && (
            <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Train className="text-indigo-700" size={20} />
                    <h3 className="text-base font-bold text-slate-900">
                      Metro Transit Civil, Depot & Rolling Stock Delivery Matrix
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Synchronizing underground tunnel boring / elevated viaduct civil works with depot land possession and trainset trials.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-300">
                  Maha-Metro / MMRDA / CIDCO
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Underground Tunneling</span>
                  <strong className="text-slate-900 text-sm font-bold">{project.undergroundRouteKm ?? 0} km</strong>
                  <span className="text-[10px] text-slate-500 block">TBM Bored Alignment</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Elevated Viaduct</span>
                  <strong className="text-slate-900 text-sm font-bold">{project.elevatedRouteKm ?? 0} km</strong>
                  <span className="text-[10px] text-slate-500 block">U-Girder / Pier Heads</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Depot Facility Land</span>
                  <strong className="text-slate-900 text-xs truncate block" title={project.depotLandStatus}>
                    {project.depotLandStatus || 'Acquired & Civil Works Active'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">Maintenance Depot</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Traction & Power</span>
                  <strong className="text-slate-900 text-sm font-bold">25 kV AC OHE</strong>
                  <span className="text-[10px] text-slate-500 block">Overhead Catenary</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Milestones Timeline */}
      {activeTab === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Contractual Milestones & Timeline Execution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled milestone deadlines, progress percentages, and current delivery status.
            </p>
          </div>

          <div className="gov-table-container">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th>Milestone Name</th>
                  <th>Planned Schedule</th>
                  <th>Progress</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((m) => {
                    const mStatus = m.status;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          {m.description && <div className="text-[11px] text-slate-500">{m.description}</div>}
                        </td>
                        <td>
                          <div className="text-slate-700 font-mono text-[11px]">
                            {m.plannedStartDate || 'Start'} → {m.plannedEndDate || m.expectedDate || 'Target'}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 w-8">{m.progressPercentage || 0}%</span>
                            <div className="w-24 bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-700 h-1.5 rounded-full"
                                style={{ width: `${m.progressPercentage || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              mStatus === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mStatus === 'Delayed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {mStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">
                      No milestone breakdown registered for this contract.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Officer Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Officer Audit Trail & Compliance Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official chronological log of status changes, field inspection remarks, and administrative reviews.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <FileCheck size={14} />
              <span>Log Inspection Review</span>
            </button>
          </div>

          {project.auditTrail && project.auditTrail.length > 0 ? (
            <div className="space-y-3">
              {project.auditTrail.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{log.author}</span>
                      {log.role && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                          {log.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock size={12} />
                      <span>{log.date}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{log.note}</p>
                  {log.actionTaken && (
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-[11px] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                      <CheckCircle2 size={13} />
                      <span>Action: {log.actionTaken}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No formal audit logs filed yet. Use the "Update Status" button to file the first inspection review.
            </div>
          )}
        </div>
      )}

      {/* Modal: Update Health Status */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Project Health Status
              </h3>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Project Status (Color Tag)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('On Track')}
                    className={`py-2 px-3 rounded-lg font-bold border text-center transition cursor-pointer ${
                      newStatus === 'On Track'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    On Track
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('At Risk')}
                    className={`py-2 px-3 rounded-lg font-bold border text-center transition cursor-pointer ${
                      newStatus === 'At Risk'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    At Risk
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('Delayed')}
                    className={`py-2 px-3 rounded-lg font-bold border text-center transition cursor-pointer ${
                      newStatus === 'Delayed'
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Delayed
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Officer Remark / Reason for Change
                </label>
                <textarea
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Enter inspection findings, reason for delay, or corrective action taken..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Save Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
