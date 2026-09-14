import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Radio, 
  ShieldAlert, 
  PlayCircle,
  XCircle
} from 'lucide-react';

export type StatusType = 
  | 'New' 
  | 'Open' 
  | 'Acknowledged' 
  | 'In Review' 
  | 'Escalated' 
  | 'Resolved' 
  | 'Pending' 
  | 'In Progress' 
  | 'Completed' 
  | 'Executed' 
  | 'Cancelled';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = {
    New: {
      bg: 'bg-red-500/20 text-red-400 border-red-500/40',
      icon: AlertOctagon,
      pulse: true
    },
    Open: {
      bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: Radio,
      pulse: true
    },
    Acknowledged: {
      bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      icon: Clock,
      pulse: false
    },
    'In Review': {
      bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      icon: Clock,
      pulse: true
    },
    Escalated: {
      bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      icon: ShieldAlert,
      pulse: true
    },
    Resolved: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: CheckCircle2,
      pulse: false
    },
    Pending: {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Clock,
      pulse: true
    },
    'In Progress': {
      bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: PlayCircle,
      pulse: true
    },
    Completed: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: CheckCircle2,
      pulse: false
    },
    Executed: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: CheckCircle2,
      pulse: false
    },
    Cancelled: {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: XCircle,
      pulse: false
    }
  }[status] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Clock,
    pulse: false
  };

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 rounded font-mono font-medium',
    md: 'text-[10px] px-2 py-0.5 rounded-md font-mono font-bold',
    lg: 'text-xs px-2.5 py-1 rounded-lg font-mono font-bold'
  }[size];

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1.5 border uppercase select-none ${config.bg} ${sizeClasses} ${className}`}>
      {config.pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {showIcon && <IconComponent className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      <span>{status}</span>
    </span>
  );
};
