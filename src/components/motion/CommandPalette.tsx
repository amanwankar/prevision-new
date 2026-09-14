import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, AlertTriangle, FileText, Users, Settings, Play, X, CornerDownLeft, Sparkles } from 'lucide-react';
import type { Project, EarlyWarning } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  alerts: EarlyWarning[];
  onSelectProject: (id: string) => void;
  onSelectAlert: (id: string) => void;
  onNavigatePage: (page: string) => void;
  onStartDemo: () => void;
  onOpenCopilot?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  alerts,
  onSelectProject,
  onSelectAlert,
  onNavigatePage,
  onStartDemo,
  onOpenCopilot
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.code.toLowerCase().includes(query.toLowerCase()) ||
    p.sector.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredAlerts = alerts.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const systemActions = [
    { label: 'Open Portfolio Intelligence Center', icon: FolderKanban, action: () => { onNavigatePage('portfolio'); window.location.hash = '#/portfolio'; onClose(); }, category: 'Navigation' },
    { label: 'Open PRAEVISIO AI Copilot (Ctrl+I)', icon: Sparkles, action: () => { if (onOpenCopilot) onOpenCopilot(); onClose(); }, category: 'AI Copilot' },
    { label: 'Executive Command Center & Situation Room', icon: FileText, action: () => { onNavigatePage('executive_reports'); window.location.hash = '#/reports/executive'; onClose(); }, category: 'Navigation' },
    { label: 'Start SIH 2026 Interactive Demo Flow', icon: Play, action: () => { onStartDemo(); onClose(); }, category: 'Demo' },
    { label: 'Macro Risk & Predictive Analytics', icon: FolderKanban, action: () => { onNavigatePage('analytics'); onClose(); }, category: 'Navigation' },
    { label: 'Early Warnings Alert Center', icon: AlertTriangle, action: () => { onNavigatePage('alerts'); onClose(); }, category: 'Navigation' },
    { label: 'Official MoSPI Reports Generator', icon: FileText, action: () => { onNavigatePage('reports'); onClose(); }, category: 'Navigation' },
    { label: 'RBAC User Management Console', icon: Users, action: () => { onNavigatePage('users'); onClose(); }, category: 'Admin' },
    { label: 'System Security Configurator', icon: Settings, action: () => { onNavigatePage('settings'); onClose(); }, category: 'Admin' }
  ].filter(act => act.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-start justify-center pt-6 sm:pt-20 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-md animate-stagger-fade overflow-y-auto"
      onClick={onClose}
    >
      
      {/* Modal Container */}
      <div 
        className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl max-w-2xl w-full my-auto max-h-[85dvh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden glass-reflection"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, risk alerts, reports, admin settings or type 'demo'..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          
          {/* System Actions */}
          {systemActions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 mb-1.5">
                SYSTEM COMMANDS
              </div>
              <div className="space-y-1">
                {systemActions.map((act, i) => (
                  <button
                    key={i}
                    onClick={act.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <act.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>{act.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded-md">
                      {act.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
                MONITORED PROJECTS
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FolderKanban className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-slate-100 font-bold">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code} • {p.sector}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        p.riskScore >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        RISK: {p.riskScore}/100
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {filteredAlerts.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-3 mb-1.5">
                EARLY WARNING ALERTS
              </div>
              <div className="space-y-1">
                {filteredAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onSelectAlert(a.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-slate-100 font-bold">{a.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{a.id} • {a.severity} SEVERITY</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md">
                      VIEW ALERT
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">ESC</kbd> to exit</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl + K</kbd> anywhere</span>
          </div>
          <span>PRAEVISIO SOC HUD v2.4</span>
        </div>

      </div>
    </div>
  );
};
