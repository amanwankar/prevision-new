import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Zap, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import type { RecommendedAction, Project, User as UserType } from '../types';
import { AlertActionFlowTracker } from './analytics/AlertActionFlowTracker';
import { GlassPanel } from './motion/GlassPanel';

interface ActionDetailsProps {
  action: RecommendedAction;
  project?: Project;
  currentUser?: UserType | null;
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
  onUpdateAction: (updatedAction: RecommendedAction) => void;
  onShowToast?: (message: string) => void;
}

export const ActionDetails: React.FC<ActionDetailsProps> = ({
  action,
  currentUser,
  onBack,
  onSelectProject,
  onUpdateAction,
  onShowToast
}) => {
  const [commentText, setCommentText] = useState<string>('');

  const handleUpdateStatus = (newStatus: RecommendedAction['status']) => {
    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    
    const historyEntry = {
      id: `h-${Date.now()}`,
      changedBy: currentUser?.name || 'Monitoring Officer',
      changedAt: nowIso,
      previousStatus: action.status,
      newStatus
    };

    const updated: RecommendedAction = {
      ...action,
      status: newStatus,
      history: [historyEntry, ...(action.history || [])]
    };

    onUpdateAction(updated);
    if (onShowToast) onShowToast(`Action status changed to ${newStatus} successfully.`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newComment = {
      id: `c-${Date.now()}`,
      comment: commentText,
      author: currentUser?.name || 'Monitoring Officer',
      timestamp: nowIso
    };

    const updated: RecommendedAction = {
      ...action,
      comments: [newComment, ...(action.comments || [])]
    };

    onUpdateAction(updated);
    setCommentText('');
    if (onShowToast) onShowToast('Officer observation note recorded.');
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      
      {/* 1. WORKFLOW PIPELINE TRACKER */}
      <AlertActionFlowTracker currentStage={action.status === 'Completed' ? 'audit' : 'response'} />

      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 font-mono">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 text-yellow-400" />
          <span>Back to Prescriptive Actions Command Center</span>
        </button>

        <span className="text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
          ACTION ID: <strong className="text-yellow-400">{action.id}</strong>
        </span>
      </div>

      {/* 2. MAIN ACTION HEADER CARD */}
      <GlassPanel variant="glowing" className="p-6 space-y-4 border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.15)] relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className={`px-2.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                action.priority === 'Urgent' ? 'bg-rose-950 text-rose-400 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
                action.priority === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-yellow-950 text-yellow-300 border border-yellow-800'
              }`}>
                {action.priority} PRIORITY DIRECTIVE
              </span>

              <span className="text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                CATEGORY: {action.category || 'Schedule Optimization'}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                action.status === 'Completed' || action.status === 'Executed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                action.status === 'In Progress' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                STATUS: {action.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-3">
              <Zap className="w-7 h-7 text-yellow-400 shrink-0" />
              <span>{action.title}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <button 
                onClick={() => onSelectProject(action.projectId)}
                className="font-bold text-cyan-400 hover:underline flex items-center space-x-1 font-sans text-sm"
              >
                <span>Project: {action.projectName} ({action.projectCode})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <span>•</span>
              <span className="text-slate-400">{action.department}</span>
            </div>
          </div>

          <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 flex items-center space-x-5 shrink-0 shadow-inner font-mono text-xs">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">AI CONFIDENCE</span>
              <span className="text-2xl font-black text-cyan-400">{action.aiConfidenceScore}%</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">TARGET RESOLUTION</span>
              <span className="text-xs font-bold text-white font-sans">{action.targetResolutionDate || '2026-09-30'}</span>
            </div>
          </div>

        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1 text-xs">
          <span className="text-[10px] uppercase font-mono font-bold text-yellow-400 block">PRESCRIPTIVE DIRECTIVE RATIONALE:</span>
          <p className="text-slate-200 leading-relaxed font-sans">{action.rationale}</p>
        </div>

      </GlassPanel>

      {/* 3. EXECUTION WORKFLOW STEPPER & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Workflow Stepper & Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Workflow Stepper */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  ACTION EXECUTION STEPPER & AUDIT
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400">STATE CONTROL</span>
            </div>

            {/* Stepper Display */}
            <div className="flex items-center justify-between text-xs font-bold p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className={`flex items-center space-x-2 ${
                action.status === 'Pending' ? 'text-yellow-400' : 'text-cyan-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                  action.status === 'Pending' ? 'bg-yellow-950 border border-yellow-800 text-yellow-400' : 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                }`}>1</div>
                <span>Pending</span>
              </div>

              <div className="h-0.5 flex-1 bg-slate-800 mx-4" />

              <div className={`flex items-center space-x-2 ${
                action.status === 'In Progress' ? 'text-cyan-400 font-black' :
                action.status === 'Completed' || action.status === 'Executed' ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                  action.status === 'In Progress' ? 'bg-cyan-950 border border-cyan-800 text-cyan-400 ring-2 ring-cyan-500/50' :
                  action.status === 'Completed' || action.status === 'Executed' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-slate-900 text-slate-600'
                }`}>2</div>
                <span>In Progress</span>
              </div>

              <div className="h-0.5 flex-1 bg-slate-800 mx-4" />

              <div className={`flex items-center space-x-2 ${
                action.status === 'Completed' || action.status === 'Executed' ? 'text-emerald-400 font-black' : 'text-slate-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                  action.status === 'Completed' || action.status === 'Executed' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-slate-900 text-slate-600'
                }`}>3</div>
                <span>Completed</span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono">
              <span className="text-xs text-slate-400 font-bold">STATE CONTROL:</span>

              {action.status !== 'In Progress' && (
                <button
                  onClick={() => handleUpdateStatus('In Progress')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_12px_rgba(234,179,8,0.3)] transition"
                >
                  SET TO "IN PROGRESS"
                </button>
              )}

              {action.status !== 'Completed' && action.status !== 'Executed' && (
                <button
                  onClick={() => handleUpdateStatus('Completed')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>MARK AS "COMPLETED"</span>
                </button>
              )}

              {action.status !== 'Cancelled' && (
                <button
                  onClick={() => handleUpdateStatus('Cancelled')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  CANCEL ACTION
                </button>
              )}
            </div>

            {/* History Logs */}
            {action.history && action.history.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">STATUS TRANSITION AUDIT TRAIL:</span>
                <div className="space-y-2">
                  {action.history.map((h, i) => (
                    <div key={h.id || i} className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                      <span>Changed by <strong>{h.changedBy}</strong> ({h.previousStatus} → {h.newStatus})</span>
                      <span className="text-slate-500 text-[10px]">{h.changedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Officer Notes Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-yellow-400" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  OFFICER EXECUTION NOTES LOG
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">FIELD TELEMETRY</span>
            </div>

            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Log operational update or field execution observation note..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black font-mono text-xs rounded-xl shadow-[0_0_12px_rgba(234,179,8,0.3)] flex items-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>POST OFFICER NOTE</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5 pt-2">
              {(action.comments && action.comments.length > 0) ? (
                action.comments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1 font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-yellow-400 font-bold">{c.author}</span>
                      <span className="text-slate-500">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs font-sans">{c.comment}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-center font-mono text-[11px] text-slate-500">
                  No execution notes recorded for this action yet.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Execution Context & Metadata */}
        <div className="lg:col-span-4 space-y-6 font-mono text-xs">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-extrabold text-white uppercase tracking-wider">EXECUTION METADATA</span>
              <span className="text-[10px] text-yellow-400 font-bold">ASSIGNMENT</span>
            </div>

            <div className="space-y-3 font-sans">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 font-mono">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">EXPECTED IMPACT</span>
                <span className="text-slate-200 font-bold font-sans text-xs">{action.expectedImpact}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 font-mono">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">ASSIGNED OFFICER</span>
                <span className="text-slate-200 font-bold font-sans text-xs">{action.assignedTo || 'Monitoring Officer'} ({action.assignedRole || 'PIU'})</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 font-mono">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">TARGET DUE DATE</span>
                <span className="text-yellow-400 font-bold text-xs">{action.targetResolutionDate || '2026-09-30'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
