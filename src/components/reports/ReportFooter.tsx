import React from 'react';

interface ReportFooterProps {
  signatory?: string;
  designation?: string;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({
  signatory = 'Monitoring Officer / Nodal Director',
  designation = 'Infrastructure and Project Monitoring Division (IPMD)'
}) => {
  return (
    <footer className="pt-6 border-t-2 border-slate-900 text-xs text-slate-700 page-break-inside-avoid font-sans mt-8">
      
      {/* Officer Sign-off Block */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-extrabold text-slate-950 uppercase tracking-wide">PRAEVISIO MONITORING SYSTEM</div>
          <div className="text-[10px] text-slate-500">Ministry of Statistics & Programme Implementation</div>
        </div>

        <div className="text-right">
          <div className="w-32 border-b border-slate-400 mb-1 inline-block"></div>
          <div className="font-bold text-slate-900">{signatory}</div>
          <div className="text-[10px] text-slate-600">{designation}</div>
        </div>
      </div>

      {/* AI Transparency Disclaimer */}
      <div className="bg-slate-100 border border-slate-300 p-2.5 rounded text-[10px] text-slate-600 leading-normal">
        <span className="font-bold text-slate-900">AI TRANSPARENCY NOTICE: </span>
        Risk assessments shown in this demonstration are generated using the configured PRAEVISIO analytical/risk engine. Production deployment can integrate a trained machine-learning model and validated government data sources.
      </div>

      {/* Footer Branding & Page Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3">
        <div>TEAM-CONNECT • SIH 2026</div>
        <div>CONFIDENTIAL - FOR OFFICIAL USE ONLY</div>
        <div>MOSPI OFFICIAL BRIEFING DOCUMENT</div>
      </div>

    </footer>
  );
};
