import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, AlertOctagon, Trash2, ShieldCheck } from 'lucide-react';
import type { Project } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProjects: (importedProjects: Project[]) => void;
}

interface ParsedRow {
  id: string;
  code: string;
  name: string;
  sector: Project['sector'];
  department: string;
  originalBudgetCr: number;
  actualPhysicalProgress: number;
  targetPhysicalProgress: number;
  startDate: string;
  originalTargetDate: string;
  isValid: boolean;
  issuesCount: number;
}

const SAMPLE_CSV_DATA: ParsedRow[] = [
  {
    id: 'PRJ-IMPORT-101',
    code: 'PRJ-101',
    name: 'Coastal Road Phase-3 Expansion',
    sector: 'Highways',
    department: 'Ministry of Road Transport & Highways',
    originalBudgetCr: 1450,
    actualPhysicalProgress: 42,
    targetPhysicalProgress: 65,
    startDate: '2025-01-15',
    originalTargetDate: '2027-06-30',
    isValid: true,
    issuesCount: 1,
  },
  {
    id: 'PRJ-IMPORT-102',
    code: 'PRJ-102',
    name: 'Eastern Railway Freight Corridor',
    sector: 'Railways',
    department: 'Ministry of Railways',
    originalBudgetCr: 3200,
    actualPhysicalProgress: 78,
    targetPhysicalProgress: 80,
    startDate: '2024-03-01',
    originalTargetDate: '2026-12-31',
    isValid: true,
    issuesCount: 0,
  },
  {
    id: 'PRJ-IMPORT-103',
    code: 'PRJ-103',
    name: 'Suburban Solar Energy Grid',
    sector: 'Power & Energy',
    department: 'Ministry of Power',
    originalBudgetCr: -200, // Invalid negative budget
    actualPhysicalProgress: 110, // Invalid progress > 100
    targetPhysicalProgress: 90,
    startDate: '2025-05-10',
    originalTargetDate: '2024-01-01', // Invalid date reverse
    isValid: false,
    issuesCount: 3,
  },
];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportProjects,
}) => {
  const [rows, setRows] = useState<ParsedRow[]>(SAMPLE_CSV_DATA);
  const [hasUploaded, setHasUploaded] = useState(false);

  if (!isOpen) return null;

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  const handleSimulateFileSelect = () => {
    setHasUploaded(true);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleExecuteImport = () => {
    const projectsToImport: Project[] = validRows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      sector: r.sector,
      department: r.department,
      state: 'Maharashtra',
      locationName: 'District Hub',
      lat: 19.076,
      lng: 72.8777,
      nodalAgency: r.department,
      contractorName: 'L&T Infrastructure',
      originalBudgetCr: r.originalBudgetCr,
      revisedBudgetCr: r.originalBudgetCr,
      expenditureToDateCr: Math.round(r.originalBudgetCr * (r.actualPhysicalProgress / 100)),
      startDate: r.startDate,
      originalTargetDate: r.originalTargetDate,
      revisedTargetDate: r.originalTargetDate,
      aiPredictedDate: r.originalTargetDate,
      targetPhysicalProgress: r.targetPhysicalProgress,
      actualPhysicalProgress: r.actualPhysicalProgress,
      financialDisbursementPercentage: r.actualPhysicalProgress,
      riskScore: r.actualPhysicalProgress < r.targetPhysicalProgress ? 72 : 28,
      riskLevel: r.actualPhysicalProgress < r.targetPhysicalProgress ? 'High' : 'Low',
      primaryRisk: 'Schedule Delay',
      delayDays: r.actualPhysicalProgress < r.targetPhysicalProgress ? 120 : 0,
      costOverrunForecastCr: 0,
      status: r.actualPhysicalProgress < r.targetPhysicalProgress ? 'At Risk' : 'On Track',
      riskFactors: [],
      milestones: [
        {
          id: `ms-imp-1`,
          name: 'Site Clearance & Excavation',
          status: 'Completed',
          progressPercentage: 100,
        },
      ],
      sCurveData: [],
      auditTrail: [
        {
          id: `aud-imp-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'System Bulk Importer',
          role: 'Administrator',
          note: 'Project imported via Bulk Data Intelligence Center.',
          actionTaken: 'Bulk Import',
          previousRiskScore: 0,
          newRiskScore: 28,
        },
      ],
    }));

    onImportProjects(projectsToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">IMPORT BULK PROJECT DATA</h3>
              <p className="text-xs text-slate-400">CSV / JSON / Excel Structured Intake & Validation Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dropzone */}
        {!hasUploaded ? (
          <div
            onClick={handleSimulateFileSelect}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 border-slate-700 bg-black/40 hover:border-cyan-500/50 hover:bg-slate-800/40"
          >
            <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-200">DROP PROJECT DATA FILE OR CLICK TO BROWSE</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Supports <span className="font-mono text-cyan-400">.CSV</span>, <span className="font-mono text-cyan-400">.JSON</span>, or <span className="font-mono text-cyan-400">.XLSX</span> infrastructure project templates.
            </p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-mono text-xs font-bold hover:bg-cyan-400 transition-colors">
              LOAD DEMO PORTFOLIO CSV
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary metrics bar */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400 uppercase">TOTAL ROWS</span>
                <span className="text-xl font-bold font-mono text-white">{rows.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="block text-[10px] font-mono text-emerald-400 uppercase">VALID ROWS</span>
                <span className="text-xl font-bold font-mono text-emerald-300">{validRows.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
                <span className="block text-[10px] font-mono text-rose-400 uppercase font-bold">INVALID ROWS</span>
                <span className="text-xl font-bold font-mono text-rose-300">{invalidRows.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                <span className="block text-[10px] font-mono text-cyan-400 uppercase">READY TO IMPORT</span>
                <span className="text-xl font-bold font-mono text-cyan-300">{validRows.length}</span>
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-black/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">CODE</th>
                    <th className="p-3">PROJECT TITLE</th>
                    <th className="p-3">SECTOR</th>
                    <th className="p-3">BUDGET (₹ CR)</th>
                    <th className="p-3">PROGRESS %</th>
                    <th className="p-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={r.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20 hover:bg-rose-950/30'}
                    >
                      <td className="p-3 font-mono">
                        {r.isValid ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            VALID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                            <AlertOctagon className="h-3 w-3" /> ERROR ({r.issuesCount})
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-cyan-400 font-bold">{r.code}</td>
                      <td className="p-3 font-bold text-white">{r.name}</td>
                      <td className="p-3">{r.sector}</td>
                      <td className={`p-3 font-mono ${r.originalBudgetCr < 0 ? 'text-rose-400 font-bold bg-rose-950/40' : ''}`}>
                        ₹{r.originalBudgetCr} Cr
                      </td>
                      <td className={`p-3 font-mono ${r.actualPhysicalProgress > 100 ? 'text-rose-400 font-bold bg-rose-950/40' : ''}`}>
                        {r.actualPhysicalProgress}% / {r.targetPhysicalProgress}%
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveRow(r.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Remove Row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 font-mono text-xs hover:text-white transition-colors"
          >
            CANCEL
          </button>

          {hasUploaded && (
            <button
              onClick={handleExecuteImport}
              disabled={validRows.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-bold transition-all shadow-lg ${
                validRows.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold shadow-emerald-500/20 cursor-pointer'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              CONFIRM & IMPORT ({validRows.length} VALID RECORDS)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
