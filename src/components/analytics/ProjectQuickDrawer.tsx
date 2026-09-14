import React from 'react';
import { 
  X, 
  AlertOctagon, 
  Lightbulb, 
  Building2,
  ArrowUpRight
} from 'lucide-react';
import type { Project } from '../../types';
import { AnimatedProgress } from '../motion/AnimatedProgress';
import { GlassPanel } from '../motion/GlassPanel';

interface ProjectQuickDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectQuickDrawer: React.FC<ProjectQuickDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onSelectProject
}) => {
  if (!isOpen || !project) return null;

  const progressGap = Math.max(0, project.targetPhysicalProgress - project.actualPhysicalProgress);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end">
      
      {/* Backdrop overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-lg bg-slate-900 border-l border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] h-full overflow-y-auto relative z-10 p-6 space-y-6 animate-slide-left font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              PROJECT QUICK INTELLIGENCE
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Code & Title Banner */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 font-mono text-[10px]">
            <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800">
              {project.code}
            </span>
            <span className="text-slate-400">• {project.sector}</span>
            <span className="text-slate-400">• {project.state}</span>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            {project.name}
          </h2>

          <div className="text-xs text-slate-400 font-mono">
            Department: <strong className="text-slate-200">{project.department}</strong>
          </div>
        </div>

        {/* AI Risk Score Hero Gauge */}
        <GlassPanel variant={project.riskScore >= 75 ? 'glowing' : 'dark'} className="p-5 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 font-bold uppercase">AI RISK TELEMETRY</span>
            <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
              project.riskScore >= 75 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
              project.riskScore >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}>
              {project.riskLevel || 'High'} Severity
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-3xl font-black font-mono text-white">
              {project.riskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>

            <div className="flex-1 space-y-1">
              <AnimatedProgress 
                value={project.riskScore} 
                color={project.riskScore >= 75 ? 'rose' : project.riskScore >= 50 ? 'amber' : 'cyan'} 
                height="md" 
              />
              <div className="text-[10px] font-mono text-slate-400 text-right">
                Calculated by PRAEVISIO Risk Engine
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Physical Progress & Progress Gap Analysis */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white uppercase">PROGRESS VARIANCE</span>
            <span className="text-rose-400 font-bold">GAP: -{progressGap}%</span>
          </div>

          <div className="space-y-2 font-sans">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Actual Physical Completion:</span>
                <span className="font-bold text-cyan-400">{project.actualPhysicalProgress}%</span>
              </div>
              <AnimatedProgress value={project.actualPhysicalProgress} color="cyan" height="sm" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Baseline Planned Target:</span>
                <span className="font-bold text-slate-300">{project.targetPhysicalProgress}%</span>
              </div>
              <AnimatedProgress value={project.targetPhysicalProgress} color="purple" height="sm" />
            </div>
          </div>
        </div>

        {/* Cost & Schedule Variance Cards */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">SCHEDULE DELAY</span>
            <div className="text-lg font-black text-amber-400">+{project.delayDays} Days</div>
            <span className="text-[9px] text-slate-400 block font-sans">Predicted Target: {project.aiPredictedDate || project.originalTargetDate}</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">COST OVERRUN RISK</span>
            <div className="text-lg font-black text-rose-400">₹{project.costOverrunForecastCr || 0} Cr</div>
            <span className="text-[9px] text-slate-400 block font-sans">Original: ₹{project.originalBudgetCr.toLocaleString()} Cr</span>
          </div>
        </div>

        {/* Interconnected Operations Indicators */}
        <div className="space-y-2.5 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-orange-400" />
              <span className="text-white font-bold">Active Early Warnings:</span>
            </div>
            <a 
              href="#/alerts"
              onClick={onClose}
              className="text-cyan-400 font-bold hover:underline"
            >
              Inspect Alerts Queue →
            </a>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold">Prescriptive Actions:</span>
            </div>
            <a 
              href="#/actions"
              onClick={onClose}
              className="text-yellow-400 font-bold hover:underline"
            >
              View Recommended Actions →
            </a>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              onSelectProject(project.id);
            }}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition font-mono tracking-wider"
          >
            <span>OPEN FULL PROJECT INTELLIGENCE</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
