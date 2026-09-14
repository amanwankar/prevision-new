import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import type { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const normalized = status.toLowerCase();

  let colorClasses = '';
  let Icon = CheckCircle2;
  let label = status;

  if (normalized.includes('track') || normalized.includes('completed')) {
    // Green
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = CheckCircle2;
    label = 'On Track';
  } else if (normalized.includes('risk')) {
    // Yellow / Amber
    colorClasses = 'bg-amber-50 text-amber-900 border-amber-300';
    Icon = AlertTriangle;
    label = 'At Risk';
  } else if (normalized.includes('delay') || normalized.includes('overrun') || normalized.includes('critical')) {
    // Red
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
    Icon = AlertCircle;
    label = 'Delayed';
  } else {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
    Icon = Clock;
    label = status;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${sizeClasses} ${colorClasses}`}
      title={`Health Status: ${label}`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
