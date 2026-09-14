import React from 'react';
import type { OperationalAttentionItem } from '../../services/portfolioIntelligenceService';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';

interface PortfolioAttentionQueueProps {
  items: OperationalAttentionItem[];
  onNavigateHash: (hash: string) => void;
}

export const PortfolioAttentionQueue: React.FC<PortfolioAttentionQueueProps> = ({
  items,
  onNavigateHash
}) => {
  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 font-mono">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>PORTFOLIO ATTENTION QUEUE</span>
          </h3>
          <p className="text-xs text-slate-400">Ranked operational priorities requiring officer intervention</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-bold">{items.length} Active Items</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigateHash(item.targetHash)}
            className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 cursor-pointer border border-slate-800 hover:border-cyan-500/50 transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  item.priorityLevel === 'CRITICAL' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : item.priorityLevel === 'HIGH' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {item.priorityLevel}
                </span>

                <span className="text-xs font-bold text-white">{item.project.name} ({item.project.code})</span>
              </div>

              <div className="text-xs text-slate-200 font-semibold">{item.issue}</div>
              <div className="text-[11px] text-slate-400">{item.reason}</div>
              <div className="text-[10px] text-cyan-400 font-semibold pt-1">Next Step: {item.recommendedNextStep}</div>
            </div>

            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition shrink-0 ml-4" />
          </div>
        ))}
      </div>

    </div>
  );
};
