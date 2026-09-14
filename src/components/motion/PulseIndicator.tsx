import React from 'react';

interface PulseIndicatorProps {
  color?: 'emerald' | 'cyan' | 'amber' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  color = 'cyan',
  size = 'md',
  label,
  className = ''
}) => {
  const colors = {
    emerald: 'bg-emerald-400 text-emerald-400',
    cyan: 'bg-cyan-400 text-cyan-400',
    amber: 'bg-amber-400 text-amber-400',
    red: 'bg-red-500 text-red-500',
    orange: 'bg-orange-400 text-orange-400'
  }[color];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }[size];

  return (
    <span className={`inline-flex items-center space-x-1.5 font-mono text-[10px] font-bold ${className}`}>
      <span className={`${dotSizes} rounded-full ${colors} animate-status-pulse shrink-0`} />
      {label && <span>{label}</span>}
    </span>
  );
};
