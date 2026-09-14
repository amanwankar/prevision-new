import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Sparkles, 
  AlertOctagon, 
  Menu 
} from 'lucide-react';

interface MobileBottomNavProps {
  activePage: string;
  onSelectPage: (page: string) => void;
  alertsCount: number;
  onOpenCopilot: () => void;
  onToggleMobileSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onSelectPage,
  alertsCount,
  onOpenCopilot,
  onToggleMobileSidebar
}) => {
  const items = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      onClick: () => {
        onSelectPage('dashboard');
        window.location.hash = '';
      }
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Layers,
      onClick: () => {
        onSelectPage('projects');
        window.location.hash = '#/projects';
      }
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      isAi: true,
      onClick: onOpenCopilot
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertOctagon,
      badge: alertsCount > 0 ? alertsCount : undefined,
      onClick: () => {
        onSelectPage('alerts');
        window.location.hash = '#/alerts';
      }
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      onClick: onToggleMobileSidebar
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] no-print pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          if (item.isAi) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center py-1 group relative touch-target-safe"
                title="PRAEVISIO AI Copilot"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300 transform active:scale-90 transition duration-150">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-[9px] font-extrabold font-mono text-cyan-400 mt-0.5 tracking-tight">
                  AI COPILOT
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition duration-150 relative touch-target-safe ${
                isActive 
                  ? 'text-cyan-400 bg-cyan-500/10 font-bold' 
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-400 glow-text-cyan' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white ring-2 ring-slate-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans tracking-tight mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
