import React, { useState, useMemo } from 'react';
import type { Project, Milestone, ProjectSector } from '../../types';
import { 
  calculateDataQuality, 
  getRiskAnalysisReadiness
} from '../../services/dataQualityService';
import { DataQualityScore } from '../data/DataQualityScore';
import { DataQualitySignals } from '../data/DataQualitySignals';
import { RiskReadinessPanel } from '../data/RiskReadinessPanel';
import { DataQualityHistoryChart } from '../data/DataQualityHistoryChart';
import { 
  Database, 
  Save, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Play, 
  DollarSign, 
  Calendar, 
  Activity, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

interface ProjectIntakeFormProps {
  initialProject?: Project;
  isEditMode?: boolean;
  onSave: (projectData: Project, triggerRiskAnalysis: boolean) => void;
  onCancel: () => void;
}

const SECTORS: ProjectSector[] = [
  'Highways',
  'Railways',
  'Power & Energy',
  'Urban Transit',
  'Ports & Waterways',
  'Water Supply & Sanitation',
  'Smart Cities',
];

export const ProjectIntakeForm: React.FC<ProjectIntakeFormProps> = ({
  initialProject,
  isEditMode = false,
  onSave,
  onCancel,
}) => {
  const [activeSection, setActiveSection] = useState<
    'basic' | 'financial' | 'timeline' | 'progress' | 'milestones' | 'validation'
  >('basic');

  // Form State
  const [code, setCode] = useState(() => initialProject?.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`);
  const [draftId] = useState(() => initialProject?.id || `prj-${Date.now()}`);
  const [name, setName] = useState(initialProject?.name || '');
  const [sector, setSector] = useState<ProjectSector>(initialProject?.sector || 'Highways');
  const [department, setDepartment] = useState(initialProject?.department || 'Ministry of Road Transport & Highways');
  const [state, setState] = useState(initialProject?.state || 'Maharashtra');
  const [locationName, setLocationName] = useState(initialProject?.locationName || 'District Corridor');
  const [nodalAgency, setNodalAgency] = useState(initialProject?.nodalAgency || 'NHAI');
  const [contractorName, setContractorName] = useState(initialProject?.contractorName || 'L&T Infrastructure');

  // Financials
  const [originalBudgetCr, setOriginalBudgetCr] = useState<number>(initialProject?.originalBudgetCr || 500);
  const [revisedBudgetCr, setRevisedBudgetCr] = useState<number>(initialProject?.revisedBudgetCr || 500);
  const [expenditureToDateCr, setExpenditureToDateCr] = useState<number>(initialProject?.expenditureToDateCr || 150);

  // Dates & Timeline
  const [startDate, setStartDate] = useState<string>(initialProject?.startDate || '2023-01-15');
  const [originalTargetDate, setOriginalTargetDate] = useState<string>(initialProject?.originalTargetDate || '2026-12-31');
  const [revisedTargetDate, setRevisedTargetDate] = useState<string>(initialProject?.revisedTargetDate || '2027-06-30');

  // Progress
  const [targetPhysicalProgress, setTargetPhysicalProgress] = useState<number>(initialProject?.targetPhysicalProgress || 70);
  const [actualPhysicalProgress, setActualPhysicalProgress] = useState<number>(initialProject?.actualPhysicalProgress || 45);
  const [financialDisbursementPercentage, setFinancialDisbursementPercentage] = useState<number>(initialProject?.financialDisbursementPercentage || 40);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>(initialProject?.milestones || [
    { id: 'm1', name: 'Land Acquisition & Environmental Clearance', plannedEndDate: '2023-06-30', status: 'Completed', progressPercentage: 100 },
    { id: 'm2', name: 'Civil Structure & Primary Earthworks', plannedEndDate: '2024-12-31', status: 'In Progress', progressPercentage: 65 },
    { id: 'm3', name: 'Track Laying / Main Equipment Fitting', plannedEndDate: '2025-12-31', status: 'Pending', progressPercentage: 0 },
    { id: 'm4', name: 'System Testing & Final Safety Certification', plannedEndDate: '2026-09-30', status: 'Pending', progressPercentage: 0 },
  ]);

  // Constructed Partial Project for real-time validation
  const currentProjectDraft = useMemo<Partial<Project>>(() => {
    return {
      id: draftId,
      code,
      name,
      sector,
      department,
      state,
      locationName,
      nodalAgency,
      contractorName,
      originalBudgetCr,
      revisedBudgetCr,
      expenditureToDateCr,
      startDate,
      originalTargetDate,
      revisedTargetDate,
      targetPhysicalProgress,
      actualPhysicalProgress,
      financialDisbursementPercentage,
      milestones,
      auditTrail: initialProject?.auditTrail || [],
    };
  }, [
    initialProject,
    draftId,
    code,
    name,
    sector,
    department,
    state,
    locationName,
    nodalAgency,
    contractorName,
    originalBudgetCr,
    revisedBudgetCr,
    expenditureToDateCr,
    startDate,
    originalTargetDate,
    revisedTargetDate,
    targetPhysicalProgress,
    actualPhysicalProgress,
    financialDisbursementPercentage,
    milestones,
  ]);

  // Real-time Data Quality & Readiness Metrics
  const qualityResult = useMemo(() => calculateDataQuality(currentProjectDraft), [currentProjectDraft]);
  const readiness = useMemo(() => getRiskAnalysisReadiness(currentProjectDraft), [currentProjectDraft]);

  // Milestone Handlers
  const handleAddMilestone = () => {
    const newMs: Milestone = {
      id: `ms-${Date.now()}`,
      name: 'New Project Milestone',
      status: 'Pending',
      plannedStartDate: startDate,
      plannedEndDate: originalTargetDate,
      progressPercentage: 0,
    };
    setMilestones((prev) => [...prev, newMs]);
  };

  const handleUpdateMilestone = (id: string, updated: Partial<Milestone>) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Submit Handler
  const handleSubmit = (triggerRiskAnalysis: boolean) => {
    const fullProject: Project = {
      id: initialProject?.id || `PRJ-${Date.now()}`,
      code,
      name,
      sector,
      department,
      state,
      locationName,
      lat: initialProject?.lat || 19.076,
      lng: initialProject?.lng || 72.8777,
      nodalAgency,
      contractorName,
      originalBudgetCr,
      revisedBudgetCr,
      expenditureToDateCr,
      startDate,
      originalTargetDate,
      revisedTargetDate,
      aiPredictedDate: revisedTargetDate,
      targetPhysicalProgress,
      actualPhysicalProgress,
      financialDisbursementPercentage,
      riskScore: initialProject?.riskScore || (actualPhysicalProgress < targetPhysicalProgress ? 74 : 32),
      riskLevel: initialProject?.riskLevel || (actualPhysicalProgress < targetPhysicalProgress ? 'High' : 'Low'),
      primaryRisk: initialProject?.primaryRisk || 'Schedule Delay',
      delayDays: initialProject?.delayDays || (actualPhysicalProgress < targetPhysicalProgress ? 120 : 0),
      costOverrunForecastCr: initialProject?.costOverrunForecastCr || 0,
      status: initialProject?.status || (actualPhysicalProgress < targetPhysicalProgress ? 'At Risk' : 'On Track'),
      riskFactors: initialProject?.riskFactors || [],
      milestones,
      sCurveData: initialProject?.sCurveData || [],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'Project Officer',
          role: 'Data Manager',
          note: isEditMode ? 'Updated project parameters & verified quality.' : 'Created new project entry in Data Intelligence Center.',
          actionTaken: isEditMode ? 'Project Updated' : 'Project Created',
          previousRiskScore: initialProject?.riskScore || 0,
          newRiskScore: initialProject?.riskScore || 32,
        },
        ...(initialProject?.auditTrail || []),
      ],
    };

    onSave(fullProject, triggerRiskAnalysis);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-950 p-6 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                {isEditMode ? 'EDIT PROJECT INTELLIGENCE DATA' : 'NEW PROJECT INTAKE WIZARD'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isEditMode ? `Edit Project: ${name || code}` : 'Register Infrastructure Project'}
            </h1>
          </div>
        </div>

        {/* Live Data Quality Score Indicator Pill */}
        <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">LIVE QUALITY:</span>
          <span
            className={`font-mono text-lg font-black ${
              qualityResult.overallScore >= 85
                ? 'text-emerald-400'
                : qualityResult.overallScore >= 70
                ? 'text-cyan-400'
                : 'text-amber-400'
            }`}
          >
            {qualityResult.overallScore}/100
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              qualityResult.status === 'DATA READY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {qualityResult.status}
          </span>
        </div>
      </div>

      {/* Wizard Section Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        {[
          { id: 'basic', label: '1. BASIC INFO', icon: FileText },
          { id: 'financial', label: '2. FINANCIALS', icon: DollarSign },
          { id: 'timeline', label: '3. TIMELINE', icon: Calendar },
          { id: 'progress', label: '4. PROGRESS', icon: Activity },
          { id: 'milestones', label: '5. MILESTONES', icon: CheckCircle2 },
          { id: 'validation', label: '6. VALIDATION & RISK', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Wizard Form Body */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-md">
        {/* SECTION 1: BASIC INFO */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="h-5 w-5 text-cyan-400" />
              BASIC PROJECT IDENTIFICATION & OWNERSHIP
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  PROJECT TITLE *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. National Highway-44 Expressway Expansion"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  PROJECT CODE / ID *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PRJ-104"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-cyan-400 font-mono font-bold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  INFRASTRUCTURE SECTOR *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as ProjectSector)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-slate-200 font-medium focus:border-cyan-400"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  MONITORING DEPARTMENT *
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Ministry of Road Transport & Highways"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  NODAL IMPLEMENTING AGENCY
                </label>
                <input
                  type="text"
                  value={nodalAgency}
                  onChange={(e) => setNodalAgency(e.target.value)}
                  placeholder="e.g. National Highways Authority of India (NHAI)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  CONTRACTOR / EXECUTING AGENCY
                </label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  placeholder="e.g. Larsen & Toubro Construction"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  STATE / REGION
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  LOCATION / CORRIDOR NAME
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Pune - Solapur Sector Corridor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FINANCIAL DATA */}
        {activeSection === 'financial' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              FINANCIAL DISBURSEMENT & SANCTIONED BUDGET
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  APPROVED SANCTIONED BUDGET (₹ CRORES) *
                </label>
                <input
                  type="number"
                  value={originalBudgetCr}
                  onChange={(e) => setOriginalBudgetCr(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-base text-emerald-400 font-mono font-bold focus:border-emerald-400"
                />
                <span className="block text-[11px] text-slate-400 mt-1">Initial CCEA sanctioned amount</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  REVISED ESTIMATED COST (₹ CRORES)
                </label>
                <input
                  type="number"
                  value={revisedBudgetCr}
                  onChange={(e) => setRevisedBudgetCr(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-base text-white font-mono font-bold focus:border-cyan-400"
                />
                <span className="block text-[11px] text-slate-400 mt-1">Current revised financial commitment</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  ACTUAL EXPENDITURE TO DATE (₹ CRORES)
                </label>
                <input
                  type="number"
                  value={expenditureToDateCr}
                  onChange={(e) => setExpenditureToDateCr(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-base text-white font-mono font-bold focus:border-cyan-400"
                />
                <span className="block text-[11px] text-slate-400 mt-1">Audited financial release total</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: TIMELINE */}
        {activeSection === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              SCHEDULE & TARGET MILESTONE TIMELINES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  PROJECT START DATE *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  PLANNED TARGET COMPLETION *
                </label>
                <input
                  type="date"
                  value={originalTargetDate}
                  onChange={(e) => setOriginalTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1.5">
                  CURRENT EXPECTED COMPLETION
                </label>
                <input
                  type="date"
                  value={revisedTargetDate}
                  onChange={(e) => setRevisedTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-purple-300 font-mono font-bold focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: PROGRESS */}
        {activeSection === 'progress' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="h-5 w-5 text-cyan-400" />
              PHYSICAL PROGRESS & DISBURSEMENT PERCENTAGES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">PLANNED TARGET PROGRESS %</span>
                  <span className="text-cyan-400 font-bold text-sm">{targetPhysicalProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetPhysicalProgress}
                  onChange={(e) => setTargetPhysicalProgress(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">ACTUAL PHYSICAL PROGRESS %</span>
                  <span className="text-purple-400 font-bold text-sm">{actualPhysicalProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={actualPhysicalProgress}
                  onChange={(e) => setActualPhysicalProgress(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">FINANCIAL DISBURSEMENT %</span>
                  <span className="text-emerald-400 font-bold text-sm">{financialDisbursementPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={financialDisbursementPercentage}
                  onChange={(e) => setFinancialDisbursementPercentage(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: MILESTONES */}
        {activeSection === 'milestones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                PROJECT MILESTONES MANAGER ({milestones.length})
              </h3>
              <button
                onClick={handleAddMilestone}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> ADD MILESTONE
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleUpdateMilestone(m.id, { name: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-bold"
                    />
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1.5 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Milestone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block mb-1">PLANNED END DATE</span>
                      <input
                        type="date"
                        value={m.plannedEndDate || originalTargetDate}
                        onChange={(e) => handleUpdateMilestone(m.id, { plannedEndDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">STATUS</span>
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateMilestone(m.id, { status: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">PROGRESS %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={m.progressPercentage ?? 0}
                        onChange={(e) =>
                          handleUpdateMilestone(m.id, { progressPercentage: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: VALIDATION & RISK */}
        {activeSection === 'validation' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              INTELLIGENCE VALIDATION & RISK ENGINE HANDOFF
            </h3>

            {/* Data Quality Score Card */}
            <DataQualityScore result={qualityResult} />

            {/* Data Quality Signals */}
            <DataQualitySignals issues={qualityResult.issues} />

            {/* Risk Readiness Panel */}
            <RiskReadinessPanel
              readiness={readiness}
              onRunRiskAnalysis={() => handleSubmit(true)}
            />

            {/* Historical Data Quality Trajectory */}
            <DataQualityHistoryChart />
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl rounded-2xl bg-black/90 border border-cyan-500/30 p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-400">STATUS:</span>
          <span
            className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${
              readiness.canRunRiskAnalysis
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {readiness.state}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Save className="h-4 w-4 text-cyan-400" />
            SAVE DRAFT
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={!readiness.canRunRiskAnalysis}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-extrabold transition-all shadow-lg ${
              !readiness.canRunRiskAnalysis
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold shadow-cyan-500/25 cursor-pointer'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            SAVE & RUN RISK ANALYSIS
          </button>
        </div>
      </div>
    </div>
  );
};
