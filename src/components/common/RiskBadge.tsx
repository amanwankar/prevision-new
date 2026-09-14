import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type RiskLevelType = 'Critical' | 'High' | 'Medium' | 'Low';

interface RiskBadgeProps {
  score?: number;
  level?: RiskLevelType;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showIcon?: boolean;
  showPulse?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level,
  size = 'md',
  showScore = true,
  showIcon = true,
  showPulse = true,
  className = ''
}) => {
  // Derive category level from score if level is not explicitly provided
  let category: RiskLevelType = level || 'Low';
  if (score !== undefined && !level) {
    if (score >= 80) category = 'Critical';
    else if (score >= 70) category = 'High';
    else if (score >= 45) category = 'Medium';
    else category = 'Low';
  }

  const styles = {
    Critical: {
      bg: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
      dot: 'bg-red-400',
      icon: ShieldAlert
    },
    High: {
      bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]',
      dot: 'bg-orange-400',
      icon: ShieldAlert
    },
    Medium: {
      bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      dot: 'bg-amber-400',
      icon: AlertTriangle
    },
    Low: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      dot: 'bg-emerald-400',
      icon: CheckCircle2
    }
  }[category];

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 rounded font-mono font-medium',
    md: 'text-[10px] px-2 py-0.5 rounded-md font-mono font-bold',
    lg: 'text-xs px-2.5 py-1 rounded-lg font-mono font-black tracking-wide'
  }[size];

  const IconComponent = styles.icon;

  return (
    <span className={`inline-flex items-center space-x-1.5 border uppercase select-none ${styles.bg} ${sizeClasses} ${className}`}>
      {showPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${styles.dot}`} />
        </span>
      )}
      {showIcon && <IconComponent className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{category}</span>
      {showScore && score !== undefined && (
        <span className="font-bold border-l border-current/30 pl-1 ml-0.5">
          {score}/100
        </span>
      )}
    </span>
  );
};
