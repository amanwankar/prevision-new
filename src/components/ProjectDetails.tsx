import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  IndianRupee, 
  Printer, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  Edit
} from 'lucide-react';
import type { Project } from '../types';
import { calculateRiskAnalysis } from '../services/riskEngine';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { AnimatedRiskScore } from './motion/AnimatedRiskScore';
import { CinematicAISequenceModal } from './motion/CinematicAISequenceModal';
import { LoadingScanner } from './motion/LoadingScanner';
import { PulseIndicator } from './motion/PulseIndicator';
import { AnimatedProgress } from './motion/AnimatedProgress';
import { ProjectAICoreView } from './project/ProjectAICoreView';
import { DataFlowStream } from './project/DataFlowStream';
import { OfficerActionModal } from './project/OfficerActionModal';
import { ExecutionPreviewCard } from './execution/ExecutionPreviewCard';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onBack,
  onUpdateProject
}) => {
  // Interactive UI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCinematicModal, setShowCinematicModal] = useState(false);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [trendRange, setTrendRange] = useState<'30D' | '90D' | '6M' | '1Y'>('6M');
  const [warningStatus, setWarningStatus] = useState<'Open' | 'Acknowledged'>('Open');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Scroll listener for Sticky Context Bar
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 220) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Run Risk Engine Analysis
  const riskAnalysis = calculateRiskAnalysis(project);

  // Formatted Budget figures (Default baseline: Approved 100 Cr, Spent 61 Cr, Remaining 39 Cr)
  const approvedBudget = project.originalBudgetCr || 100;
  const spentCost = project.expenditureToDateCr || 61;
  const remainingBudget = Math.max(0, approvedBudget - spentCost);
  const targetProg = project.targetPhysicalProgress || 72;
  const actualProg = project.actualPhysicalProgress || 58;
  const progressGap = actualProg - targetProg; // e.g. -14%
  const expenditurePercent = Math.round((spentCost / approvedBudget) * 100);

  // Milestones Timeline Data
  const defaultMilestones = [
    { id: 'm-1', name: 'Project Initiation', expectedDate: '01 Mar 2022', actualDate: '15 Mar 2022', status: 'Completed' as const, progress: 100 },
    { id: 'm-2', name: 'Land Acquisition', expectedDate: '30 Sep 2022', actualDate: '15 Oct 2022', status: 'Completed' as const, progress: 100 },
    { id: 'm-3', name: 'Foundation Work', expectedDate: '30 Jun 2023', actualDate: '15 Jul 2023', status: 'Completed' as const, progress: 100 },
    { id: 'm-4', name: 'Structural Work', expectedDate: '31 Dec 2024', status: 'Delayed' as const, progress: 58 },
    { id: 'm-5', name: 'Final Construction', expectedDate: '30 Apr 2025', status: 'Pending' as const, progress: 0 },
    { id: 'm-6', name: 'Project Completion', expectedDate: '30 Jun 2025', status: 'Pending' as const, progress: 0 }
  ];

  const milestones = project.milestones && project.milestones.length > 0 ? project.milestones : defaultMilestones;

  // Historical Risk Trend Data (Jan -> Jun 82)
  const riskTrendData = [
    { date: 'Jan 2026', score: 48 },
    { date: 'Feb 2026', score: 55 },
    { date: 'Mar 2026', score: 61 },
    { date: 'Apr 2026', score: 69 },
    { date: 'May 2026', score: 75 },
    { date: 'Jun 2026', score: riskAnalysis.riskScore }
  ];

  const handlePrintReport = () => {
    window.print();
  };

  const handleRunTelemetry = () => {
    setIsAnalyzing(true);
    setShowCinematicModal(true);
  };

  return (
    <div className="space-y-6 pb-20 font-sans relative">
      
      {/* 1. STICKY COLLAPSIBLE TOP CONTEXT BAR (on Scroll) */}
      <div className={`fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/40 px-3 sm:px-6 py-2 shadow-2xl transition-all duration-300 flex items-center justify-between min-w-0 ${
        showStickyBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 font-mono font-black text-slate-950 flex items-center justify-center text-xs shrink-0">
            P
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-white truncate">{project.name}</div>
            <div className="text-[10px] font-mono text-cyan-400 truncate">{project.code} • {project.department}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <div className="flex items-center space-x-1.5 font-mono text-[10px] sm:text-xs">
            <span className="text-slate-400 hidden sm:inline">RISK:</span>
            <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-md whitespace-nowrap">
              {riskAnalysis.riskScore}/100 HIGH
            </span>
          </div>

          <button
            onClick={handleRunTelemetry}
            className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-[10px] sm:text-xs shadow-md transition whitespace-nowrap"
          >
            RUN AI TELEMETRY
          </button>
        </div>
      </div>

      {/* 2. CINEMATIC PROJECT INTELLIGENCE HEADER */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-4 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden glass-reflection animate-stagger-fade">
        <LoadingScanner />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Metadata Info */}
          <div className="space-y-3 max-w-2xl min-w-0 flex-1">
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onBack}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Projects Directory</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-0.5 sm:py-1 rounded-full border border-cyan-500/30">
                PROJECT INTELLIGENCE RECORD
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight break-words-safe">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-500">ID:</span> <strong className="text-white">{project.code}</strong>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                <span className="text-slate-500">LOCATION:</span> <strong className="text-slate-200">{project.state}</strong>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                <span className="text-slate-500">DEPARTMENT:</span> <strong className="text-cyan-300">{project.department}</strong>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <PulseIndicator color="emerald" size="sm" />
                <span>● MONITORING ACTIVE</span>
              </div>
            </div>

          </div>

          {/* Right Risk Score Ring & Quick CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            
            {/* Risk Score Ring */}
            <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-inner w-full sm:w-auto justify-between sm:justify-start">
              <AnimatedRiskScore score={riskAnalysis.riskScore} size={88} />
              <div>
                <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                  OVERALL RISK INDEX
                </div>
                <div className="text-sm font-extrabold text-white">
                  {riskAnalysis.riskScore >= 80 ? 'HIGH RISK ATTENTION' : 'MODERATE RISK'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Potential Schedule Delay
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handleRunTelemetry}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Cpu className="w-4 h-4" />
                <span>RUN AI TELEMETRY ENGINE</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.location.hash = `#/projects/${project.id}/edit`;
                  }}
                  className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EDIT DATA</span>
                </button>

                <button
                  onClick={() => setShowOfficerModal(true)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Officer Action Center</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-xl transition"
                  title="Print / Export Report"
                >
                  <Printer className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. PIPELINE DATA STREAM VISUALIZATION */}
      <DataFlowStream isAnalyzing={isAnalyzing} />

      {/* EXECUTION CONTROL CENTER PREVIEW CARD */}
      <ExecutionPreviewCard
        project={project}
        onOpenFullControlCenter={() => {
          window.location.hash = `#/projects/${project.id}/execution`;
        }}
      />

      {/* 4. AI CORE & HEALTH OVERVIEW (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Project AI Satellite Node View */}
        <div className="lg:col-span-6">
          <ProjectAICoreView
            isAnalyzing={isAnalyzing}
            onRunAnalysis={handleRunTelemetry}
            progressGap={progressGap}
            expenditurePercent={expenditurePercent}
            riskScore={riskAnalysis.riskScore}
          />
        </div>

        {/* Right Column: Project Health Overview Panel */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                PROJECT HEALTH OVERVIEW
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-full">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 font-bold">PHYSICAL PROGRESS</span>
                <span className="text-cyan-400 font-bold">{actualProg}% (Target: {targetProg}%)</span>
              </div>
              <AnimatedProgress value={actualProg} color="cyan" height="sm" />
              <div className="text-[10px] font-mono text-amber-400 mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>14% below baseline trajectory schedule</span>
              </div>
            </div>

            {/* Schedule Delay Risk */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 font-bold">SCHEDULE MILESTONE HEALTH</span>
                <span className="text-purple-400 font-bold">90-DAY PREDICTED DELAY</span>
              </div>
              <AnimatedProgress value={65} color="purple" height="sm" />
            </div>

            {/* Cost Utilization */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 font-bold">BUDGET EXPENDITURE UTILIZATION</span>
                <span className="text-amber-400 font-bold">{expenditurePercent}% (₹{spentCost} Cr / ₹{approvedBudget} Cr)</span>
              </div>
              <AnimatedProgress value={expenditurePercent} color="amber" height="sm" />
            </div>

            {/* Overall Risk Score */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 font-bold">OVERALL RISK LEVEL</span>
                <span className="text-rose-400 font-bold">{riskAnalysis.riskScore}/100 HIGH RISK</span>
              </div>
              <AnimatedProgress value={riskAnalysis.riskScore} color="rose" height="sm" />
            </div>

          </div>

        </div>

      </div>

      {/* 5. PLANNED VS ACTUAL PROGRESS & MILESTONE TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Planned vs Actual Progress Panel */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
              PLANNED VS ACTUAL PROGRESS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">GAP ANALYSIS</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500">PLANNED</div>
              <div className="text-lg font-black text-cyan-400">{targetProg}%</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500">ACTUAL</div>
              <div className="text-lg font-black text-slate-100">{actualProg}%</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40">
              <div className="text-[10px] text-amber-400 font-bold">GAP</div>
              <div className="text-lg font-black text-amber-400">{progressGap}%</div>
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs text-amber-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold font-mono text-[11px]">PHYSICAL PROGRESS DEFICIT</div>
              <div className="text-[11px] leading-relaxed opacity-90">
                Actual physical progress is trailing planned target by 14%. Milestone 4 (Structural Work) requires urgent officer intervention.
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline Panel */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
              PROJECT MILESTONE TIMELINE
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">6 MILESTONES TRACKED</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {milestones.map((m, idx) => (
              <div 
                key={m.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  m.status === 'Completed' ? 'bg-slate-950/60 border-slate-800 opacity-80' :
                  m.status === 'Delayed' ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' :
                  'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    m.status === 'Delayed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {m.status === 'Completed' ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{m.name}</div>
                    <div className="text-[10px] text-slate-400">Target: {m.expectedDate}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    m.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    m.status === 'Delayed' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                    'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                window.location.hash = `#/projects/${project.id}/timeline`;
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>VIEW FULL TIMELINE INTELLIGENCE CENTER</span>
            </button>
          </div>
        </div>

      </div>

      {/* 6. COST & BUDGET INTELLIGENCE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
              COST & FINANCIAL BUDGET INTELLIGENCE
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
            FINANCIAL SYNC ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-bold">APPROVED BUDGET</div>
            <div className="text-xl font-black text-white mt-1">₹{approvedBudget} Cr</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40">
            <div className="text-[10px] text-amber-400 font-bold">EXPENDITURE TO DATE</div>
            <div className="text-xl font-black text-amber-300 mt-1">₹{spentCost} Cr</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-bold">UTILIZATION RATE</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{expenditurePercent}%</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40">
            <div className="text-[10px] text-emerald-400 font-bold">REMAINING BALANCE</div>
            <div className="text-xl font-black text-emerald-300 mt-1">₹{remainingBudget} Cr</div>
          </div>
        </div>

        {expenditurePercent > actualProg && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs text-amber-200 flex items-start space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">COST ATTENTION:</strong> Budget utilization ({expenditurePercent}%) is leading physical progress ({actualProg}%). Financial expenditure is accelerating faster than verified site completion.
            </div>
          </div>
        )}
      </div>

      {/* 7. DOMINANT AI RISK ANALYSIS & "WHY IS THIS PROJECT AT RISK?" */}
      <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.15)] space-y-6 relative overflow-hidden glass-reflection">
        <LoadingScanner />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>PREDICTIVE RISK INTELLIGENCE</span>
            </div>
            <h2 className="text-xl font-black text-white">AI Multi-Variable Risk Assessment</h2>
          </div>

          <button
            onClick={handleRunTelemetry}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition hover:scale-105"
          >
            RE-RUN AI RISK ENGINE
          </button>
        </div>

        {/* 2-Column Risk Factors & SHAP XAI Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Risk Factor Bars */}
          <div className="lg:col-span-6 space-y-4 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              RISK FACTOR WEIGHTS
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">SCHEDULE VARIANCE DRIVER</span>
                  <span className="text-rose-400 font-bold">86 / 100</span>
                </div>
                <AnimatedProgress value={86} color="rose" height="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">PHYSICAL PROGRESS GAP</span>
                  <span className="text-amber-400 font-bold">74 / 100</span>
                </div>
                <AnimatedProgress value={74} color="amber" height="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">DELAYED MILESTONES IMPACT</span>
                  <span className="text-purple-400 font-bold">68 / 100</span>
                </div>
                <AnimatedProgress value={68} color="purple" height="sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">COST UTILIZATION RATIO</span>
                  <span className="text-cyan-400 font-bold">42 / 100</span>
                </div>
                <AnimatedProgress value={42} color="cyan" height="sm" />
              </div>
            </div>
          </div>

          {/* "WHY IS THIS PROJECT AT RISK?" SHAP XAI Panel */}
          <div className="lg:col-span-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>WHY IS THIS PROJECT AT RISK?</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 text-xs">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">PRIMARY DRIVER</div>
              <div className="text-white font-bold mt-0.5">
                Schedule Variance & Land Acquisition Delay (42% Impact)
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-sans">
              <div className="font-semibold text-slate-200">SUPPORTING SIGNALS:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>Actual physical progress is 14% below target trajectory.</li>
                <li>Structural Work milestone expected completion date slipped by 90 days.</li>
                <li>Environmental clearance delay impacting Section 3 excavation.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 italic font-mono bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-900/50">
              "The current project trajectory indicates an elevated probability of further schedule slippage if structural milestone 4 is not accelerated."
            </div>
          </div>

        </div>

      </div>

      {/* 8. PREDICTIVE OUTLOOK CARDS & HISTORICAL RISK CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Predictive Outlook */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              PREDICTIVE OUTLOOK
            </h3>
            <span className="text-[10px] text-cyan-400">90-DAY FORECAST</span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-500/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-bold">SCHEDULE DELAY RISK</div>
                <div className="text-sm font-extrabold text-rose-400 mt-0.5">HIGH PROBABILITY</div>
              </div>
              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/40">
                HIGH
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-bold">COST OVERRUN RISK</div>
                <div className="text-sm font-extrabold text-amber-300 mt-0.5">MODERATE PROBABILITY</div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/40">
                MEDIUM
              </span>
            </div>
          </div>
        </div>

        {/* Historical Risk Chart */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              RISK HISTORY TREND (6 MONTHS)
            </h3>
            <div className="flex items-center space-x-1">
              {(['30D', '90D', '6M', '1Y'] as const).map(rng => (
                <button
                  key={rng}
                  onClick={() => setTrendRange(rng)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trendRange === rng ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#f43f5e', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 9. ACTIVE EARLY WARNINGS & RECOMMENDED ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Warnings */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                ACTIVE EARLY WARNINGS
              </h3>
            </div>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
              1 HIGH PRIORITY
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-400">WARN-001 • SCHEDULE SLIPPAGE</span>
              <span className="text-[10px] text-slate-500">DETECTED TODAY</span>
            </div>
            <p className="text-xs text-slate-300">
              Structural Work phase is trailing plan by 14%. Immediate contractor escalation required.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">STATUS: {warningStatus}</span>
              <button
                onClick={() => setWarningStatus(warningStatus === 'Open' ? 'Acknowledged' : 'Open')}
                className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition"
              >
                {warningStatus === 'Open' ? 'ACKNOWLEDGE WARNING' : 'ACKNOWLEDGED ✓'}
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                RECOMMENDED ACTIONS
              </h3>
            </div>
            <button
              onClick={() => setShowOfficerModal(true)}
              className="text-[10px] text-cyan-400 font-bold hover:underline"
            >
              + TAKE ACTION
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Review Contractor Recovery Plan</div>
                <div className="text-[10px] text-slate-400">Priority: HIGH • Due in 7 days</div>
              </div>
              <button
                onClick={() => setShowOfficerModal(true)}
                className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hover:bg-cyan-500/30 transition"
              >
                EXECUTE
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Conduct Schedule Variance Review</div>
                <div className="text-[10px] text-slate-400">Priority: MEDIUM • Due in 14 days</div>
              </div>
              <button
                onClick={() => setShowOfficerModal(true)}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition"
              >
                REVIEW
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 10. PROJECT AUDIT TIMELINE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              IMMUTABLE PROJECT AUDIT TIMELINE
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">SHA-256 LOGGED</span>
        </div>

        <div className="space-y-3">
          {(project.auditTrail && project.auditTrail.length > 0 ? project.auditTrail : [
            { id: 'l1', date: '10:42 AM, Today', author: 'Director Infra', role: 'Inspector', note: 'Early warning acknowledged & contractor recovery plan requested', actionTaken: 'Acknowledged Warning', previousRiskScore: 75, newRiskScore: 82 },
            { id: 'l2', date: 'Yesterday, 04:15 PM', author: 'System AI Core', role: 'AI Engine', note: 'Risk score recalculated due to 14% physical progress deficit', actionTaken: 'Risk Score Escalation', previousRiskScore: 69, newRiskScore: 75 }
          ]).map((log) => (
            <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-bold">{log.actionTaken}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[10px]">{log.author} ({log.role})</span>
                </div>
                <div className="text-slate-300 text-xs font-sans">{log.note}</div>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0">{log.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICER ACTION MODAL */}
      <OfficerActionModal
        isOpen={showOfficerModal}
        onClose={() => setShowOfficerModal(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />

      {/* CINEMATIC AI SEQUENCE MODAL */}
      <CinematicAISequenceModal
        isOpen={showCinematicModal}
        onComplete={() => {
          setShowCinematicModal(false);
          setIsAnalyzing(false);
        }}
        onClose={() => {
          setShowCinematicModal(false);
          setIsAnalyzing(false);
        }}
        projectName={project.name}
        targetRiskScore={riskAnalysis.riskScore}
      />

    </div>
  );
};
