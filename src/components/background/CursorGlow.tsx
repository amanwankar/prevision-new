import React, { useEffect, useState, useRef } from 'react';

export const CursorGlow: React.FC = () => {
  const [isTouch, setIsTouch] = useState<boolean>(false);
  const glowRef = useRef<HTMLDivElement | null>(null);
  
  const mousePos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const lerp = (start: number, end: number, amt: number) => {
      return (1 - amt) * start + amt * end;
    };

    const updatePosition = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.12);
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.12);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentPos.current.x - 150}px, ${currentPos.current.y - 150}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-30 transition-opacity duration-300 opacity-60 mix-blend-screen"
      style={{
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 70%)',
        willChange: 'transform'
      }}
    />
  );
};
