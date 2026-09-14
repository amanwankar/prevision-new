import React from 'react';
import type { GeneratedReport, EarlyWarning, RecommendedAction } from '../../types';
import { ReportHeader } from './ReportHeader';
import { ReportMetadataCard } from './ReportMetadataCard';
import { ExecutiveSummarySection } from './ExecutiveSummarySection';
import { ProjectOverviewSection } from './ProjectOverviewSection';
import { ProgressAnalysisSection } from './ProgressAnalysisSection';
import { CostAnalysisSection } from './CostAnalysisSection';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import { RiskExplanationSection } from './RiskExplanationSection';
import { EarlyWarningSection } from './EarlyWarningSection';
import { RecommendedActionsSection } from './RecommendedActionsSection';
import { RiskHistorySection } from './RiskHistorySection';
import { ReportFooter } from './ReportFooter';
import { ExecutiveReportView } from './ExecutiveReportView';
import { Printer, Download, X, FileText } from 'lucide-react';
import { exportCSV } from '../../services/reportService';

interface ReportPreviewModalProps {
  report: GeneratedReport | null;
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  alerts,
  actions,
  onClose
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (report.project) {
      exportCSV([report.project], `Report_${report.id}`);
    } else if (report.allProjects) {
      exportCSV(report.allProjects, `Executive_Report_${report.id}`);
    }
  };

  const isExecutive = report.reportType === 'executive_summary' && report.allProjects && !report.project;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto no-print-bg print:static print:inset-auto print:p-0 print:bg-white print:overflow-visible">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:h-auto print:max-w-none print:shadow-none print:border-none print:bg-white print:overflow-visible">
        
        {/* Modal Header Actions Bar (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 rounded-t-2xl no-print shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Official Report Document Preview</h3>
              <p className="text-[11px] text-slate-400">PRAEVISIO Audit & Executive Briefing Format</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition shadow-sm flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable White Paper Document Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 print:bg-white print:p-0 print:overflow-visible print:max-h-none print:h-auto print:block">
          
          {isExecutive ? (
            <ExecutiveReportView
              projects={report.allProjects || []}
              alerts={alerts}
              actions={actions}
              reportId={report.id}
              generatedDate={report.generatedDate}
              generatedBy={report.generatedBy}
            />
          ) : report.project ? (
            <div className="bg-white text-slate-900 rounded-xl p-8 shadow-xl border border-slate-200 max-w-4xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
              
              <ReportHeader
                title={report.title}
                reportId={report.id}
                date={report.generatedDate}
              />

              <ReportMetadataCard report={report} />

              {report.sections.includeOverview && (
                <ExecutiveSummarySection
                  project={report.project}
                  alerts={alerts}
                  actions={actions}
                  summaryText={report.summaryText}
                />
              )}

              {report.sections.includeOverview && (
                <ProjectOverviewSection project={report.project} />
              )}

              {report.sections.includeProgress && (
                <ProgressAnalysisSection project={report.project} />
              )}

              {report.sections.includeCost && (
                <CostAnalysisSection project={report.project} />
              )}

              {report.sections.includeRiskAssessment && (
                <RiskAssessmentSection project={report.project} />
              )}

              {report.sections.includeRiskExplanation && (
                <RiskExplanationSection project={report.project} />
              )}

              {report.sections.includeEarlyWarnings && (
                <EarlyWarningSection project={report.project} alerts={alerts} />
              )}

              {report.sections.includeRecommendedActions && (
                <RecommendedActionsSection project={report.project} actions={actions} />
              )}

              {report.sections.includeRiskHistory && (
                <RiskHistorySection project={report.project} />
              )}

              <ReportFooter
                signatory={report.generatedBy}
                designation={report.scope}
              />

            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
};
