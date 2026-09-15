import type { Project } from '../types';

export type CanonicalStatus = 'ON TRACK' | 'AT RISK' | 'DELAYED';

/**
 * Derives canonical status consistently for any project.
 * 
 * Rules:
 * - DELAYED  → actual completion date has passed OR physical progress is more than 15% behind target
 * - AT RISK  → SPI < 0.85 OR progress gap is 5–15% behind target
 * - ON TRACK → SPI >= 0.85 AND progress is within 5% of target
 * 
 * Uses actual project status when explicitly set in data, avoiding the default 'all delayed' bug.
 */
export function getProjectStatus(project: Project): CanonicalStatus {
  const rawStatus = (project.status || '').trim().toLowerCase();

  // 1. Check real project status field first
  if (rawStatus.includes('track') || rawStatus === 'completed') {
    return 'ON TRACK';
  }
  if (rawStatus.includes('delay') || rawStatus.includes('critical') || rawStatus.includes('overrun')) {
    return 'DELAYED';
  }
  if (rawStatus.includes('risk')) {
    return 'AT RISK';
  }

  // 2. Derive from actual project data if status is not explicitly set
  const target = project.targetPhysicalProgress ?? 100;
  const actual = project.actualPhysicalProgress ?? project.physicalProgress ?? 0;
  const gap = typeof project.progressGap === 'number' 
    ? project.progressGap 
    : (target - actual);
  const spi = project.spi ?? project.schedulePerformanceIndex ?? (target > 0 ? (actual / target) : 1.0);

  // DELAYED: actual completion date has passed OR physical progress is more than 15% behind target
  const targetDateStr = project.revisedTargetDate || project.originalTargetDate;
  const hasTargetPassedIncomplete = Boolean(
    targetDateStr &&
    !isNaN(new Date(targetDateStr).getTime()) &&
    new Date(targetDateStr).getTime() < Date.now() &&
    actual < 100
  );

  if (hasTargetPassedIncomplete || gap > 15) {
    return 'DELAYED';
  }

  // AT RISK: SPI < 0.85 OR progress gap is 5–15% behind target
  if (spi < 0.85 || (gap >= 5 && gap <= 15)) {
    return 'AT RISK';
  }

  // ON TRACK: SPI >= 0.85 AND progress is within 5% of target
  if (spi >= 0.85 && gap <= 5) {
    return 'ON TRACK';
  }

  return gap > 10 ? 'AT RISK' : 'ON TRACK';
}

export interface StatusTheme {
  status: CanonicalStatus;
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeTextCol: string;
  badgeBorder: string;
  cardBg: string;
  leftBorder: string;
  bannerBg: string;
  progressFill: string;
}

export const STATUS_THEMES: Record<CanonicalStatus, StatusTheme> = {
  'ON TRACK': {
    status: 'ON TRACK',
    label: 'On Track',
    badgeText: '✅ ON TRACK',
    badgeBg: 'bg-[#dcfce7]',
    badgeTextCol: 'text-[#15803d]',
    badgeBorder: 'border-[#bbf7d0]',
    cardBg: '#f0fff4',
    leftBorder: '#22c55e',
    bannerBg: '#e8f9ed',
    progressFill: 'bg-[#22c55e]'
  },
  'AT RISK': {
    status: 'AT RISK',
    label: 'At Risk',
    badgeText: '⚠️ AT RISK',
    badgeBg: 'bg-[#fef3c7]',
    badgeTextCol: 'text-[#b45309]',
    badgeBorder: 'border-[#fde68a]',
    cardBg: '#fffdf0',
    leftBorder: '#f59e0b',
    bannerBg: '#fffbeb',
    progressFill: 'bg-[#f59e0b]'
  },
  'DELAYED': {
    status: 'DELAYED',
    label: 'Delayed',
    badgeText: '🔴 DELAYED',
    badgeBg: 'bg-[#fee2e2]',
    badgeTextCol: 'text-[#b91c1c]',
    badgeBorder: 'border-[#fca5a5]',
    cardBg: '#fff5f5',
    leftBorder: '#ef4444',
    bannerBg: '#fef2f2',
    progressFill: 'bg-[#ef4444]'
  }
};
