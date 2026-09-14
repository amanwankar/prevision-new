import React from 'react';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  reportId: string;
  date: string;
  organization?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  subtitle = 'Infrastructure and Project Monitoring Division (IPMD)',
  reportId,
  date,
  organization = 'GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION'
}) => {
  return (
    <div className="border-b-2 border-slate-900 pb-5 mb-6 text-slate-900 font-sans">
      
      {/* Official Government Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-300 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center border border-slate-800 shadow-sm shrink-0">
            P
          </div>
          <div>
            <div className="font-black text-lg tracking-wider text-slate-950 uppercase leading-none">
              PRAEVISIO
            </div>
            <div className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">
              Predictive Project Monitoring System
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
            Official Briefing Document
          </div>
          <div className="text-xs font-mono font-bold text-slate-900">
            ID: {reportId}
          </div>
        </div>
      </div>

      {/* Main Title Block */}
      <div className="text-center space-y-1">
        <div className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
          {organization}
        </div>
        <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
          {title}
        </h1>
        <p className="text-xs font-semibold text-slate-600">
          {subtitle}
        </p>
      </div>

      {/* Document Ref & Date Metadata */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-4 pt-2 border-t border-dashed border-slate-300">
        <div>
          <span className="font-bold text-slate-800">REF:</span> MOSPI/IPMD/{reportId}
        </div>
        <div>
          <span className="font-bold text-slate-800">GENERATED:</span> {date}
        </div>
      </div>

    </div>
  );
};
