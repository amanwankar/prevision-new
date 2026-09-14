import React from 'react';
import type { User, Department, SystemAuditLog } from '../../types';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Key, 
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  departments: Department[];
  auditLogs: SystemAuditLog[];
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  departments,
  auditLogs,
  onNavigate
}) => {
  const activeUsers = users.filter(u => u.status === 'Active' || !u.status).length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  const recentSecurityLogs = auditLogs.filter(l => 
    l.event.includes('User') || l.event.includes('Security') || l.event.includes('Role') || l.event.includes('Access')
  ).slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Subtitle */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-amber-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <span>Administration & System Security Overview</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-based access control governance, department assignments, and security audit metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-mono font-bold">
            System Admin Level
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('#/admin/users')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-teal-500 cursor-pointer transition flex items-center space-x-3"
        >
          <div className="w-11 h-11 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Users</div>
            <div className="text-2xl font-black text-white mt-0.5">{users.length}</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('#/admin/users')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-emerald-500 cursor-pointer transition flex items-center space-x-3"
        >
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Users</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{activeUsers}</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('#/admin/departments')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-amber-500 cursor-pointer transition flex items-center space-x-3"
        >
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Departments</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{departments.length}</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('#/admin/users')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-red-500 cursor-pointer transition flex items-center space-x-3"
        >
          <div className="w-11 h-11 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Pending Requests</div>
            <div className="text-2xl font-black text-red-400 mt-0.5">{pendingUsers}</div>
          </div>
        </div>

      </div>

      {/* Security & Access Overview Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Key className="w-5 h-5 text-teal-400" />
              <span>Security & Access Overview</span>
            </h3>
            <p className="text-xs text-slate-400">Live active sessions, user status distribution, and authentication security metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Sessions</div>
            <div className="text-lg font-black text-white mt-1">1 Active Session</div>
            <div className="text-[10px] text-teal-400 mt-0.5">Current Admin Console Session</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Users</div>
            <div className="text-lg font-black text-emerald-400 mt-1">{activeUsers} Accounts</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Authorized for System Access</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Inactive Accounts</div>
            <div className="text-lg font-black text-slate-300 mt-1">{inactiveUsers} Deactivated</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Access Revoked</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Failed Login Attempts</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 leading-snug">
              Login security metrics available after authentication event tracking is enabled.
            </div>
          </div>

        </div>
      </section>

      {/* Grid: Recent User Activity & Recent Security Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent User Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-extrabold text-white">Recent User Directory</h3>
            <button
              onClick={() => onNavigate('#/admin/users')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {users.slice(0, 4).map(u => (
              <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email} • {u.department}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {u.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-extrabold text-white">Recent Security Audit Events</h3>
            <button
              onClick={() => onNavigate('#/admin/audit-logs')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
            >
              <span>View Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {recentSecurityLogs.length === 0 ? (
              <div className="py-4 text-xs text-slate-500 text-center">No security audit logs recorded.</div>
            ) : (
              recentSecurityLogs.map(log => (
                <div key={log.id} className="py-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-200">{log.event}</span>
                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                  <div className="text-[9px] font-mono text-teal-400">By: {log.user}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
