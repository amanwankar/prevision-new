import React from 'react';

interface AIOrbitProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AIOrbit: React.FC<AIOrbitProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
      {/* Outer Rotating Ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-orbit-spin" />
      
      {/* Inner Counter-Rotating Ring */}
      <div className="absolute inset-1 rounded-full border border-purple-500/30 border-dotted animate-orbit-spin-reverse" />
      
      {/* Central Glowing Core */}
      <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-white" />
      </div>
    </div>
  );
};
