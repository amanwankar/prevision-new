import React from 'react';
import { GlassPanel } from '../motion/GlassPanel';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon?: LucideIcon;
  color?: 'cyan' | 'purple' | 'amber' | 'red' | 'emerald' | 'slate';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  glassLevel?: 1 | 2 | 3 | 4;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'cyan',
  trend,
  trendValue,
  glassLevel = 2,
  onClick,
  className = ''
}) => {
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      hover: 'hover:border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      hover: 'hover:border-purple-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      hover: 'hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    },
    red: {
      text: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      hover: 'hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      hover: 'hover:border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    slate: {
      text: 'text-slate-300',
      bg: 'bg-slate-900/80 border-slate-800',
      hover: 'hover:border-slate-700'
    }
  }[color];

  const variantMap = {
    1: 'dark',
    2: 'interactive',
    3: 'glowing',
    4: 'interactive'
  } as const;

  return (
    <GlassPanel
      variant={variantMap[glassLevel]}
      reflection
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-4 transition-all duration-300 ${colorMap.bg} ${colorMap.hover} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 focus-ring' : ''} ${className}`}
    >
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${colorMap.text}`} aria-hidden="true" />}
      </div>

      <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
        <div className={`text-xl sm:text-2xl font-black tracking-tight text-white font-mono break-words-safe`}>
          {typeof value === 'number' && Number.isFinite(value) ? <AnimatedNumber value={value} /> : (value ?? '—')}
        </div>

        {trend && (
          <div className="flex items-center space-x-0.5 text-[10px] font-mono font-bold shrink-0">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-400" />}
            {trend === 'neutral' && <Minus className="w-3 h-3 text-slate-500" />}
            {trendValue && <span className={trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-400'}>{trendValue}</span>}
          </div>
        )}
      </div>

      {sublabel && (
        <div className="text-[10px] text-slate-500 font-mono mt-1 line-clamp-1">{sublabel}</div>
      )}
    </GlassPanel>
  );
};
