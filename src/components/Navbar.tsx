import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  FileText, 
  Menu,
  Sparkles
} from 'lucide-react';
import type { User, EarlyWarning, Project } from '../types';
import { getRiskColorClass } from '../config/riskThresholds';

import { PulseIndicator } from './motion/PulseIndicator';

interface NavbarProps {
  currentUser: User;
  alerts: EarlyWarning[];
  projects: Project[];
  onSelectPage: (page: string) => void;
  onSelectProject: (projectId: string) => void;
  onOpenAddProjectModal: () => void;
  onLogout: () => void;
  onSwitchRole: (user: User) => void;
  availableUsers: User[];
  onToggleMobileSidebar: () => void;
  activePageTitle: string;
  onOpenCopilot?: () => void;
  onStartDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  alerts,
  projects,
  onSelectPage,
  onSelectProject,
  onOpenAddProjectModal,
  onLogout,
  onSwitchRole,
  availableUsers,
  onToggleMobileSidebar,
  activePageTitle,
  onOpenCopilot,
  onStartDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const newAlertsCount = alerts.filter(a => a.status === 'New').length;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Filter projects for global search dropdown
  const searchResults = searchTerm.trim()
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.status.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl text-white border-b border-slate-800/80 no-print">
      <div className="max-w-[1728px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between min-w-0">
        
        {/* Left Section: Mobile Menu Button & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 shrink-0 touch-target-safe flex items-center justify-center"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <span className="font-mono text-[9px] sm:text-[10px] text-cyan-400 font-bold tracking-widest uppercase shrink-0">
                PRAEVISIO
              </span>
              <span className="text-slate-600 shrink-0">/</span>
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white truncate">
                {activePageTitle}
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 shrink-0">
                <PulseIndicator color="emerald" label="SYSTEM OPERATIONAL" />
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">
              {currentDate} • Authorized Officer: <span className="text-slate-300 font-semibold">{currentUser.name}</span>
            </p>
          </div>
        </div>

        {/* Center: Global Search Dropdown */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4 relative" ref={searchRef}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4 text-cyan-400/80" />
            </div>
            <input
              type="text"
              placeholder="Search projects, alerts, departments..."
              value={searchTerm}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus-ring focus:border-cyan-500/50 font-sans transition shadow-inner"
            />
          </div>

          {/* Interactive Search Results Popup Dropdown */}
          {showSearchDropdown && searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700 flex justify-between">
                <span>Matching Projects ({searchResults.length})</span>
                <span className="text-teal-400">Press Esc to exit</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
                  {searchResults.map((proj) => {
                    const riskStyle = getRiskColorClass(proj.riskScore);
                    return (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj.id);
                          setShowSearchDropdown(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left p-3 hover:bg-slate-700/60 transition flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono bg-slate-900 text-teal-300 px-1.5 py-0.5 rounded">
                              {proj.code}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-[220px]">
                              {proj.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span>{proj.state}</span>
                            <span>•</span>
                            <span>{proj.department}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskStyle.badge}`}>
                            Risk: {proj.riskScore}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No projects found matching "<span className="text-white">{searchTerm}</span>"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Header Quick Buttons (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center space-x-2">
            {onStartDemo && (
              <button
                onClick={onStartDemo}
                className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-lg shadow-[0_0_12px_rgba(139,92,246,0.3)] flex items-center space-x-1.5 transition active:scale-95 border border-purple-400/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>SIH DEMO MODE</span>
              </button>
            )}

            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center space-x-1.5 transition active:scale-95 border border-cyan-400/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PRAEVISIO AI</span>
              </button>
            )}

            <button
              onClick={onOpenAddProjectModal}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Project</span>
            </button>

            <button
              onClick={() => onSelectPage('reports')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center space-x-1 transition"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Generate Report</span>
            </button>
          </div>

          {/* Mobile Quick Icon Trigger Buttons (<640px) */}
          <div className="flex sm:hidden items-center space-x-1">
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                aria-label="Open PRAEVISIO AI Copilot"
                className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-xl hover:bg-cyan-500/30 transition focus-ring touch-target-safe"
                title="Open AI Copilot"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenAddProjectModal}
              aria-label="Add Project Intake"
              className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition focus-ring touch-target-safe"
              title="Add Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Early Warning Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View Early Warnings Notifications"
              aria-expanded={showNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition focus-ring touch-target-safe"
              title="View Early Warnings"
            >
              <Bell className="w-5 h-5" />
              {newAlertsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
                  {newAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Recent Early Warnings ({alerts.length})</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        onSelectPage('alerts');
                        setShowNotifications(false);
                      }} 
                      className="text-[10px] text-teal-400 hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-700">
                  {alerts.map((alt) => (
                    <div 
                      key={alt.id}
                      onClick={() => {
                        onSelectPage('alerts');
                        window.location.hash = `#/alerts/${alt.id}`;
                        setShowNotifications(false);
                      }}
                      className={`p-3 hover:bg-slate-700/50 cursor-pointer transition space-y-1 ${
                        alt.status === 'Open' || alt.status === 'New' ? 'bg-slate-800/80 border-l-2 border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          alt.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                          alt.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {alt.severity} RISK
                        </span>
                        <span className="text-slate-400">{alt.timeAgo}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{alt.projectName}</p>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{alt.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-800 transition border border-slate-700/60"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/50"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <p className="text-[10px] text-amber-400 mt-1 font-mono">{currentUser.department}</p>
                </div>

                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Demo Role Switcher
                  </p>
                  <div className="space-y-1">
                    {availableUsers.map((usr) => (
                      <button
                        key={usr.id}
                        onClick={() => {
                          onSwitchRole(usr);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center justify-between ${
                          usr.id === currentUser.id 
                            ? 'bg-teal-900/60 text-teal-200 font-semibold' 
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <span>{usr.name}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                          {usr.role.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectPage('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 text-left flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-xs text-red-400 hover:bg-slate-700 text-left flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
