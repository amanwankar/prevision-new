/**
 * PRAEVISIO Configurable Risk Thresholds & Classification System
 */

export const RISK_THRESHOLDS = {
  LOW_RISK_MAX: 34,      // 0 - 34: Low Risk (Green)
  MEDIUM_RISK_MAX: 74,   // 35 - 74: Medium Risk (Amber)
  HIGH_RISK_MIN: 75,     // 75 - 100: High / Critical Risk (Red)
};

export type RiskCategory = 'Low' | 'Medium' | 'High';

export function getRiskCategory(score: number): RiskCategory {
  if (score >= RISK_THRESHOLDS.HIGH_RISK_MIN) return 'High';
  if (score > RISK_THRESHOLDS.LOW_RISK_MAX) return 'Medium';
  return 'Low';
}

export function getRiskColorClass(score: number): {
  badge: string;
  text: string;
  bg: string;
  border: string;
} {
  const category = getRiskCategory(score);
  switch (category) {
    case 'High':
      return {
        badge: 'bg-red-950 text-red-400 border border-red-800',
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-800/80',
      };
    case 'Medium':
      return {
        badge: 'bg-amber-950 text-amber-300 border border-amber-800',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-800/80',
      };
    case 'Low':
    default:
      return {
        badge: 'bg-teal-950 text-teal-300 border border-teal-800',
        text: 'text-teal-400',
        bg: 'bg-teal-500/10',
        border: 'border-teal-800/80',
      };
  }
}
