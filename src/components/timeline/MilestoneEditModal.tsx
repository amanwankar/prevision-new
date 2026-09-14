import React, { useState } from 'react';
import { X, Save, AlertOctagon } from 'lucide-react';
import type { Milestone } from '../../types';

interface MilestoneEditModalProps {
  milestone?: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMilestone: Milestone) => void;
}

export const MilestoneEditModal: React.FC<MilestoneEditModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(milestone?.name || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [plannedStartDate, setPlannedStartDate] = useState(milestone?.plannedStartDate || '2025-01-01');
  const [plannedEndDate, setPlannedEndDate] = useState(milestone?.plannedEndDate || milestone?.expectedDate || '2026-12-31');
  const [status, setStatus] = useState<Milestone['status']>(milestone?.status || 'In Progress');
  const [progressPercentage, setProgressPercentage] = useState<number>(
    milestone?.progressPercentage ?? milestone?.progress ?? 50
  );
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Milestone name is required.');
      return;
    }

    if (plannedStartDate && plannedEndDate) {
      const start = new Date(plannedStartDate).getTime();
      const end = new Date(plannedEndDate).getTime();
      if (!isNaN(start) && !isNaN(end) && end < start) {
        setErrorMsg('Planned end date cannot be earlier than planned start date.');
        return;
      }
    }

    const updated: Milestone = {
      id: milestone?.id || `ms-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      plannedStartDate,
      plannedEndDate,
      expectedDate: plannedEndDate,
      status,
      progressPercentage,
      progress: progressPercentage,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {milestone ? 'EDIT MILESTONE DATA' : 'ADD NEW MILESTONE'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
              MILESTONE NAME *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Structural Pier Foundations"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-sm text-white focus:border-cyan-400 font-medium"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
              DESCRIPTION / SCOPE
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Package details and technical milestones..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-white focus:border-cyan-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
                PLANNED START DATE
              </label>
              <input
                type="date"
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
                PLANNED END DATE
              </label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
                EXECUTION STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-cyan-300 font-mono font-bold"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-slate-300 font-bold uppercase mb-1">
                PROGRESS % ({progressPercentage}%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-emerald-400 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 font-mono text-xs hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-mono text-xs font-extrabold hover:bg-cyan-400 transition-colors shadow-lg cursor-pointer"
            >
              <Save className="h-4 w-4" />
              SAVE MILESTONE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
