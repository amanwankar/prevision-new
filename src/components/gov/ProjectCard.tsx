import React from 'react';
import { 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import type { Project } from '../../types';
import { getProjectStatus, STATUS_THEMES } from '../../utils/statusUtils';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  statusOverride?: 'ON TRACK' | 'AT RISK' | 'DELAYED';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, statusOverride }) => {
  const cost = project.costCr || project.revisedBudgetCr || project.originalBudgetCr || 0;
  const progress = project.physicalProgress || project.actualPhysicalProgress || 0;
  const target = project.targetPhysicalProgress || 100;
  const score = project.riskScore ?? 45;
  const delayDays = project.delayDays ?? 0;
  const spi = project.spi ?? project.schedulePerformanceIndex ?? (target > 0 ? (progress / target) : 1.0);

  // Derive canonical status: DELAYED, AT RISK, or ON TRACK
  const canonicalStatus = statusOverride || getProjectStatus(project);
  const theme = STATUS_THEMES[canonicalStatus];

  // Schedule text for row 5
  let scheduleText = 'On Track';
  let scheduleColor = 'text-[#15803d]';
  if (canonicalStatus === 'DELAYED') {
    scheduleText = delayDays > 0 ? `+${delayDays}d Delay` : 'Delayed';
    scheduleColor = 'text-[#dc2626]';
  } else if (canonicalStatus === 'AT RISK') {
    scheduleText = delayDays > 0 ? `+${delayDays}d Drift` : 'At Risk';
    scheduleColor = 'text-[#d97706]';
  }

  return (
    <div
      onClick={onSelect}
      style={{ 
        borderLeftColor: theme.leftBorder, 
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        backgroundColor: theme.cardBg
      }}
      className="flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md group rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
    >
      {/* STEP 3 — TOP STATUS BANNER WITH STATUS BADGE IN TOP-RIGHT */}
      <div 
        style={{ backgroundColor: theme.bannerBg }}
        className="h-[36px] min-h-[36px] px-3.5 flex items-center justify-between border-b border-[#f1f5f9] select-none"
      >
        {/* Sector Chip */}
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span className="px-2 py-0.5 rounded-full bg-[#e2e8f0] text-[#334155] text-[11px] font-semibold uppercase tracking-wider truncate">
            {project.sector}
          </span>
          {project.roadClassification && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#e2e8f0] text-[#475569] text-[10px] font-semibold truncate">
              {project.roadClassification}
            </span>
          )}
        </div>

        {/* Status Badge in top-right corner */}
        <div 
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1 shrink-0 ${theme.badgeBg} ${theme.badgeTextCol} border ${theme.badgeBorder}`}
          title={`Status: ${theme.label}`}
        >
          <span>{theme.badgeText}</span>
        </div>
      </div>

      {/* RULE 3 — CARD BODY LAYOUT (padding: 14px 16px) */}
      <div className="px-4 py-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* ROW 1 — Project Name + ID */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="text-[14px] font-bold text-[#1e293b] line-clamp-2 leading-snug flex-1 group-hover:text-[#2563eb] transition-colors"
              title={project.name}
            >
              {project.name}
            </h3>
            <span className="text-[10px] font-mono text-[#94a3b8] shrink-0 pt-0.5 font-medium">
              {project.code || project.id}
            </span>
          </div>

          {/* ROW 2 — Location */}
          <div className="flex items-center gap-1 text-[12px] text-[#475569] truncate mt-1">
            <MapPin size={12} className="text-[#64748b] shrink-0" />
            <span className="truncate">{project.locationName}</span>
          </div>

          {/* DIVIDER */}
          <div className="my-2.5 border-t border-[#f1f5f9]" />

          {/* ROW 3 — Agency & Contractor (2 lines) */}
          <div className="space-y-1 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#64748b] shrink-0">
                AGENCY
              </span>
              <span className="text-[12px] font-medium text-[#0f172a] truncate text-right">
                {project.nodalAgency || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#64748b] shrink-0">
                CONTRACTOR
              </span>
              <span className="text-[12px] font-medium text-[#0f172a] truncate text-right">
                {project.contractorName || 'N/A'}
              </span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-2.5 border-t border-[#f1f5f9]" />

          {/* ROW 4 — Physical Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="text-[12px] font-medium text-[#64748b]">Physical Progress</span>
              <span className="text-[12px] font-medium text-[#64748b]">Target {target}%</span>
            </div>
            <div className="w-full bg-[#e2e8f0] rounded-full h-[6px] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.progressFill}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-[12px] text-[#475569] mt-1.5">
              {progress}% complete — Target: {target}%
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-2.5 border-t border-[#f1f5f9]" />

          {/* ROW 5 — 3 Key Stats in one row (equal columns) */}
          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] bg-[#f8fafc] rounded-lg border border-[#e2e8f0] py-2 px-1 text-center">
            <div className="px-1 flex flex-col justify-center">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#94a3b8] mb-0.5">
                COST
              </span>
              <span className="text-[13px] font-bold text-[#0f172a] font-mono block truncate" title={`Cost: ₹${cost.toLocaleString()} Cr`}>
                ₹{cost.toLocaleString()} Cr
              </span>
            </div>
            <div className="px-1 flex flex-col justify-center">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#94a3b8] mb-0.5">
                SPI
              </span>
              <span className={`text-[13px] font-bold font-mono block ${spi < 0.8 ? 'text-[#dc2626]' : spi < 1.0 ? 'text-[#d97706]' : 'text-[#15803d]'}`}>
                {spi.toFixed(2)}
              </span>
            </div>
            <div className="px-1 flex flex-col justify-center">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#94a3b8] mb-0.5">
                SCHEDULE
              </span>
              <span 
                className={`text-[12px] font-bold block truncate leading-tight ${scheduleColor}`}
                title={scheduleText}
              >
                {scheduleText}
              </span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-2.5 border-t border-[#f1f5f9]" />

          {/* ROW 6 — Risk Score (single line) */}
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1">
              <span className="text-[#64748b]">Risk Score:</span>
              <span className={`font-bold font-mono ${
                score > 65 ? 'text-[#dc2626]' : score >= 40 ? 'text-[#d97706]' : 'text-[#15803d]'
              }`}>
                {score}/100
              </span>
              <span className="text-[#64748b]">
                ({score > 65 ? 'High' : score >= 40 ? 'Medium' : 'Low'})
              </span>
            </div>
            <div className="text-[12px] text-[#64748b]">
              Confidence: <strong className="font-semibold text-[#0f172a]">{project.modelConfidence || '92%'}</strong>
            </div>
          </div>
        </div>

        {/* ROW 7 — Inspect Project button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full py-[10px] px-4 rounded-[8px] bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-bold text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-3.5"
        >
          <span>Inspect Project</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

