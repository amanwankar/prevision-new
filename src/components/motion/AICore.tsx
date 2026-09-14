import React from 'react';
import { AI_STATES, type AIStateConfig } from '../../config/motionConfig';

export type AIStateType = 'IDLE' | 'PROCESSING' | 'ANALYZING' | 'PREDICTING' | 'EXPLAINING' | 'WARNING' | 'CRITICAL' | 'COMPLETE';

interface AICoreProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  state?: AIStateType;
  isAnalyzing?: boolean;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export const AICore: React.FC<AICoreProps> = ({
  size = 'md',
  state = 'IDLE',
  isAnalyzing = false,
  showLabel = false,
  className = '',
  onClick,
  onHoverChange
}) => {
  const activeStateKey = isAnalyzing ? 'ANALYZING' : state;
  const config: AIStateConfig = AI_STATES[activeStateKey] || AI_STATES.IDLE;

  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    hero: 'w-48 h-48 sm:w-64 sm:h-64'
  }[size];

  const coreSizes = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-lg',
    hero: 'w-20 h-20 text-2xl'
  }[size];

  const durationMultiplier = 1 / config.speedMultiplier;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      
      <div className={`relative flex items-center justify-center ${dimensions}`}>
        
        {/* Waveform Pulse Aura */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 animate-ping"
          style={{ 
            backgroundColor: config.accentHex,
            animationDuration: `${3 * durationMultiplier}s`
          }} 
        />

        {/* Outer Orbit 1 - Dashed Clockwise */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 animate-orbit-spin transition-all duration-300 group-hover:border-cyan-400 group-hover:scale-105"
          style={{ animationDuration: `${12 * durationMultiplier}s` }}
        >
          <span 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" 
          />
          <span 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#8b5cf6]" 
          />
        </div>

        {/* Inner Orbit 2 - Counter Clockwise */}
        <div 
          className="absolute inset-3 rounded-full border border-purple-500/30 animate-orbit-spin-reverse transition-all duration-300 group-hover:border-purple-400"
          style={{ animationDuration: `${16 * durationMultiplier}s` }}
        >
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
        </div>

        {/* Third Orbit 3 (Large/Hero Size) */}
        {(size === 'xl' || size === 'hero' || config.orbitCount >= 3) && (
          <div 
            className="absolute -inset-3 rounded-full border border-cyan-500/20 animate-orbit-spin opacity-70"
            style={{ animationDuration: `${22 * durationMultiplier}s` }}
          >
            <span className="absolute top-1/4 left-0 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#6366f1]" />
          </div>
        )}

        {/* Central AI Node Core */}
        <div 
          className={`relative ${coreSizes} rounded-full bg-slate-950 border ${config.colorClass} flex items-center justify-center font-mono font-black ${config.glowClass} group-hover:scale-110 transition-all duration-300`}
        >
          <div 
            className="absolute inset-0 rounded-full opacity-40 animate-pulse"
            style={{ backgroundColor: config.accentHex }}
          />
          
          <span className="relative z-10 text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]">
            ◉
          </span>
        </div>

      </div>

      {/* Decorative Label Below AI Core */}
      {showLabel && (
        <div className="mt-4 text-center space-y-0.5">
          <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center justify-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>PRAEVISIO AI CORE</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 tracking-wider">
            STATUS: <span style={{ color: config.accentHex }}>{config.label}</span>
          </div>
        </div>
      )}

    </div>
  );
};
