import React, { useState, useEffect } from 'react';

interface AnimatedRiskScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showRing?: boolean;
  className?: string;
}

export const AnimatedRiskScore: React.FC<AnimatedRiskScoreProps> = ({
  score,
  size = 88,
  strokeWidth = 6,
  showRing = true,
  className = ''
}) => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [pulse, setPulse] = useState<boolean>(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;
    let timerId: ReturnType<typeof setTimeout>;
    const duration = 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(score * easedProgress);
      setCurrentScore(val);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCurrentScore(score);
        setPulse(true);
        timerId = setTimeout(() => setPulse(false), 1200);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (timerId) clearTimeout(timerId);
    };
  }, [score]);

  // Color mapping based on score
  const getColor = (s: number) => {
    if (s >= 85) return { stroke: '#ef4444', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' };
    if (s >= 70) return { stroke: '#f97316', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]' };
    return { stroke: '#10b981', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]' };
  };

  const style = getColor(currentScore);
  const center = size / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {showRing ? (
        <div className={`relative flex items-center justify-center rounded-full transition-shadow duration-500 ${pulse ? style.glow : ''}`}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={style.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
            />
          </svg>

          {/* Number Overlay inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`font-black font-mono text-xl tracking-tight ${style.text}`}>
              {currentScore}
            </span>
            <span className="text-[9px] text-slate-500 font-mono -mt-1">/100</span>
          </div>
        </div>
      ) : (
        <span className={`font-black font-mono ${style.text}`}>
          {currentScore}
        </span>
      )}
    </div>
  );
};
