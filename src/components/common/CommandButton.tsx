import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const CommandButton: React.FC<CommandButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  loadingLabel = 'PROCESSING...',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/40 active:scale-95',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700/80 hover:border-cyan-500/40 active:scale-95 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white border border-transparent active:scale-95',
    danger: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500/40 active:scale-95',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40 active:scale-95',
    icon: 'p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 active:scale-95'
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1.5 rounded-lg space-x-1 font-mono',
    md: 'text-xs px-3.5 py-2 rounded-xl space-x-1.5',
    lg: 'text-sm px-5 py-2.5 rounded-xl space-x-2'
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-current" />
          <span className="font-mono text-[10px] font-bold tracking-wider">{loadingLabel}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};
