import React, { useState } from 'react';
import { GlassPanel } from '../motion/GlassPanel';
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  technicalDetails?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Telemetry Exception',
  message,
  technicalDetails,
  onRetry,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <GlassPanel variant="dark" className={`p-6 border-red-500/30 bg-red-950/10 ${className}`}>
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-red-300 tracking-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
            {message}
          </p>

          {technicalDetails && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <span>{showDetails ? 'Hide Diagnostics' : 'Show Diagnostic Trace'}</span>
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showDetails && (
                <pre className="mt-2 p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-red-300/80 overflow-x-auto whitespace-pre-wrap break-words-safe">
                  {technicalDetails}
                </pre>
              )}
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 focus-ring"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Signal Request</span>
            </button>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};
