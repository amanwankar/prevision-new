import React from 'react';

interface LoadingScannerProps {
  active?: boolean;
  label?: string;
  position?: 'top' | 'bottom';
  className?: string;
}

export const LoadingScanner: React.FC<LoadingScannerProps> = ({
  active = true,
  label,
  position = 'top',
  className = ''
}) => {
  if (!active) return null;

  const posClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div className={`absolute ${posClass} left-0 right-0 h-0.5 overflow-hidden pointer-events-none z-10 ${className}`}>
      <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-ai-scan opacity-80" />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};
