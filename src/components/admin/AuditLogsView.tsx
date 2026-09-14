import React, { useState } from 'react';
import type { SystemAuditLog } from '../../types';
import { ShieldAlert, Search } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: SystemAuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  // Extract unique users and actions for filter options
  const uniqueUsers = Array.from(new Set(auditLogs.map(l => l.user)));
  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.event)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.relatedProjectId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = userFilter === 'All' || log.user === userFilter;
    const matchesAction = actionFilter === 'All' || log.event === actionFilter;

    return matchesSearch && matchesUser && matchesAction;
  });

  return (
    <div className="space-y-6 font-sans pb-20 min-w-0">
      
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>SYSTEM AUDIT LOGS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit record of user access, project modifications, early warning triggers, and report exports.
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-cyan-400 self-start sm:self-auto">
          {filteredLogs.length} Filtered Audit Events
        </span>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by User, Action, or Project ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">User Filter</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5"
            >
              <option value="All">All System Users</option>
              {uniqueUsers.map(usr => (
                <option key={usr} value={usr}>{usr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Action Event</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5"
            >
              <option value="All">All Action Events</option>
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No audit log entries match the selected search criteria.
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-extrabold text-slate-400">
                  <th className="p-3 font-mono">Timestamp</th>
                  <th className="p-3">User Account</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Resource / Project</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">{log.user}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-400 border border-slate-700">
                        {log.event}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-teal-400 font-bold whitespace-nowrap">
                      {log.relatedProjectId || 'N/A'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Success
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
