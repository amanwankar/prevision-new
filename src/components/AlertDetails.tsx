import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Send,
  Zap,
  Activity
} from 'lucide-react';
import type { EarlyWarning, Project, User as UserType } from '../types';
import { AlertActionFlowTracker } from './analytics/AlertActionFlowTracker';
import { AnimatedProgress } from './motion/AnimatedProgress';
import { GlassPanel } from './motion/GlassPanel';

interface AlertDetailsProps {
  alert: EarlyWarning;
  project?: Project;
  currentUser?: UserType | null;
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
  onUpdateAlert: (updatedAlert: EarlyWarning) => void;
  onShowToast?: (message: string) => void;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  project,
  currentUser,
  onBack,
  onSelectProject,
  onUpdateAlert,
  onShowToast
}) => {
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  // Assign Modal Form State
  const [assignee, setAssignee] = useState<string>(alert.assignedOfficer || 'Project Monitoring Officer');
  const [assignPriority, setAssignPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>(alert.severity);
  const [assignComment, setAssignComment] = useState<string>('');

  // Note Modal Form State
  const [noteText, setNoteText] = useState<string>('');

  const formattedTimestamp = alert.timestamp || new Date().toLocaleString();

  // Handlers for Officer Actions
  const handleConfirmAcknowledge = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newTimeline = [
      ...(alert.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: nowStr,
        event: `Warning officially acknowledged by ${currentUser?.name || 'Officer'}.`,
        user: currentUser?.name || 'Officer'
      }
    ];

    const updated: EarlyWarning = {
      ...alert,
      status: 'Acknowledged',
      timeline: newTimeline
    };

    onUpdateAlert(updated);
    if (onShowToast) onShowToast('Early Warning officially acknowledged.');
  };

  const handleResolveWarning = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newTimeline = [
      ...(alert.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: nowStr,
        event: `Early Warning marked RESOLVED following site verification by ${currentUser?.name || 'Officer'}.`,
        user: currentUser?.name || 'Officer'
      }
    ];

    const updated: EarlyWarning = {
      ...alert,
      status: 'Resolved',
      timeline: newTimeline
    };

    onUpdateAlert(updated);
    if (onShowToast) onShowToast('Early Warning marked as Resolved.');
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newTimeline = [
      ...(alert.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: nowStr,
        event: `Review assigned to ${assignee} (${assignPriority} Priority). ${assignComment ? `Note: ${assignComment}` : ''}`,
        user: currentUser?.name || 'Admin'
      }
    ];

    const updated: EarlyWarning = {
      ...alert,
      assignedOfficer: assignee,
      severity: assignPriority,
      status: 'In Review',
      timeline: newTimeline
    };

    onUpdateAlert(updated);
    setShowAssignModal(false);
    if (onShowToast) onShowToast(`Warning assigned to ${assignee} (Status: In Review).`);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newNote = {
      id: `note-${Date.now()}`,
      note: noteText,
      author: currentUser?.name || 'Monitoring Officer',
      role: currentUser?.designation || 'Project Officer',
      timestamp: nowIso
    };

    const updated: EarlyWarning = {
      ...alert,
      notes: [newNote, ...(alert.notes || [])]
    };

    onUpdateAlert(updated);
    setNoteText('');
    if (onShowToast) onShowToast('Officer observation note recorded.');
  };

  // Determine active stage for workflow pipeline
  const currentWorkflowStage = 
    alert.status === 'Resolved' ? 'audit' :
    alert.status === 'In Review' ? 'response' :
    alert.status === 'Acknowledged' ? 'recommendation' : 'warning';

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      
      {/* 1. PIPELINE TRACKER */}
      <AlertActionFlowTracker currentStage={currentWorkflowStage} />

      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 font-mono">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to Early Warnings Queue</span>
        </button>

        <span className="text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
          CASE FILE REF: <strong className="text-cyan-400">{alert.id}</strong>
        </span>
      </div>

      {/* 2. MAIN CASE FILE HERO BANNER */}
      <GlassPanel 
        variant={alert.severity === 'Critical' ? 'glowing' : 'dark'} 
        className={`p-6 space-y-5 relative overflow-hidden ${
          alert.severity === 'Critical' ? 'border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)]' :
          alert.severity === 'High' ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]' : 'border-slate-800'
        }`}
      >
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className={`px-2.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                alert.severity === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
                alert.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {alert.severity} PRIORITY CASE FILE
              </span>

              <span className={`px-2.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                alert.status === 'Open' || alert.status === 'New' ? 'bg-rose-900 text-white' :
                alert.status === 'Acknowledged' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                alert.status === 'In Review' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                STATUS: {alert.status}
              </span>

              <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                TRIGGER: {alert.triggerCondition || 'Automated Telemetry Scan'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <AlertOctagon className={`w-8 h-8 shrink-0 ${
                alert.severity === 'Critical' ? 'text-rose-500 animate-pulse' : 'text-amber-400'
              }`} />
              <span>{alert.title}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <button 
                onClick={() => onSelectProject(alert.projectId)}
                className="font-bold text-cyan-400 hover:underline flex items-center space-x-1 font-sans text-sm"
              >
                <span>Project: {alert.projectName} ({alert.projectCode})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <span>•</span>
              <span className="text-slate-400">{alert.department}</span>
              <span>•</span>
              <span className="text-slate-400">Location: {alert.location || 'India'}</span>
            </div>
          </div>

          {/* AI Risk Score Hero Circular Gauge */}
          <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 flex items-center space-x-5 shrink-0 shadow-inner">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    (alert.riskScore || 82) >= 75 ? 'text-rose-500' :
                    (alert.riskScore || 82) >= 55 ? 'text-amber-400' : 'text-cyan-400'
                  }
                  strokeDasharray={`${alert.riskScore || 82}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-black text-white">{alert.riskScore || 82}</span>
                <span className="text-[8px] text-slate-500">SCORE</span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">ASSIGNED MONITORING OFFICER</div>
              <div className="font-bold text-white text-sm font-sans">{alert.assignedOfficer || 'Officer-in-Charge'}</div>
              <div className="text-[10px] text-slate-500">Detected: {formattedTimestamp}</div>
            </div>
          </div>

        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
          <strong className="text-cyan-400 font-mono block text-[10px] uppercase mb-1">SYSTEM DETECTED OBSERVATION RATIONALE:</strong>
          {alert.description}
        </div>

      </GlassPanel>

      {/* 3. XAI EXPLANATION PANEL & RISK DRIVERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: XAI Explanation Factors */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  WHY WAS THIS WARNING GENERATED? (XAI DRIVERS)
                </h2>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">CONFIGURED RISK ENGINE</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The PRAEVISIO Predictive Risk Engine continuously evaluates project baseline progress against physical telemetry. This early warning was triggered by compounding signals across the following risk drivers:
            </p>

            <div className="space-y-4">
              
              {/* Factor 1: Schedule Progress Gap */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Physical Progress Gap (Planned vs Actual)</span>
                  <span className="text-rose-400 font-bold">CONTRIBUTION: +38 PTS</span>
                </div>
                <AnimatedProgress value={78} color="rose" height="md" />
                <div className="text-[11px] text-slate-300 font-sans">
                  Actual physical completion ({project?.actualPhysicalProgress || 48}%) lags baseline target ({project?.targetPhysicalProgress || 65}%) by a gap of {Math.max(10, (project?.targetPhysicalProgress || 65) - (project?.actualPhysicalProgress || 48))}%.
                </div>
              </div>

              {/* Factor 2: Milestone Slippage */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Milestone Delay & Phase Hold</span>
                  <span className="text-amber-400 font-bold">CONTRIBUTION: +26 PTS</span>
                </div>
                <AnimatedProgress value={62} color="amber" height="md" />
                <div className="text-[11px] text-slate-300 font-sans">
                  Section 4 land acquisition clearance and structural foundation milestone delayed by &gt;90 days.
                </div>
              </div>

              {/* Factor 3: Cost Utilization Velocity */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Cost Utilization vs Progress Variance</span>
                  <span className="text-yellow-400 font-bold">CONTRIBUTION: +18 PTS</span>
                </div>
                <AnimatedProgress value={45} color="yellow" height="md" />
                <div className="text-[11px] text-slate-300 font-sans">
                  Financial expenditure velocity exceeds physical work accomplishment, generating potential cost overrun risk forecast of ₹{project?.costOverrunForecastCr || 85} Cr.
                </div>
              </div>

            </div>
          </div>

          {/* 4. WARNING EVOLUTION TIMELINE */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  WARNING EVOLUTION & AUDIT LIFECYCLE
                </h2>
              </div>
              <span className="text-[10px] text-purple-400">IMMUTABLE LOG</span>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 font-mono before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {(alert.timeline || [
                { id: 't1', timestamp: '08:30 AM Today', event: 'Risk telemetry threshold exceeded (Risk Score: 82).' },
                { id: 't2', timestamp: '09:00 AM Today', event: 'Early Warning generated and dispatched to queue.' }
              ]).map((evt, idx) => (
                <div key={evt.id || idx} className="relative flex items-start space-x-3 text-xs">
                  <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400" />
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold text-[10px]">{evt.timestamp}</span>
                      {evt.user && <span className="text-slate-500 text-[10px]">Officer: {evt.user}</span>}
                    </div>
                    <div className="text-slate-200 font-sans">{evt.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. OFFICER NOTES & COMMENTS FEED */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  OFFICER OBSERVATION NOTES & AUDIT FEED
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">AUTHENTICATED LOG</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-2">
              <textarea
                rows={3}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log officer observation update or verification note..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>RECORD OFFICER NOTE</span>
                </button>
              </div>
            </form>

            {/* Existing Notes */}
            <div className="space-y-2.5 pt-2">
              {(alert.notes && alert.notes.length > 0) ? (
                alert.notes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-cyan-400 font-bold">{n.author} ({n.role || 'Monitoring Officer'})</span>
                      <span className="text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs font-sans">{n.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-center font-mono text-[11px] text-slate-500">
                  No officer observation notes logged for this case file yet.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Sticky Officer Action Panel & Prescriptive Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sticky Officer Response Panel */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 space-y-4 sticky top-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  OFFICER RESPONSE PANEL
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">STATE CONTROLS</span>
            </div>

            <div className="space-y-3 font-sans">
              
              {/* 1. Acknowledge Warning */}
              {alert.status === 'Open' || alert.status === 'New' ? (
                <button
                  onClick={handleConfirmAcknowledge}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACKNOWLEDGE WARNING</span>
                </button>
              ) : (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/80 rounded-2xl text-cyan-300 font-mono text-[11px] text-center font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>ACKNOWLEDGED BY OFFICER ✓</span>
                </div>
              )}

              {/* 2. Assign Review */}
              <button
                onClick={() => setShowAssignModal(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center space-x-2 transition font-mono"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>ASSIGN REVIEW OFFICER</span>
              </button>

              {/* 3. Resolve Warning */}
              {alert.status !== 'Resolved' ? (
                <button
                  onClick={handleResolveWarning}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition font-mono"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>MARK CASE RESOLVED</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-emerald-300 font-mono text-[11px] text-center font-bold flex items-center justify-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CASE FILE RESOLVED ✓</span>
                </div>
              )}

            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
              <div>Assigned: <strong className="text-white">{alert.assignedOfficer || 'Unassigned'}</strong></div>
              <div>Department: <strong className="text-slate-300">{alert.department}</strong></div>
              <div>Last Status: <strong className="text-cyan-400">{alert.status}</strong></div>
            </div>
          </div>

          {/* System Prescriptive Recommended Response */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  SYSTEM RECOMMENDED RESPONSE
                </h3>
              </div>
              <span className="text-[10px] text-amber-400">PRESCRIPTIVE</span>
            </div>

            <div className="space-y-3 font-sans">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-amber-400 font-bold">RECOMMENDED DIRECTIVE #1</span>
                  <span className="text-slate-500">High Priority</span>
                </div>
                <div className="font-bold text-white text-xs">
                  {alert.recommendedAction || 'Conduct joint review with project implementation unit (PIU) regarding land acquisition clearance.'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Rationale: Progress gap exceeds baseline thresholds by &gt;15%.
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-cyan-400 font-bold">RECOMMENDED DIRECTIVE #2</span>
                  <span className="text-slate-500">Medium Priority</span>
                </div>
                <div className="font-bold text-white text-xs">
                  Re-evaluate resource allocation for Section 4 structural contractor.
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Rationale: Milestone slippage risks delaying phase 2 commissioning.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ASSIGN REVIEW OFFICER MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-scale-up font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-mono">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  ASSIGN REVIEW OFFICER
                </h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              
              <div className="space-y-1 font-mono">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Officer Name</label>
                <input
                  type="text"
                  required
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Priority Level</label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 font-mono"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Directive Instructions</label>
                <textarea
                  rows={3}
                  value={assignComment}
                  onChange={(e) => setAssignComment(e.target.value)}
                  placeholder="Enter specific instructions for the assigned officer..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Confirm Assignment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
