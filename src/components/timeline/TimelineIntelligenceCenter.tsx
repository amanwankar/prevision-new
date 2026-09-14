import React, { useState, useMemo } from 'react';
import type { Project, Milestone, User, EarlyWarning, RecommendedAction } from '../../types';
import { 
  calculateProgressGap, 
  calculateTimelineVariance, 
  getScheduleStatus, 
  detectDelayedMilestones, 
  getTimelineSignals 
} from '../../services/scheduleIntelligenceService';
import { calculateDataQuality } from '../../services/dataQualityService';
import { ProjectTemporalField } from './ProjectTemporalField';
import { PlannedVsActualTimeline } from './PlannedVsActualTimeline';
import { UpcomingMilestoneRadar } from './UpcomingMilestoneRadar';
import { MilestoneDetailDrawer } from './MilestoneDetailDrawer';
import { MilestoneEditModal } from './MilestoneEditModal';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Edit
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface TimelineIntelligenceCenterProps {
  project: Project;
  currentUser?: User | null;
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onNavigateAlert?: (alertId: string) => void;
  onNavigateAction?: (actionId: string) => void;
  onNavigateEditData?: (projectId: string) => void;
}

export const TimelineIntelligenceCenter: React.FC<TimelineIntelligenceCenterProps> = ({
  project,
  currentUser,
  alerts = [],
  actions = [],
  onBack,
  onUpdateProject,
  onNavigateAlert,
  onNavigateAction,
  onNavigateEditData,
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Table Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'status'>('date');

  // Schedule Engine Metrics
  const progressGap = useMemo(() => calculateProgressGap(project), [project]);
  const variance = useMemo(() => calculateTimelineVariance(project), [project]);
  const scheduleStatus = useMemo(() => getScheduleStatus(project), [project]);
  const delayedMilestones = useMemo(() => detectDelayedMilestones(project), [project]);
  const timelineSignals = useMemo(() => getTimelineSignals(project), [project]);
  const dataQuality = useMemo(() => calculateDataQuality(project), [project]);

  const milestones = project.milestones || [];

  // Filtered & Sorted Milestones
  const filteredMilestones = useMemo(() => {
    return milestones
      .filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;

        if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          return (b.progressPercentage || 0) - (a.progressPercentage || 0);
        }
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        // Date sort default
        const dateA = new Date(a.plannedEndDate || a.expectedDate || '2030').getTime();
        const dateB = new Date(b.plannedEndDate || b.expectedDate || '2030').getTime();
        return dateA - dateB;
      });
  }, [project.milestones, searchTerm, statusFilter, sortBy]);

  const handleSelectMilestoneNode = (m: Milestone) => {
    setSelectedMilestone(m);
    setIsDrawerOpen(true);
  };

  const handleSaveMilestone = (updated: Milestone) => {
    const exists = milestones.some((m) => m.id === updated.id);
    const updatedList = exists
      ? milestones.map((m) => (m.id === updated.id ? updated : m))
      : [updated, ...milestones];

    const updatedProject: Project = {
      ...project,
      milestones: updatedList,
      auditTrail: [
        {
          id: `aud-ms-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: currentUser?.name || 'Officer',
          role: currentUser?.designation || 'Data Manager',
          note: `Milestone "${updated.name}" updated in Timeline Intelligence Center.`,
          actionTaken: 'Milestone Updated',
          previousRiskScore: project.riskScore,
          newRiskScore: project.riskScore,
        },
        ...(project.auditTrail || []),
      ],
    };

    onUpdateProject(updatedProject);
    setSelectedMilestone(updated);
  };

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;

  return (
    <div className={`space-y-8 pb-20 font-sans ${isFocusMode ? 'p-2 bg-black' : ''}`}>
      {/* 1. CINEMATIC HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 border border-cyan-500/30 shadow-2xl">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Project Details</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                TIMELINE INTELLIGENCE CENTER
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              TIMELINE INTELLIGENCE: {project.name}
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Track project execution, detect schedule deviation, and identify emerging delay risk before slippage impacts project completion targets.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
              <div>
                <span className="text-slate-500">CODE:</span> <strong className="text-cyan-400">{project.code}</strong>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">STATUS:</span>{' '}
                <span className={`px-2 py-0.5 rounded font-bold border ${scheduleStatus.badgeStyle}`}>
                  {scheduleStatus.status}
                </span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">QUALITY SCORE:</span>{' '}
                <strong className="text-emerald-400">{dataQuality.overallScore}/100</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              {isFocusMode ? <Minimize2 className="h-4 w-4 text-cyan-400" /> : <Maximize2 className="h-4 w-4 text-cyan-400" />}
              {isFocusMode ? 'EXIT FOCUS MODE' : 'FOCUS CANVAS'}
            </button>

            <button
              onClick={() => {
                setMilestoneToEdit(null);
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-mono text-xs font-extrabold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg cursor-pointer"
            >
              <Plus className="h-4 w-4 fill-current" />
              ADD MILESTONE
            </button>
          </div>
        </div>

        {/* Executive Timeline HUD Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="PLANNED PROGRESS"
            value={`${progressGap.plannedPercent}%`}
            sublabel="target schedule baseline"
            color="cyan"
          />
          <MetricCard
            label="ACTUAL PROGRESS"
            value={`${progressGap.actualPercent}%`}
            sublabel="telemetry physical total"
            color="purple"
          />
          <MetricCard
            label="PROGRESS GAP"
            value={progressGap.formattedGap}
            sublabel={progressGap.isBehind ? 'behind plan' : 'ahead of plan'}
            trend={progressGap.isBehind ? 'down' : 'up'}
            color={progressGap.isBehind ? 'red' : 'emerald'}
          />
          <MetricCard
            label="COMPLETED"
            value={`${completedCount} / ${milestones.length}`}
            sublabel="milestones finished"
            color="emerald"
          />
          <MetricCard
            label="AT RISK / DELAYED"
            value={delayedMilestones.length.toString()}
            sublabel="milestones bottlenecked"
            color="amber"
          />
          <MetricCard
            label="EXPECTED COMPLETION"
            value={variance.expectedCompletionDate.split('-')[0]}
            sublabel={variance.formattedVariance}
            color="slate"
          />
        </div>
      </div>

      {/* 2. SIGNATURE TEMPORAL FIELD CANVAS */}
      <ProjectTemporalField
        project={project}
        milestones={milestones}
        onSelectMilestone={handleSelectMilestoneNode}
        selectedMilestoneId={selectedMilestone?.id}
      />

      {/* 3. COMPARISON & RADAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlannedVsActualTimeline project={project} />
        <UpcomingMilestoneRadar project={project} onSelectMilestone={handleSelectMilestoneNode} />
      </div>

      {/* 4. AI SCHEDULE INTELLIGENCE PANEL */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              AI SCHEDULE INTELLIGENCE & SHAP EXPLANATION
            </h3>
          </div>
          <span className="font-mono text-xs text-rose-400 font-bold">
            SCHEDULE DELAY RISK: {project.riskScore}/100 {project.riskLevel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="font-mono text-xs text-slate-400 uppercase font-bold block">
              SCHEDULE SIGNALS ({timelineSignals.length})
            </span>
            <div className="space-y-2.5">
              {timelineSignals.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    sig.type === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : sig.type === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  <h5 className="font-mono font-bold uppercase tracking-wider text-[11px] mb-1">
                    {sig.title}
                  </h5>
                  <p className="font-sans text-white font-medium">{sig.statement}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{sig.suggestedAction}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-slate-800">
            <span className="font-mono text-xs text-slate-400 uppercase font-bold block">
              RECOMMENDED OFFICER RESPONSE DIRECTIVE
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {scheduleStatus.recommendedAction}
            </p>
            {onNavigateEditData && (
              <button
                onClick={() => onNavigateEditData(project.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all"
              >
                <Edit className="h-4 w-4 text-cyan-400" />
                UPDATE PROJECT DATA & RE-EVALUATE RISK
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MILESTONE DIRECTORY TABLE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono">
            MILESTONES DIRECTORY ({filteredMilestones.length})
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search milestone..."
                className="pl-9 pr-3 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-xs text-slate-300 font-mono"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Delayed">Delayed</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-xs text-slate-300 font-mono"
            >
              <option value="date">SORT BY DATE</option>
              <option value="progress">SORT BY PROGRESS</option>
              <option value="status">SORT BY STATUS</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">STATUS</th>
                <th className="p-3">MILESTONE NAME</th>
                <th className="p-3">PLANNED TARGET</th>
                <th className="p-3">ACTUAL / REVISED</th>
                <th className="p-3">PROGRESS %</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredMilestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        m.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : m.status === 'Delayed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">
                    <button
                      onClick={() => handleSelectMilestoneNode(m)}
                      className="hover:text-cyan-300 transition-colors text-left"
                    >
                      {m.name}
                    </button>
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {m.plannedEndDate || m.expectedDate || 'Unset'}
                  </td>
                  <td className="p-3 font-mono text-cyan-300">
                    {m.actualDate || m.actualEndDate || 'Pending'}
                  </td>
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {m.progressPercentage ?? m.progress ?? 0}%
                      </span>
                      <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${m.progressPercentage ?? m.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setMilestoneToEdit(m);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Milestone"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <MilestoneDetailDrawer
        milestone={selectedMilestone}
        project={project}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEditMilestone={(m) => {
          setIsDrawerOpen(false);
          setMilestoneToEdit(m);
          setIsEditModalOpen(true);
        }}
        onNavigateAlert={
          onNavigateAlert && alerts.length > 0
            ? () => onNavigateAlert(alerts[0]?.id)
            : undefined
        }
        onNavigateAction={
          onNavigateAction && actions.length > 0
            ? () => onNavigateAction(actions[0]?.id)
            : undefined
        }
      />

      {/* Edit Modal */}
      <MilestoneEditModal
        milestone={milestoneToEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveMilestone}
      />
    </div>
  );
};
