import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  ArrowUpRight 
} from 'lucide-react';

export type ToastType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'RISK';

interface IntelligenceToastProps {
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onActionClick?: () => void;
  onClose: () => void;
}

export const IntelligenceToast: React.FC<IntelligenceToastProps> = ({
  message,
  type = 'INFO',
  actionLabel,
  onActionClick,
  onClose,
}) => {
  const typeStyles = {
    RISK: {
      border: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      bg: 'bg-red-500/10 text-red-400',
      icon: ShieldAlert,
    },
    ERROR: {
      border: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      bg: 'bg-red-500/10 text-red-400',
      icon: ShieldAlert,
    },
    WARNING: {
      border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      bg: 'bg-amber-500/10 text-amber-400',
      icon: AlertTriangle,
    },
    SUCCESS: {
      border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      bg: 'bg-emerald-500/10 text-emerald-400',
      icon: CheckCircle2,
    },
    INFO: {
      border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      bg: 'bg-cyan-500/10 text-cyan-400',
      icon: Info,
    },
  }[type];

  const Icon = typeStyles.icon;

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border ${typeStyles.border} text-slate-100 flex items-center justify-between space-x-3 shadow-2xl animate-bounce no-print font-sans`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className={`p-2 rounded-xl ${typeStyles.bg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="truncate">
          <div className="text-xs font-bold text-white leading-snug truncate">{message}</div>
          <div className="text-[10px] font-mono text-slate-400">PRAEVISIO TELEMETRY DISPATCH</div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {actionLabel && onActionClick && (
          <button
            onClick={onActionClick}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono transition flex items-center space-x-1"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
