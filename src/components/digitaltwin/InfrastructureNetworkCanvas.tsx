import React, { useState, useEffect, useRef } from 'react';
import type { VisualNode, NetworkConnection, VisualizationMode } from '../../services/infrastructureVisualizationService';
import { 
  Lightbulb, 
  Radio, 
  ShieldAlert,
  Compass,
  Cpu
} from 'lucide-react';

interface InfrastructureNetworkCanvasProps {
  nodes: VisualNode[];
  connections: NetworkConnection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  mode: VisualizationMode;
  isScanning: boolean;
  highlightedNodeId?: string | null;
}

export const InfrastructureNetworkCanvas: React.FC<InfrastructureNetworkCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  mode,
  isScanning,
  highlightedNodeId,
}) => {
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);
  const [pulseOffset, setPulseOffset] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate connection pulses
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPulseOffset((prev) => (prev + 0.008) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Ambient Particle Engine on Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate lightweight particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint grid pattern
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getNodeColor = (node: VisualNode) => {
    if (node.status === 'Completed') return '#10b981'; // Emerald
    if (mode === 'RISK') {
      if (node.riskScore >= 80) return '#ef4444'; // Red
      if (node.riskScore >= 65) return '#f97316'; // Orange
      if (node.riskScore >= 45) return '#f59e0b'; // Amber
      return '#10b981'; // Emerald
    }
    if (mode === 'PROGRESS') {
      if (node.progressGap <= -15) return '#ef4444';
      if (node.progressGap <= -5) return '#f59e0b';
      return '#06b6d4';
    }
    if (mode === 'WARNINGS') {
      if (node.warningCount > 0) return '#ef4444';
      return '#334155';
    }
    if (mode === 'ACTIONS') {
      if (node.actionCount > 0) return '#f59e0b';
      return '#334155';
    }
    
    // Default OVERVIEW mode colors based on risk
    if (node.riskLevel === 'Critical') return '#ef4444';
    if (node.riskLevel === 'High') return '#f97316';
    if (node.riskLevel === 'Medium') return '#f59e0b';
    return '#06b6d4';
  };

  const isDimmed = (nodeId: string) => {
    if (!selectedNodeId) return false;
    if (selectedNodeId === nodeId) return false;
    // Keep connected nodes bright as well
    const isConnected = connections.some(
      (c) => (c.sourceId === selectedNodeId && c.targetId === nodeId) || (c.targetId === selectedNodeId && c.sourceId === nodeId)
    );
    return !isConnected;
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] bg-slate-950/90 rounded-2xl border border-slate-800/80 shadow-[0_0_50px_rgba(3,7,18,0.8)] overflow-hidden flex flex-col justify-between">
      
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 2.5D Technical Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Digital Scanline Overlay Effect */}
      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] z-30 animate-pulse pointer-events-none transition-all duration-300 top-0 bottom-0 m-auto" />
      )}

      {/* Canvas Top HUD Metadata */}
      <div className="relative z-10 p-3.5 flex items-center justify-between pointer-events-none border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-sm">
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
            <Compass className="w-3 h-3 text-cyan-400 animate-spin-slow" />
            <span className="text-slate-300 font-bold">GRID PERSPECTIVE 2.5D</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>NODES: {nodes.length}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-teal-400">
            <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
            <span>TELEMETRY: ACTIVE</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-bold uppercase">{mode} MODE</span>
        </div>
      </div>

      {/* SVG Network Canvas Layer */}
      <div className="relative flex-1 w-full h-full z-10 overflow-hidden">
        <svg className="w-full h-full">
          {/* Render Connections */}
          {connections.map((conn) => {
            const sourceNode = nodes.find((n) => n.id === conn.sourceId);
            const targetNode = nodes.find((n) => n.id === conn.targetId);
            if (!sourceNode || !targetNode) return null;

            const isSelectedConn = selectedNodeId && (conn.sourceId === selectedNodeId || conn.targetId === selectedNodeId);
            const isWarningPath = conn.status === 'warning_signal';

            // Calculate pulse dot location along line
            const pulseX = sourceNode.x + (targetNode.x - sourceNode.x) * pulseOffset;
            const pulseY = sourceNode.y + (targetNode.y - sourceNode.y) * pulseOffset;

            return (
              <g key={conn.id}>
                {/* Base Link Line */}
                <line
                  x1={`${sourceNode.x}%`}
                  y1={`${sourceNode.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke={isSelectedConn ? '#06b6d4' : isWarningPath ? '#ef4444' : '#1e293b'}
                  strokeWidth={isSelectedConn ? 2.5 : isWarningPath ? 1.5 : 1}
                  strokeDasharray={isWarningPath ? '4,4' : 'none'}
                  opacity={isSelectedConn ? 0.9 : 0.4}
                />

                {/* Traveling Signal Pulse Dot */}
                {(isSelectedConn || isWarningPath || mode === 'OVERVIEW') && (
                  <circle
                    cx={`${pulseX}%`}
                    cy={`${pulseY}%`}
                    r={isSelectedConn ? 3 : 2}
                    fill={isSelectedConn ? '#06b6d4' : isWarningPath ? '#ef4444' : '#38bdf8'}
                    className="shadow-[0_0_8px_#06b6d4]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Intelligent Project Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodeId === node.id;
          const dimmed = isDimmed(node.id);
          const color = getNodeColor(node);

          const isCritical = node.riskScore >= 75 || node.riskLevel === 'Critical';
          const hasWarning = node.warningCount > 0;
          const hasAction = node.actionCount > 0;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 ${
                dimmed ? 'opacity-20 scale-90' : 'opacity-100 scale-100'
              }`}
              onClick={() => onSelectNode(node.id)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer Pulse Halos */}
              {isCritical && (
                <div
                  className="absolute -inset-3 rounded-full opacity-75 animate-ping pointer-events-none"
                  style={{ backgroundColor: color }}
                />
              )}

              {isSelected && (
                <div className="absolute -inset-4 rounded-full border-2 border-cyan-400 opacity-80 animate-pulse pointer-events-none shadow-[0_0_20px_#06b6d4]" />
              )}

              {isHighlighted && (
                <div className="absolute -inset-5 rounded-full border border-teal-300 animate-bounce pointer-events-none" />
              )}

              {/* Node Main Visual Container */}
              <div
                className={`relative rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2 ${
                  isSelected
                    ? 'w-10 h-10 border-white shadow-[0_0_25px_rgba(6,182,212,0.8)] scale-110'
                    : 'w-7 h-7 sm:w-8 sm:h-8 border-slate-900 hover:scale-125'
                }`}
                style={{ backgroundColor: color }}
              >
                {/* Node Center Icon / Class Marker */}
                <div className="text-slate-950 font-black text-[10px]">
                  {node.assetClass === 'highway' ? 'HW' :
                   node.assetClass === 'bridge' ? 'RL' :
                   node.assetClass === 'metro' ? 'MT' :
                   node.assetClass === 'power_grid' ? 'PW' :
                   node.assetClass === 'port' ? 'PT' : 'SC'}
                </div>

                {/* Warning / Action Indicator Badge Overlay */}
                {(hasWarning || hasAction) && (
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                    {hasWarning ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Permanent Project Code Label underneath */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-[9px] font-mono font-bold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/80 whitespace-nowrap shadow-md pointer-events-none">
                {node.code}
              </div>
            </div>
          );
        })}

        {/* Hover Information Tooltip Card */}
        {hoveredNode && (
          <div
            style={{
              left: `${Math.min(75, Math.max(10, hoveredNode.x))}%`,
              top: `${Math.max(15, hoveredNode.y - 12)}%`,
            }}
            className="absolute transform -translate-x-1/2 -translate-y-full mb-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] z-30 pointer-events-none space-y-2 animate-fadeIn"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[9px] font-mono text-cyan-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 inline-block">
                  {hoveredNode.code} • {hoveredNode.sector}
                </div>
                <div className="text-xs font-black text-white mt-1 leading-tight">{hoveredNode.name}</div>
              </div>
              <div 
                className="text-[10px] font-bold px-2 py-0.5 rounded text-white font-mono shadow-sm"
                style={{ backgroundColor: getNodeColor(hoveredNode) }}
              >
                {hoveredNode.riskScore} RISK
              </div>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-200">{hoveredNode.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Progress Gap:</span>
                <span className={hoveredNode.progressGap < 0 ? 'text-red-400 font-bold font-mono' : 'text-emerald-400 font-bold font-mono'}>
                  {hoveredNode.progressGap > 0 ? `+${hoveredNode.progressGap}%` : `${hoveredNode.progressGap}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delay Status:</span>
                <span className="text-amber-400 font-bold font-mono">+{hoveredNode.delayDays} days</span>
              </div>
            </div>

            {(hoveredNode.warningCount > 0 || hoveredNode.actionCount > 0) && (
              <div className="flex items-center justify-between text-[10px] pt-1 font-mono border-t border-slate-800/60">
                <span className="text-red-400 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{hoveredNode.warningCount} Warnings</span>
                </span>
                <span className="text-amber-400 flex items-center space-x-1">
                  <Lightbulb className="w-3 h-3" />
                  <span>{hoveredNode.actionCount} Actions</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Legend & Grid Ticks */}
      <div className="relative z-10 p-3 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-md flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 font-bold">NODE LEGEND:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>LOW (&lt;45)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>MED (45-64)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>HIGH (65-79)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>CRITICAL (&gt;80)</span>
          </div>
        </div>

        <div className="text-cyan-400/80 text-[9px]">
          PRAEVISIO v2.6 • INFRASTRUCTURE NETWORK TOPOLOGY
        </div>
      </div>

    </div>
  );
};
