import type { Project, Milestone } from '../types';

export type ScheduleStatusType = 'ON TRACK' | 'WATCH' | 'DELAYED' | 'AT RISK' | 'INSUFFICIENT DATA';

export interface ProgressGapResult {
  plannedPercent: number;
  actualPercent: number;
  gapPercent: number; // actual - planned (negative means behind plan)
  formattedGap: string;
  isBehind: boolean;
  statusText: string;
}

export interface TimelineVarianceResult {
  originalTargetDate: string;
  revisedTargetDate: string;
  expectedCompletionDate: string;
  delayDays: number;
  formattedVariance: string;
  isExtended: boolean;
}

export interface ScheduleStatusResult {
  status: ScheduleStatusType;
  badgeStyle: string;
  explanation: string;
  recommendedAction: string;
}

export interface UpcomingRadarGroup {
  next7Days: Milestone[];
  next30Days: Milestone[];
  later: Milestone[];
}

export interface ScheduleSignal {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  statement: string;
  impact: string;
  suggestedAction: string;
}

/**
 * Calculates Progress Gap (% difference between actual physical progress and target).
 */
export function calculateProgressGap(project: Project): ProgressGapResult {
  const plannedPercent = project.targetPhysicalProgress ?? 70;
  const actualPercent = project.actualPhysicalProgress ?? 55;
  const gapPercent = Math.round(actualPercent - plannedPercent);
  const isBehind = gapPercent < 0;

  let statusText = 'Physical progress is on track with target schedule.';
  if (gapPercent <= -15) {
    statusText = `Physical progress lags target plan by a significant ${Math.abs(gapPercent)}%.`;
  } else if (gapPercent < 0) {
    statusText = `Physical progress is slightly behind plan by ${Math.abs(gapPercent)}%.`;
  } else if (gapPercent > 0) {
    statusText = `Physical progress is ahead of target plan by +${gapPercent}%.`;
  }

  return {
    plannedPercent,
    actualPercent,
    gapPercent,
    formattedGap: `${gapPercent > 0 ? '+' : ''}${gapPercent}%`,
    isBehind,
    statusText,
  };
}

/**
 * Calculates Timeline Variance between original target date and current expected/revised completion date.
 */
export function calculateTimelineVariance(project: Project): TimelineVarianceResult {
  const originalTargetDate = project.originalTargetDate || '2027-12-31';
  const revisedTargetDate = project.revisedTargetDate || originalTargetDate;
  const expectedCompletionDate = project.aiPredictedDate || revisedTargetDate;

  const origTime = new Date(originalTargetDate).getTime();
  const revTime = new Date(expectedCompletionDate).getTime();

  let delayDays = project.delayDays || 0;
  if (!isNaN(origTime) && !isNaN(revTime) && revTime > origTime) {
    const calculatedDays = Math.round((revTime - origTime) / (1000 * 60 * 60 * 24));
    delayDays = Math.max(delayDays, calculatedDays);
  }

  const isExtended = delayDays > 0;
  const formattedVariance = isExtended ? `+${delayDays} days delay projected` : 'On Original Target Schedule';

  return {
    originalTargetDate,
    revisedTargetDate,
    expectedCompletionDate,
    delayDays,
    formattedVariance,
    isExtended,
  };
}

/**
 * Evaluates Overall Schedule Status State.
 */
export function getScheduleStatus(project: Project): ScheduleStatusResult {
  const gap = calculateProgressGap(project);
  const variance = calculateTimelineVariance(project);
  const delayedMilestones = detectDelayedMilestones(project);

  if (gap.gapPercent <= -15 || variance.delayDays >= 120 || delayedMilestones.length >= 2) {
    return {
      status: 'AT RISK',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      explanation: `Severe schedule slippage detected. Progress gap is ${gap.formattedGap} with ${variance.formattedVariance} and ${delayedMilestones.length} delayed milestone(s).`,
      recommendedAction: 'Convene an emergency sectoral review and request a milestone recovery plan.',
    };
  }

  if (gap.gapPercent < 0 || variance.delayDays > 0 || delayedMilestones.length > 0) {
    return {
      status: 'DELAYED',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      explanation: `Moderate schedule delay. Progress trails target plan by ${Math.abs(gap.gapPercent)}% with projected delay of ${variance.formattedVariance}.`,
      recommendedAction: 'Issue a schedule delay alert to nodal department and expedite bottleneck clearances.',
    };
  }

  if (project.riskScore >= 65) {
    return {
      status: 'WATCH',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      explanation: 'Project physical progress is near baseline, but risk indicators signal emerging schedule pressure.',
      recommendedAction: 'Increase field telemetry updates and monitor upcoming critical milestone deadlines.',
    };
  }

  return {
    status: 'ON TRACK',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    explanation: 'Project execution is fully aligned with target milestones and planned timelines.',
    recommendedAction: 'Maintain routine monthly monitoring and milestone data validation.',
  };
}

/**
 * Detects Delayed Milestones.
 */
export function detectDelayedMilestones(project: Project): Milestone[] {
  if (!project.milestones || project.milestones.length === 0) return [];

  const now = Date.now();

  return project.milestones.filter((m) => {
    if (m.status === 'Delayed') return true;
    if (m.status === 'Completed') return false;

    if (m.plannedEndDate) {
      const pEnd = new Date(m.plannedEndDate).getTime();
      if (!isNaN(pEnd) && pEnd < now && (m.progressPercentage || 0) < 100) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Groups Upcoming Milestones into Radar Urgency categories.
 */
export function detectUpcomingMilestones(project: Project): UpcomingRadarGroup {
  const milestones = project.milestones || [];
  const now = Date.now();
  const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
  const thirtyDays = now + 30 * 24 * 60 * 60 * 1000;

  const next7Days: Milestone[] = [];
  const next30Days: Milestone[] = [];
  const later: Milestone[] = [];

  milestones.forEach((m) => {
    if (m.status === 'Completed') return;

    const endDateStr = m.plannedEndDate || m.expectedDate || project.originalTargetDate;
    const targetTime = new Date(endDateStr).getTime();

    if (isNaN(targetTime)) {
      later.push(m);
      return;
    }

    if (targetTime <= sevenDays) {
      next7Days.push(m);
    } else if (targetTime <= thirtyDays) {
      next30Days.push(m);
    } else {
      later.push(m);
    }
  });

  return { next7Days, next30Days, later };
}

/**
 * Generates Plain-Language Schedule Signals based on actual data.
 */
export function getTimelineSignals(project: Project): ScheduleSignal[] {
  const signals: ScheduleSignal[] = [];
  const gap = calculateProgressGap(project);
  const variance = calculateTimelineVariance(project);
  const delayedMs = detectDelayedMilestones(project);

  if (gap.isBehind) {
    signals.push({
      id: 'sig-gap',
      type: gap.gapPercent <= -15 ? 'CRITICAL' : 'WARNING',
      title: 'PHYSICAL PROGRESS DRIFT',
      statement: `Actual physical progress (${gap.actualPercent}%) is below planned baseline (${gap.plannedPercent}%) by ${Math.abs(gap.gapPercent)}%.`,
      impact: 'Increases the likelihood of project completion date slippage.',
      suggestedAction: 'Reassess contractor resource deployment on key structural packages.',
    });
  }

  if (variance.isExtended) {
    signals.push({
      id: 'sig-variance',
      type: 'WARNING',
      title: 'TARGET COMPLETION EXTENSION',
      statement: `Current expected completion date (${variance.expectedCompletionDate}) exceeds original target (${variance.originalTargetDate}) by +${variance.delayDays} days.`,
      impact: 'Extends capital lock-up and increases total project expenditure.',
      suggestedAction: 'Review delay justifications with nodal department.',
    });
  }

  if (delayedMs.length > 0) {
    signals.push({
      id: 'sig-milestones',
      type: 'CRITICAL',
      title: 'DELAYED MILESTONE BOTTLENECK',
      statement: `${delayedMs.length} milestone(s) (such as "${delayedMs[0]?.name || 'Structural Work'}") are past planned completion dates.`,
      impact: 'Potentially creates downstream delay propagation for dependent packages.',
      suggestedAction: 'Focus officer inspection on bottleneck milestone execution.',
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: 'sig-ok',
      type: 'INFO',
      title: 'SCHEDULE ALIGNED',
      statement: 'All milestones and physical progress metrics are executing according to target schedule.',
      impact: 'Low schedule delay risk forecast.',
      suggestedAction: 'Maintain current monitoring velocity.',
    });
  }

  return signals;
}
