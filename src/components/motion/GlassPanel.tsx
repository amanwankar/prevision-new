import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  reflection?: boolean;
  hoverEffect?: boolean;
  variant?: 'dark' | 'interactive' | 'glowing';
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  reflection = true,
  hoverEffect = false,
  variant = 'dark',
  className = '',
  onClick,
  tabIndex,
  role,
  onKeyDown
}) => {
  const baseStyles = 'rounded-2xl backdrop-blur-xl border shadow-xl relative overflow-hidden transition-all duration-300';
  
  const variantStyles = {
    dark: 'bg-slate-900/65 border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)]',
    interactive: 'bg-slate-900/65 border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.12)] hover:-translate-y-0.5 cursor-pointer',
    glowing: 'bg-slate-900/70 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
  }[variant];

  const hoverClass = hoverEffect ? 'hover:border-cyan-500/40 hover:-translate-y-0.5' : '';
  const reflectionClass = reflection ? 'glass-reflection' : '';

  return (
    <div
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      onKeyDown={onKeyDown}
      className={`${baseStyles} ${variantStyles} ${hoverClass} ${reflectionClass} ${className}`}
    >
      {children}
    </div>
  );
};
