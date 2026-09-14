import React from 'react';
import type { IntelligenceEvent } from '../../services/notificationService';
import { 
  X, 
  Clock, 
  Sparkles, 
  FolderKanban, 
  Lightbulb, 
  AlertOctagon
} from 'lucide-react';
import { CommandButton } from '../common/CommandButton';

interface NotificationDetailModalProps {
  event: IntelligenceEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onSelectAction?: (actionId: string) => void;
  onOpenCopilot?: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onSelectProject,
  onSelectAlert,
  onSelectAction,
  onOpenCopilot
}) => {
  if (!isOpen || !event) return null;

  const severityStyles = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    INFO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  }[event.severity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn no-print font-sans">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-slate-100 space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${severityStyles}`}>
                {event.severity} SEVERITY
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: {event.id}</span>
            </div>
            <h3 className="text-base font-black text-white mt-1.5 leading-snug">{event.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description & Details */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
            {event.description}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {event.projectName && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Project Asset</div>
                <div className="font-bold text-white truncate">{event.projectName} ({event.projectCode})</div>
              </div>
            )}

            {event.riskScore !== undefined && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Risk Score</div>
                <div className="font-bold text-red-400">{event.riskScore} / 100</div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">Timestamp</div>
              <div className="font-bold text-slate-300 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{event.createdAt}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">Event Category</div>
              <div className="font-bold text-cyan-400 uppercase text-[10px]">{event.category.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* Resource Links & Navigation Buttons */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {event.projectId && onSelectProject && (
              <CommandButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  onSelectProject(event.projectId!);
                  onClose();
                }}
                className="text-xs"
              >
                <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                <span>VIEW PROJECT</span>
              </CommandButton>
            )}

            {event.warningId && onSelectAlert && (
              <CommandButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  onSelectAlert(event.warningId!);
                  onClose();
                }}
                className="text-xs text-red-300"
              >
                <AlertOctagon className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                <span>VIEW WARNING</span>
              </CommandButton>
            )}

            {event.actionId && onSelectAction && (
              <CommandButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  onSelectAction(event.actionId!);
                  onClose();
                }}
                className="text-xs text-amber-300"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                <span>VIEW ACTION</span>
              </CommandButton>
            )}

            {onOpenCopilot && (
              <CommandButton
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpenCopilot();
                  onClose();
                }}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>ASK PRAEVISIO</span>
              </CommandButton>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
