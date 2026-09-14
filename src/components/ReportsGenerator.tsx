import React, { useState, useEffect } from 'react';
import type { 
  Project, 
  EarlyWarning, 
  RecommendedAction, 
  User, 
  ReportType, 
  ReportSectionConfig,
  GeneratedReport,
  ReportHistoryItem 
} from '../types';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  RotateCcw, 
  Eye, 
  Trash2, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { GlassPanel } from './motion/GlassPanel';
import { PulseIndicator } from './motion/PulseIndicator';
import { LoadingScanner } from './motion/LoadingScanner';
import { 
  generateProjectReport, 
  generateRiskReport, 
  generateWarningReport, 
  generateExecutiveReport, 
  exportCSV, 
  getReportHistory, 
  saveReportHistoryItem, 
  deleteReportHistoryItem 
} from '../services/reportService';
import { ReportPreviewModal } from './reports/ReportPreviewModal';
import { ExecutiveReportView } from './reports/ExecutiveReportView';
import { ExecutiveCommandCenter } from './ExecutiveCommandCenter';

interface ReportsGeneratorProps {
  projects: Project[];
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  currentUser?: User;
  initialProjectId?: string;
  initialReportType?: ReportType;
  showExecutiveMode?: boolean;
  onSelectProject?: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onSelectAction?: (actionId: string) => void;
}

const defaultSectionConfig: ReportSectionConfig = {
  includeOverview: true,
  includeProgress: true,
  includeCost: true,
  includeRiskAssessment: true,
  includeRiskExplanation: true,
  includeEarlyWarnings: true,
  includeRecommendedActions: true,
  includeRiskHistory: true,
  includeAuditSummary: true
};

export const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({
  projects,
  alerts = [],
  actions = [],
  currentUser,
  initialProjectId,
  initialReportType = 'project_monitoring',
  showExecutiveMode = false,
  onSelectProject,
  onSelectAlert,
  onSelectAction
}) => {
  // Navigation View Tab: 'reports' | 'executive'
  const [activeTab, setActiveTab] = useState<'reports' | 'executive'>(showExecutiveMode ? 'executive' : 'reports');
  const [showPrintReportModal, setShowPrintReportModal] = useState<boolean>(false);

  // Report Form State
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(initialReportType);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-12');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All');
  const [sections, setSections] = useState<ReportSectionConfig>(defaultSectionConfig);

  // Status & Modal State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePreviewReport, setActivePreviewReport] = useState<GeneratedReport | null>(null);
  const [historyItems, setHistoryItems] = useState<ReportHistoryItem[]>(getReportHistory());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Derive Summary Card Metrics from actual current data
  const totalReportsGenerated = historyItems.length;
  const pendingReportsCount = projects.filter(p => p.status === 'At Risk' || p.status === 'Delayed').length;
  const riskReportsCount = projects.filter(p => p.riskScore >= 70).length;
  const monitoringReportsCount = projects.length;

  const handleToggleSection = (key: keyof ReportSectionConfig) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetForm = () => {
    setSelectedReportType('project_monitoring');
    setSelectedProjectId(projects[0]?.id || '');
    setSelectedDepartment('All');
    setSelectedLocation('All');
    setStartDate('2026-09-01');
    setEndDate('2026-09-12');
    setSelectedRiskLevel('All');
    setSections(defaultSectionConfig);
    showToast('Report configuration reset to baseline defaults.');
  };

  const handleGeneratePreview = () => {
    setIsGenerating(true);
    showToast('Generating official report preview...');

    setTimeout(() => {
      let report: GeneratedReport;
      const targetProject = projects.find(p => p.id === selectedProjectId) || projects[0];

      if (selectedReportType === 'executive_summary') {
        report = generateExecutiveReport(projects, alerts, actions, currentUser);
      } else if (selectedReportType === 'risk_assessment') {
        report = generateRiskReport(targetProject, alerts, actions, { sections }, currentUser);
      } else if (selectedReportType === 'early_warning') {
        report = generateWarningReport(targetProject, alerts, actions, { sections }, currentUser);
      } else {
        report = generateProjectReport(targetProject, alerts, actions, { sections }, currentUser);
      }

      // Add to history
      const historyEntry: ReportHistoryItem = {
        id: report.id,
        name: report.title,
        type: report.reportType,
        projectId: report.project?.id,
        projectName: report.project?.name,
        generatedBy: report.generatedBy,
        generatedDate: report.generatedDate,
        status: 'Generated',
        fileSize: `${(Math.random() * 1.5 + 0.8).toFixed(1)} MB`
      };

      saveReportHistoryItem(historyEntry);
      setHistoryItems(getReportHistory());
      setActivePreviewReport(report);
      setIsGenerating(false);
      showToast('Report generated successfully.');
    }, 600);
  };

  const handleDeleteHistory = (id: string) => {
    deleteReportHistoryItem(id);
    setHistoryItems(getReportHistory());
    setDeleteConfirmId(null);
    showToast('Report record deleted from history.');
  };

  const handleSelectCategoryCard = (type: ReportType) => {
    setSelectedReportType(type);
    const element = document.getElementById('report-generator-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-teal-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Report Record?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this report from the audit history? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHistory(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Subtitle */}
      <GlassPanel variant="glowing" reflection className="p-5 no-print">
        <LoadingScanner active label="OFFICIAL MOSPI REPORT ENGINE ACTIVE" position="top" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pt-1">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 uppercase font-bold flex items-center space-x-1.5">
                <PulseIndicator color="cyan" size="sm" />
                <span>MOSPI EXECUTIVE REPORTING</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5 mt-1">
              <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
              <span>Official Reports & Data Export Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate official MoSPI project monitoring reports, executive summaries and risk telemetry exports.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSelectCategoryCard('executive_summary')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition shrink-0"
            >
              Executive Summary Mode
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* View Selector Tabs (Reports Page vs Executive Monitoring) */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 no-print">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'reports' 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Project Reports Console</span>
        </button>

        <button
          onClick={() => setActiveTab('executive')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'executive' 
              ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Executive Monitoring Briefing</span>
        </button>
      </div>

      {activeTab === 'executive' ? (
        <div className="space-y-4">
          <ExecutiveCommandCenter
            projects={projects}
            alerts={alerts}
            actions={actions}
            currentUser={currentUser}
            onSelectProject={onSelectProject || (() => {})}
            onSelectAlert={onSelectAlert}
            onSelectAction={onSelectAction}
            onOpenReportModal={() => setShowPrintReportModal(true)}
          />

          {/* Printable Executive Report Modal */}
          {showPrintReportModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn no-print-bg print:static print:inset-auto print:p-0 print:bg-white print:overflow-visible">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative shadow-2xl print:max-h-none print:h-auto print:max-w-none print:shadow-none print:border-none print:bg-white print:p-0 print:overflow-visible">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Executive Portfolio Briefing Document</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / Save PDF</span>
                    </button>
                    <button
                      onClick={() => setShowPrintReportModal(false)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <ExecutiveReportView 
                  projects={projects} 
                  alerts={alerts} 
                  actions={actions}
                  generatedBy={currentUser ? `${currentUser.name} (${currentUser.designation || currentUser.role})` : undefined}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 4 Report Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Reports Generated</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{totalReportsGenerated}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Pending Reports</div>
                <div className="text-xl font-extrabold text-amber-400 mt-0.5">{pendingReportsCount}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Risk Reports</div>
                <div className="text-xl font-extrabold text-red-400 mt-0.5">{riskReportsCount}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Monitoring Reports</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{monitoringReportsCount}</div>
              </div>
            </div>
          </div>

          {/* 4 Report Categories Cards */}
          <div className="no-print">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              Report Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div 
                onClick={() => handleSelectCategoryCard('project_monitoring')}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedReportType === 'project_monitoring'
                    ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Project Monitoring Report</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Full project status breakdown including progress gap, cost analysis, and milestone status.
                  </p>
                </div>
                <div className="mt-4 text-xs text-teal-400 font-bold flex items-center space-x-1">
                  <span>Configure Report</span>
                  <span>→</span>
                </div>
              </div>

              <div 
                onClick={() => handleSelectCategoryCard('risk_assessment')}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedReportType === 'risk_assessment'
                    ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Risk Assessment Report</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    AI-powered risk index breakdown with SHAP explanations and factor contributions.
                  </p>
                </div>
                <div className="mt-4 text-xs text-amber-400 font-bold flex items-center space-x-1">
                  <span>Configure Report</span>
                  <span>→</span>
                </div>
              </div>

              <div 
                onClick={() => handleSelectCategoryCard('early_warning')}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedReportType === 'early_warning'
                    ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Early Warning Report</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Audit log of active and historical early warning triggers with officer assignments.
                  </p>
                </div>
                <div className="mt-4 text-xs text-red-400 font-bold flex items-center space-x-1">
                  <span>Configure Report</span>
                  <span>→</span>
                </div>
              </div>

              <div 
                onClick={() => handleSelectCategoryCard('executive_summary')}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedReportType === 'executive_summary'
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Executive Summary</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Portfolio-wide briefing for senior leadership highlighting priority projects.
                  </p>
                </div>
                <div className="mt-4 text-xs text-indigo-400 font-bold flex items-center space-x-1">
                  <span>Configure Report</span>
                  <span>→</span>
                </div>
              </div>

            </div>
          </div>

          {/* REPORT GENERATION PANEL (FORM) */}
          <div id="report-generator-form" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm no-print space-y-6">
            
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Report Generation Form</h3>
                <p className="text-xs text-slate-400">Configure report scope, target parameters, and included audit sections.</p>
              </div>

              <button
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Report Type</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="project_monitoring">Project Monitoring Report</option>
                  <option value="risk_assessment">Risk Assessment Report</option>
                  <option value="early_warning">Early Warning Report</option>
                  <option value="executive_summary">Executive Summary</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={selectedReportType === 'executive_summary'}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-teal-500 focus:outline-none disabled:opacity-50"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Department Filter</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="Infrastructure Development">Infrastructure Development</option>
                  <option value="Urban Infrastructure">Urban Infrastructure</option>
                  <option value="Railway Operations">Railway Operations</option>
                  <option value="Power Grid Corporation">Power Grid Corporation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Location / State</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="All">All Locations</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Date Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-2"
                  />
                  <span className="text-slate-500">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Risk Level Filter</label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-teal-500 focus:outline-none"
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Critical">Critical (&gt;= 80)</option>
                  <option value="High">High (&gt;= 60)</option>
                  <option value="Medium">Medium (&gt;= 30)</option>
                  <option value="Low">Low (&lt; 30)</option>
                </select>
              </div>

            </div>

            {/* Checkbox Section Includes */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Include Report Sections:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs text-slate-300">
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeOverview}
                    onChange={() => handleToggleSection('includeOverview')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Project Overview</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeProgress}
                    onChange={() => handleToggleSection('includeProgress')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Progress Analysis</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeCost}
                    onChange={() => handleToggleSection('includeCost')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Cost Analysis</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeRiskAssessment}
                    onChange={() => handleToggleSection('includeRiskAssessment')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Risk Assessment</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeRiskExplanation}
                    onChange={() => handleToggleSection('includeRiskExplanation')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Risk Explanation</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeEarlyWarnings}
                    onChange={() => handleToggleSection('includeEarlyWarnings')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Early Warnings</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeRecommendedActions}
                    onChange={() => handleToggleSection('includeRecommendedActions')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Recommended Actions</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeRiskHistory}
                    onChange={() => handleToggleSection('includeRiskHistory')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Risk History</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.includeAuditSummary}
                    onChange={() => handleToggleSection('includeAuditSummary')}
                    className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                  />
                  <span>Audit Summary</span>
                </label>

              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Reset
              </button>

              <button
                onClick={handleGeneratePreview}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition shadow-md flex items-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Preview...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Generate Preview</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* REPORT HISTORY TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm no-print space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Report History</h3>
                <p className="text-xs text-slate-400">View, download, or delete previously generated project reports.</p>
              </div>

              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-full">
                {historyItems.length} Saved Records
              </span>
            </div>

            {historyItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                No reports generated yet. Use the form above to generate official briefings.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="p-3">Report Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Scope / Project</th>
                      <th className="p-3">Generated By</th>
                      <th className="p-3 font-mono">Date</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {historyItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white max-w-xs truncate">
                          {item.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {item.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {item.projectName || 'All Portfolio Projects'}
                        </td>
                        <td className="p-3 text-slate-400">{item.generatedBy}</td>
                        <td className="p-3 font-mono text-slate-400">{item.generatedDate}</td>
                        <td className="p-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                const targetProject = projects.find(p => p.id === item.projectId) || projects[0];
                                const rep = generateProjectReport(targetProject, alerts, actions, {}, currentUser);
                                setActivePreviewReport(rep);
                              }}
                              className="p-1 text-slate-400 hover:text-teal-400 transition"
                              title="View Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => exportCSV(projects, `Report_${item.id}`)}
                              className="p-1 text-slate-400 hover:text-amber-400 transition"
                              title="Download CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </>
      )}

      {/* REPORT PREVIEW MODAL OVERLAY */}
      <ReportPreviewModal
        report={activePreviewReport}
        alerts={alerts}
        actions={actions}
        onClose={() => setActivePreviewReport(null)}
      />

    </div>
  );
};
