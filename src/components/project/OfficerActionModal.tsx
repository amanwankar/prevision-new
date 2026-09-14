import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import type { Project, ProjectAuditLog } from '../../types';

interface OfficerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updatedProj: Project) => void;
}

export const OfficerActionModal: React.FC<OfficerActionModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject
}) => {
  const [officerNote, setOfficerNote] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Director Infrastructure MoSPI');
  const [actionStatus, setActionStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('In Progress');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: ProjectAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', Today',
      author: assignedOfficer,
      role: 'Inspector',
      note: officerNote || 'Officer review & mitigation workflow updated.',
      actionTaken: `Updated project status to ${actionStatus}`,
      previousRiskScore: project.riskScore,
      newRiskScore: project.riskScore
    };

    const updatedProj: Project = {
      ...project,
      auditTrail: [newLog, ...(project.auditTrail || [])]
    };

    onUpdateProject(updatedProj);
    setToastMsg('Officer decision & audit record saved.');
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-stagger-fade font-sans">
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden glass-reflection text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Officer Decision & Action Center</h2>
              <p className="text-xs text-slate-400 font-mono">{project.code} • {project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMsg ? (
          <div className="my-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-emerald-300 font-mono">{toastMsg}</div>
          </div>
        ) : (
          <form onSubmit={handleSaveAction} className="my-6 space-y-4 text-xs font-sans">
            
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assigned Monitoring Officer
              </label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Action Status Protocol
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="Pending">PENDING REVIEW</option>
                <option value="In Progress">IN PROGRESS (MITIGATION ACTIVE)</option>
                <option value="Completed">COMPLETED & VERIFIED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Officer Mitigation Note & Assessment
              </label>
              <textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Log official inspection findings, contractor instructions, or milestone adjustments..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-extrabold uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Action Record</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
