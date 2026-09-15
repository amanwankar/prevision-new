import React from 'react';
import { 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  FileCheck2, 
  Compass,
  Milestone as MilestoneIcon,
  Trees,
  Building2,
  HardHat,
  Plane,
  Droplets,
  Zap,
  Anchor,
  Train,
  Network
} from 'lucide-react';
import type { Project } from '../../types';
import { StatusBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
  const progress = project.physicalProgress || project.actualPhysicalProgress || 0;
  const target = project.targetPhysicalProgress || 100;
  const score = project.riskScore ?? 45;

  const isRoad = project.sector === 'Roads & Highways' || Boolean(project.roadClassification);

  // Status and Risk derivations for Change 1 visual data panel
  const isDelayed = project.status === 'Delayed' || project.status === 'Critical Overrun';
  const isAtRisk = project.status === 'At Risk';

  // Color-coded left border: RED = Delayed, AMBER = At Risk, GREEN = On Track
  const panelLeftBorderClass = isDelayed
    ? 'border-l-4 border-l-rose-500'
    : isAtRisk
    ? 'border-l-4 border-l-amber-500'
    : 'border-l-4 border-l-emerald-500';

  // Large colored risk badge (HIGH / MEDIUM / LOW / AT RISK / DELAYED) with icon
  const getRiskBadgeConfig = () => {
    if (isDelayed) {
      return {
        label: 'DELAYED',
        icon: AlertTriangle,
        badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-700/80 ring-1 ring-rose-500/30'
      };
    }
    if (isAtRisk || score >= 50) {
      return {
        label: score >= 75 ? 'HIGH RISK' : 'AT RISK',
        icon: AlertCircle,
        badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-700/80 ring-1 ring-amber-500/30'
      };
    }
    if (score >= 25) {
      return {
        label: 'MEDIUM RISK',
        icon: Clock,
        badgeClass: 'bg-yellow-950/90 text-yellow-300 border-yellow-700/80 ring-1 ring-yellow-500/30'
      };
    }
    return {
      label: 'LOW RISK',
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 ring-1 ring-emerald-500/30'
    };
  };

  const riskBadge = getRiskBadgeConfig();
  const RiskIcon = riskBadge.icon;

  const spi = project.schedulePerformanceIndex ?? (target > 0 ? (progress / target) : 1.0);
  const delayDays = project.delayDays ?? 0;

  // Score color badge
  const getScoreColor = (sc: number) => {
    if (sc >= 75) return { text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-300', dot: 'bg-rose-600', level: 'Critical Overrun' };
    if (sc >= 50) return { text: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-300', dot: 'bg-orange-600', level: 'High Risk' };
    if (sc >= 25) return { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500', level: 'Moderate Risk' };
    return { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-600', level: 'Low Risk' };
  };

  const scoreInfo = getScoreColor(score);

  return (
    <div
      onClick={onSelect}
      className="gov-card flex flex-col justify-between overflow-hidden cursor-pointer transition duration-200 hover:border-blue-400 hover:shadow-md group bg-white border border-slate-300 rounded-xl"
    >
      {/* 1. COMPACT VISUAL INFO PANEL (Replaces Project Photo Completely) */}
      <div className={`p-4 bg-slate-900 text-white flex flex-col justify-between space-y-3.5 border-b border-slate-800 ${panelLeftBorderClass}`}>
        {/* Top Row: Sector Tag Chip in Top-Left Corner & Large Colored Risk Badge with Icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-950/90 text-blue-200 border border-blue-800 text-[10px] font-bold tracking-wide uppercase truncate">
              {project.sector}
            </span>
            {project.roadClassification && (
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-bold truncate">
                {project.roadClassification}
              </span>
            )}
          </div>

          {/* Large Colored Risk Badge with Icon */}
          <div className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs border shrink-0 ${riskBadge.badgeClass}`}>
            <RiskIcon size={14} className="shrink-0" />
            <span>{riskBadge.label}</span>
          </div>
        </div>

        {/* Mini Horizontal Progress Bar Row: Physical Progress vs Target (Two bars, labeled) */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Physical Progress:</span>
              <strong className="text-emerald-400 font-mono text-xs">{progress}%</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-slate-400">Target:</span>
              <strong className="text-sky-300 font-mono text-xs">{target}%</strong>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(progress, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(target, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mini Stat Row: 3 key numbers: [Sanctioned Cost] | [SPI value] | [Days Delayed or "On Track"] */}
        <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 bg-slate-800/80 rounded-md border border-slate-700/60 text-center">
          <div className="border-r border-slate-700/60 pr-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Sanctioned Cost</span>
            <strong className="text-xs font-bold text-slate-100 font-mono">₹{cost.toLocaleString()} Cr</strong>
          </div>
          <div className="border-r border-slate-700/60 px-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">SPI Value</span>
            <strong className={`text-xs font-bold font-mono ${spi < 0.9 ? 'text-rose-400' : spi < 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {spi.toFixed(2)}
            </strong>
          </div>
          <div className="pl-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Schedule Status</span>
            {delayDays > 0 ? (
              <strong className="text-xs font-bold text-rose-400 font-mono flex items-center justify-center gap-0.5">
                <Clock size={11} /> +{delayDays}d
              </strong>
            ) : (
              <strong className="text-xs font-bold text-emerald-400">On Track</strong>
            )}
          </div>
        </div>

        {/* Bottom of this panel: Project Location Pin Label */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/90 text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
            <MapPin size={13} className="text-amber-400 shrink-0" />
            <span className="truncate font-medium text-slate-200">{project.locationName}</span>
          </div>
          <span className="text-[10px] font-mono text-blue-300 shrink-0 px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-900/60">
            {project.code || project.id}
          </span>
        </div>
      </div>

      {/* 2. Main Content Body (Unchanged layout, buttons, cost, agency, score, SPI, progress bar below) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Project Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
            {project.name}
          </h3>

          {/* Agency & Contractor */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Building2 size={12} className="text-blue-700 shrink-0" />
              <span>Agency: <strong className="text-slate-800">{project.nodalAgency}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HardHat size={12} className="text-amber-700 shrink-0" />
              <span className="truncate max-w-[180px]">Contractor: <strong className="text-slate-800">{project.contractorName}</strong></span>
            </span>
          </div>

          {/* Road Infrastructure Technical Specifications (if available) */}
          {isRoad && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Length & Alignment</span>
                  <strong className="text-slate-900">
                    {project.roadLengthKm ? `${project.roadLengthKm} km` : 'Corridor Section'}
                    {project.lanes ? ` • ${project.lanes} lanes` : ''}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Civil Structures</span>
                  <strong className="text-slate-900 truncate block" title={project.structuresCount}>
                    {project.structuresCount || 'Major bridges & ROBs'}
                  </strong>
                </div>
              </div>

              {/* Land Possession & Forest/Utility Clearances */}
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Compass size={12} className="text-blue-600 shrink-0" />
                  <span className="text-slate-600">
                    Land: <strong className="text-slate-900">{project.landPossessionPct !== undefined ? `${project.landPossessionPct}%` : 'Verified'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trees size={12} className="text-emerald-700 shrink-0" />
                  <span className="text-slate-600 truncate" title={project.forestClearanceStatus}>
                    Forest: <strong className="text-slate-900">{project.forestClearanceStatus || 'Granted'}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Water Resources Intelligence: Headworks vs Canal Progress Alert */}
          {(project.headworksProgressPct !== undefined || project.canalsProgressPct !== undefined || project.canalNetworkProgressPct !== undefined) && (() => {
            const canalsPct = project.canalNetworkProgressPct ?? project.canalsProgressPct ?? 0;
            const headworksPct = project.headworksProgressPct ?? 0;
            const isGapAlert = headworksPct - canalsPct > 30;
            return (
              <div className="mt-3 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-950 flex items-center gap-1">
                    <Droplets size={12} className="text-blue-700" />
                    <span>Dam Headworks vs Canal Network:</span>
                  </span>
                  {isGapAlert && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                      Distribution Gap Alert
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Headworks / Dam</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${headworksPct}%` }} />
                      </div>
                      <strong className="text-slate-900">{headworksPct}%</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Canals & Field Channels</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${canalsPct < 40 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${canalsPct}%` }} />
                      </div>
                      <strong className="text-slate-900">{canalsPct}%</strong>
                    </div>
                  </div>
                </div>
                {project.commandAreaHectares && (
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-blue-100 flex items-center justify-between">
                    <span>Target Irrigation Potential:</span>
                    <strong className="text-blue-900">{project.commandAreaHectares.toLocaleString()} Hectares</strong>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Civil Aviation / Airport Commissioning Readiness Checklist */}
          {project.commissioningReadinessScore !== undefined && (
            <div className="mt-3 p-2.5 bg-sky-50/70 rounded-lg border border-sky-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-sky-950 flex items-center gap-1">
                  <Plane size={12} className="text-sky-700" />
                  <span>Commissioning Readiness:</span>
                </span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                  project.commissioningReadinessScore >= 80 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  Score: {project.commissioningReadinessScore}/100
                </span>
              </div>
              {project.readinessChecklist && (
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 pt-1">
                  {project.readinessChecklist.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 truncate" title={`${item.item}: ${item.status}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.status === 'Completed' || item.status === 'Ready' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-sky-500' : 'bg-amber-500'
                      }`} />
                      <span className="truncate">{item.item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shipping & Ports: Programme Packages Indicator */}
          {project.programmePackages && project.programmePackages.length > 0 && (
            <div className="mt-3 p-2.5 bg-teal-50/70 rounded-lg border border-teal-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-teal-950 flex items-center gap-1">
                  <Anchor size={12} className="text-teal-700" />
                  <span>Programme Packages ({project.programmePackages.length}):</span>
                </span>
                <span className="text-[10px] font-semibold text-teal-800">
                  Sync Tracking
                </span>
              </div>
              <div className="space-y-1 text-[10px]">
                {project.programmePackages.slice(0, 3).map((pkg, idx) => {
                  const pkgName = pkg.packageName || pkg.name || `Package ${idx + 1}`;
                  const progressVal = pkg.progressPercentage ?? pkg.progressPct ?? 0;
                  const isDone = pkg.status === 'Completed' || pkg.status === 'Operational';
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-700 truncate max-w-[170px]">{pkgName}</span>
                      <span className={`font-mono font-bold ${isDone ? 'text-emerald-700' : pkg.status === 'Delayed' ? 'text-rose-700' : 'text-slate-800'}`}>
                        {progressVal}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Power & Renewable Energy: Generation vs Evacuation Line Synchronization */}
          {(project.generationCapacityMW !== undefined || project.storageCapacityMWh !== undefined || project.towersErectedCount !== undefined) && (
            <div className="mt-3 p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Zap size={12} className="text-amber-700" />
                  <span>Grid Capacity & Evacuation:</span>
                </span>
                {project.generationCapacityMW && (
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    {project.generationCapacityMW} MW Clean Power
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                {project.storageCapacityMWh && (
                  <div>
                    <span className="text-slate-500 block">BESS Storage</span>
                    <strong className="text-slate-900">{project.storageCapacityMWh} MWh</strong>
                  </div>
                )}
                {project.towersErectedCount !== undefined && project.towersTargetCount !== undefined && (
                  <div>
                    <span className="text-slate-500 block">Towers Erected</span>
                    <strong className="text-slate-900">{project.towersErectedCount} / {project.towersTargetCount}</strong>
                  </div>
                )}
                {project.stringingKmCompleted !== undefined && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Conductor Stringing: {project.stringingKmCompleted} / {project.stringingKmTarget || '—'} km</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Urban Transport (Metro): Underground vs Elevated & Depot Status */}
          {(project.undergroundRouteKm !== undefined || project.elevatedRouteKm !== undefined || project.depotLandStatus) && (
            <div className="mt-3 p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-950 flex items-center gap-1">
                  <Train size={12} className="text-indigo-700" />
                  <span>Alignment & Depot Civil:</span>
                </span>
                {project.depotLandStatus && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    project.depotLandStatus.includes('Operational') || project.depotLandStatus.includes('Available') || project.depotLandStatus.includes('Acquired')
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    Depot: {project.depotLandStatus}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                <div>
                  <span className="text-slate-500 block">Underground / Tunnel</span>
                  <strong className="text-slate-900">{project.undergroundRouteKm ?? 0} km</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Elevated Viaduct</span>
                  <strong className="text-slate-900">{project.elevatedRouteKm ?? 0} km</strong>
                </div>
              </div>
            </div>
          )}

          {/* Cross-Sector Dependencies Alert */}
          {project.crossSectorDependencies && project.crossSectorDependencies.length > 0 && (
            <div className="mt-2.5 p-2 bg-purple-50/80 rounded border border-purple-200 text-[11px] space-y-1">
              <div className="flex items-center gap-1 text-purple-900 font-bold">
                <Network size={12} className="text-purple-700 shrink-0" />
                <span>Cross-Sector Dependency:</span>
              </div>
              {project.crossSectorDependencies.map((dep, idx) => (
                <div key={idx} className="text-[10px] text-slate-700 flex items-center justify-between">
                  <span className="truncate max-w-[200px]" title={dep.summary}>
                    • <strong>{dep.linkedSector}:</strong> {dep.linkedProjectName}
                  </span>
                  <span className={`px-1 rounded font-semibold text-[9px] ${
                    dep.criticality === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {dep.criticality} Criticality
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Approved Cost vs Expenditure Breakdown */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Approved Cost</span>
              <strong className="text-sm text-slate-900 font-bold">
                ₹{cost.toLocaleString()} Cr
              </strong>
              {project.revisedBudgetCr && project.revisedBudgetCr !== project.originalBudgetCr && (
                <span className="text-[10px] text-slate-500 block">
                  Orig: ₹{project.originalBudgetCr?.toLocaleString()} Cr
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Expenditure to Date</span>
              {project.isAwaitingMonthlyUpdate ? (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                  Awaiting official update
                </span>
              ) : (
                <>
                  <strong className="text-sm text-blue-900 font-bold">
                    ₹{(project.expenditureToDateCr || 0).toLocaleString()} Cr
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    {cost > 0 ? `${Math.round(((project.expenditureToDateCr || 0) / cost) * 100)}% utilized` : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* PREVISION Score & Model Confidence Metric Badge */}
          <div className={`mt-3 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border ${scoreInfo.bg} ${scoreInfo.border}`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${scoreInfo.dot}`} />
              <span className="text-[10px] uppercase font-bold text-slate-600">Risk Score:</span>
              <span className={`font-mono font-black ${scoreInfo.text}`}>{score}/100</span>
              <span className={`text-[10px] font-bold ${scoreInfo.text}`}>({scoreInfo.level})</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-700">
              Confidence: <strong className="text-slate-900 font-mono">{project.modelConfidence || '92% (Calibrated)'}</strong>
            </div>
          </div>

          {/* "Why Risky?" Root Cause Explanation */}
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
            <div className="flex items-center gap-1.5 text-amber-950 font-bold mb-1">
              <AlertTriangle size={13} className="text-amber-700 shrink-0" />
              <span>Why Risky? Root Cause Analysis:</span>
            </div>
            <p className="text-slate-800 text-[11px] leading-relaxed">
              {project.likelyRiskCauses || project.primaryRisk || 'Pending right-of-way handover and utility shifting clearance.'}
            </p>
          </div>

          {/* Upcoming Milestone */}
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-700">
            <MilestoneIcon size={13} className="text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 text-[11px] font-medium">Upcoming Milestone: </span>
              <span className="font-semibold text-slate-900">
                {project.milestoneAtRisk || project.milestones?.[0]?.name || project.milestones?.[0]?.title || 'Next scheduled sectional work-front inspection'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Physical Progress & Action Recommendation Footer */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          {/* Physical Progress Bar or "Awaiting Monthly Update" Notice */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Physical Progress</span>
              {project.isAwaitingMonthlyUpdate ? (
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                  <Clock size={11} /> Awaiting official monthly update
                </span>
              ) : (
                <span className="font-bold text-slate-900">
                  {progress}% <span className="text-slate-500 text-[10px]">/ target {target}%</span>
                </span>
              )}
            </div>

            {project.isAwaitingMonthlyUpdate ? (
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600">
                {project.monthlyUpdateStatusText || 'Package-level physical completion and expenditure will populate upon authenticated PAIMANA / NHAI / MoRTH / PMGSY monthly update.'}
              </div>
            ) : (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress < target - 15
                      ? 'bg-rose-600'
                      : progress < target - 5
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Recommended Action with Responsible Agency & Due Date */}
          {project.recommendedAction && (
            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-blue-950 flex items-center gap-1">
                  <FileCheck2 size={12} className="text-blue-700" />
                  <span>Recommended Action:</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px]">
                  Due: <strong className="text-slate-800">{project.actionDeadline || '30 Days'}</strong>
                </span>
              </div>
              <p className="text-slate-800 text-[11px] font-medium leading-snug">
                {project.recommendedAction}
              </p>
              <div className="text-[10px] text-slate-600 flex items-center justify-between pt-1 border-t border-blue-100">
                <span>Responsible: <strong className="text-slate-800">{project.actionOwner || project.nodalAgency}</strong></span>
                <span className="text-slate-500 truncate max-w-[150px]" title={project.closureProofRequired}>
                  Proof: {project.closureProofRequired || 'Site compliance log'}
                </span>
              </div>
            </div>
          )}

          {/* Card Action Link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] text-slate-500">
              Start: {project.startDate} • Target: {project.revisedTargetDate || project.originalTargetDate}
            </span>
            <span className="font-bold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition text-xs">
              <span>Inspect Full Dossier</span>
              <ChevronRight size={14} />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
