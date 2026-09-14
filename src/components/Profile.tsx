import React from 'react';
import { User as UserIcon, Shield, Mail, Layers, ShieldCheck } from 'lucide-react';
import type { User, Project } from '../types';
import { GlassPanel } from './motion/GlassPanel';

interface ProfileProps {
  currentUser: User;
  projects: Project[];
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, projects }) => {
  return (
    <div className="space-y-6 pb-20 max-w-4xl font-sans min-w-0">
      
      {/* Page Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1 font-mono text-xs">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <UserIcon className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>OFFICER PROFILE & CREDENTIALS</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Government credentials, assigned infrastructure sectors, and active portal sessions.
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <GlassPanel variant="dark" reflection className="p-6 border-cyan-500/30">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-cyan-500/50 shadow-2xl shrink-0"
          />

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <h3 className="text-lg font-black text-white tracking-tight break-words-safe">{currentUser.name}</h3>
              <span className="bg-cyan-950/80 text-cyan-300 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-lg border border-cyan-800 uppercase tracking-wider shrink-0 inline-block">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-amber-400 font-semibold font-mono">{currentUser.designation}</p>
            <p className="text-xs text-slate-400">{currentUser.department}</p>
            <div className="text-xs text-slate-400 font-mono pt-1 flex items-center justify-center sm:justify-start space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Detail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Assigned Sectors Card */}
        <GlassPanel variant="dark" className="p-5 space-y-3 border-slate-800">
          <h4 className="font-extrabold text-white uppercase text-[11px] text-cyan-400 font-mono flex items-center space-x-1.5">
            <Layers className="w-4 h-4" />
            <span>ASSIGNED SECTOR PORTFOLIOS</span>
          </h4>
          
          <div className="space-y-2">
            {currentUser.assignedSectors.map((sec) => (
              <div key={sec} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <span className="font-semibold text-slate-200">{sec}</span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-900 px-2 py-0.5 rounded-lg">
                  {projects.filter(p => p.sector === sec).length} projects
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Security & Audit Card */}
        <GlassPanel variant="dark" className="p-5 space-y-3 border-slate-800">
          <h4 className="font-extrabold text-white uppercase text-[11px] text-amber-400 font-mono flex items-center space-x-1.5">
            <Shield className="w-4 h-4" />
            <span>SECURITY & PORTAL AUDIT</span>
          </h4>

          <div className="space-y-2.5 text-slate-300 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">NIC Single Sign-On:</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Security Clearance:</span>
              <span className="font-semibold text-white">Level-4 Executive</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Active Session ID:</span>
              <span className="font-mono text-cyan-300 font-bold">MOSPI-SSO-99182</span>
            </div>
          </div>
        </GlassPanel>

      </div>

    </div>
  );
};
