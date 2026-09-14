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
  Clock
} from 'lucide-react';
import type { Project, ProjectStatus, ProjectImage } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ProjectMap } from './ProjectMap';
import { ProjectImageGallery } from './ProjectImageGallery';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus, note: string) => void;
  onAddImage?: (projectId: string, newImage: ProjectImage) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateStatus,
  onAddImage
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'audit'>('overview');
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

          {/* Quick Action Button to Update Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <FileCheck size={15} />
              <span>Update Project Health Status</span>
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

      {/* 1. Real Interactive Project Map (Top) */}
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
