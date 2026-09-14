import React, { useState, useEffect } from 'react';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: string;
  variant?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'warning' | 'danger';
  glow?: boolean;
  height?: string;
  delay?: number;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  color,
  variant,
  glow = false,
  height = 'h-2',
  delay = 0,
  className = ''
}) => {
  const [width, setWidth] = useState<number>(0);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  const variantColors: Record<string, string> = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-500',
    amber: 'bg-amber-400',
    warning: 'bg-amber-500',
    emerald: 'bg-emerald-400',
    danger: 'bg-red-500'
  };

  const glowStyles: Record<string, string> = {
    cyan: 'shadow-[0_0_8px_#06b6d4]',
    purple: 'shadow-[0_0_8px_#8b5cf6]',
    amber: 'shadow-[0_0_8px_#f59e0b]',
    warning: 'shadow-[0_0_8px_#f59e0b]',
    emerald: 'shadow-[0_0_8px_#10b981]',
    danger: 'shadow-[0_0_8px_#ef4444]'
  };

  const selectedColor = color || (variant ? variantColors[variant] : 'bg-cyan-400');
  const glowClass = glow && variant ? glowStyles[variant] : glow ? 'shadow-[0_0_8px_#06b6d4]' : '';

  return (
    <div className={`w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 ${height} ${className}`}>
      <div 
        className={`h-full ${selectedColor} ${glowClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};
