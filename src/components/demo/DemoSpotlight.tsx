import React from 'react';
import { Sparkles } from 'lucide-react';

interface DemoSpotlightProps {
  isActive: boolean;
  stepLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const DemoSpotlight: React.FC<DemoSpotlightProps> = ({
  isActive,
  stepLabel,
  className = '',
  children,
}) => {
  if (!isActive) return <>{children}</>;

  return (
    <div className={`relative transition-all duration-300 ${className}`}>
      {/* Outer Cyan Spotlight Ring */}
      <div className="absolute -inset-2 rounded-2xl border-2 border-cyan-400 opacity-90 animate-pulse pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.4)] z-30" />

      {/* Floating Target Label */}
      {stepLabel && (
        <div className="absolute -top-3.5 left-4 z-40 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-[9px] font-mono px-2.5 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center space-x-1 border border-cyan-300">
          <Sparkles className="w-3 h-3 fill-slate-950" />
          <span>{stepLabel}</span>
        </div>
      )}

      {children}
    </div>
  );
};
