import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

interface AccessDeniedProps {
  onReturnToDashboard: () => void;
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onReturnToDashboard,
  message = 'You do not have permission to access this page.'
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 shadow-xl">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
          403 Access Restricted
        </span>

        <h1 className="text-2xl font-black text-white tracking-tight pt-2">
          Access Restricted
        </h1>

        <p className="text-xs text-slate-400 leading-relaxed">
          {message}
        </p>

        <p className="text-[11px] text-slate-500 pt-1">
          Your role or project authorization scope does not include administrative privileges for this resource.
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={onReturnToDashboard}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
