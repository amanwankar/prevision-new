import React, { useEffect, useRef } from 'react';

export type BackgroundStateType = 'normal' | 'high_risk' | 'critical' | 'calm' | 'monitoring' | 'warning';

interface IntelligenceFieldProps {
  projectState?: BackgroundStateType;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  color: string;
}

export const IntelligenceField: React.FC<IntelligenceFieldProps> = ({
  projectState = 'normal',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Dynamic particle count based on screen width
    const particleCount = width < 768 ? 30 : 65;
    const particles: Particle[] = [];

    const colors = [
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(139, 92, 246, ',  // Violet
      'rgba(14, 165, 233, ',  // Sky Blue
      'rgba(20, 184, 166, '   // Teal
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.4 - 0.1, // Drifts upward
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.1,
        targetAlpha: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      // Pause rendering if tab is inactive or reduced motion is enabled
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.hidden || prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Smooth opacity oscillation
        if (Math.abs(p.alpha - p.targetAlpha) < 0.02) {
          p.targetAlpha = Math.random() * 0.6 + 0.1;
        }
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;

        // Wrap around boundaries
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // State atmosphere gradient overlays
  const stateGradients = {
    normal: 'from-cyan-900/10 via-purple-950/10 to-transparent',
    calm: 'from-cyan-950/10 via-slate-950 to-transparent',
    monitoring: 'from-teal-950/15 via-slate-950 to-transparent',
    warning: 'from-amber-950/20 via-slate-950 to-transparent',
    high_risk: 'from-orange-950/20 via-slate-950 to-transparent',
    critical: 'from-red-950/30 via-slate-950 to-transparent'
  }[projectState] || 'from-cyan-900/10 via-purple-950/10 to-transparent';

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950 ${className}`}>
      
      {/* LAYER 1: BASE ATMOSPHERE & GRADIENT MESHES */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stateGradients} transition-all duration-1000`} />
      
      {/* Radial Atmospheric Meshes */}
      <div className="absolute -left-40 -top-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px] animate-atmosphere-shift" />
      <div className="absolute -right-40 top-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] animate-atmosphere-shift" style={{ animationDelay: '-8s' }} />
      <div className="absolute left-1/3 bottom-0 w-[550px] h-[550px] rounded-full bg-sky-500/05 blur-[130px] animate-atmosphere-shift" style={{ animationDelay: '-16s' }} />

      {/* LAYER 2: TELEMETRY PARTICLE CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* LAYER 3: INFRASTRUCTURE NETWORK NODES & CONNECTION PULSES */}
      <svg className="absolute inset-0 w-full h-full opacity-25">
        <g stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1">
          <line x1="10%" y1="20%" x2="25%" y2="35%" strokeDasharray="4 4" />
          <line x1="25%" y1="35%" x2="45%" y2="25%" />
          <line x1="45%" y1="25%" x2="70%" y2="40%" />
          <line x1="70%" y1="40%" x2="88%" y2="20%" strokeDasharray="4 4" />
          <line x1="25%" y1="35%" x2="30%" y2="70%" />
          <line x1="45%" y1="25%" x2="55%" y2="75%" />
          <line x1="70%" y1="40%" x2="75%" y2="80%" />
        </g>

        {/* Node Points */}
        <circle cx="10%" cy="20%" r="3" fill="#06b6d4" className="animate-pulse" />
        <circle cx="25%" cy="35%" r="4" fill="#8b5cf6" />
        <circle cx="45%" cy="25%" r="3" fill="#06b6d4" />
        <circle cx="70%" cy="40%" r="4" fill="#f59e0b" className="animate-pulse" />
        <circle cx="88%" cy="20%" r="3" fill="#06b6d4" />
        <circle cx="30%" cy="70%" r="3" fill="#06b6d4" />
        <circle cx="55%" cy="75%" r="4" fill="#8b5cf6" />
        <circle cx="75%" cy="80%" r="3" fill="#06b6d4" />
      </svg>

      {/* LAYER 4: MOVING LIGHT BEAMS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-[800px] h-[120px] bg-gradient-to-r from-transparent via-cyan-500/08 to-transparent blur-3xl animate-beam-sweep" />
        <div className="w-[700px] h-[100px] bg-gradient-to-r from-transparent via-purple-500/08 to-transparent blur-3xl animate-beam-sweep" style={{ animationDelay: '-9s' }} />
      </div>

      {/* LAYER 5: TECHNICAL GRID */}
      <div 
        className="absolute inset-0 animate-grid-scroll opacity-40" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

    </div>
  );
};
