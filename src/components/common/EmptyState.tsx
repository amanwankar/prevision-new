import React from 'react';
import { GlassPanel } from '../motion/GlassPanel';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <GlassPanel variant="dark" className={`p-8 text-center flex flex-col items-center justify-center border-dashed border-slate-800 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3.5 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-slate-200 tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-400 max-w-sm font-mono leading-relaxed mb-4">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-2 transition-all active:scale-95 focus-ring"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </GlassPanel>
  );
};
