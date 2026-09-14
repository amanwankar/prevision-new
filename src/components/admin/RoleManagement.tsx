import React, { useState } from 'react';
import type { User, PermissionKey, UserRole } from '../../types';
import { APPLICATION_ROLES, ALL_PERMISSIONS } from '../../services/roleService';
import { ShieldCheck, Check, X, Key, Info } from 'lucide-react';

interface RoleManagementProps {
  users: User[];
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ users }) => {
  // Configurable matrix permissions state
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, PermissionKey[]>>(() => {
    const map: Partial<Record<UserRole, PermissionKey[]>> = {};
    APPLICATION_ROLES.forEach(r => {
      map[r.id] = [...r.permissions];
    });
    return map as Record<UserRole, PermissionKey[]>;
  });

  const [selectedRoleId, setSelectedRoleId] = useState<UserRole>('admin');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTogglePermission = (roleId: UserRole, permKey: PermissionKey) => {
    if (roleId === 'admin') {
      showToast('System Administrator permissions are permanently locked for security.');
      return;
    }

    setRolePermissions(prev => {
      const current = prev[roleId] || [];
      const updated = current.includes(permKey) 
        ? current.filter(k => k !== permKey) 
        : [...current, permKey];

      return { ...prev, [roleId]: updated };
    });

    showToast(`Permission updated for ${APPLICATION_ROLES.find(r => r.id === roleId)?.title}.`);
  };

  return (
    <div className="space-y-6 font-sans pb-20 min-w-0">
      
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[80] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-stagger-fade">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Key className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Role Management & Permission Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure application access roles and fine-grained system permission mappings.
          </p>
        </div>
      </div>

      {/* Role Cards Grid (5 Application Roles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {APPLICATION_ROLES.map(role => {
          const userCount = users.filter(u => u.role === role.id).length;
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white">{role.title}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                    {userCount} Users
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed min-h-[3rem]">
                  {role.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {rolePermissions[role.id]?.length || 0} Permissions
                </span>
                <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-teal-400'}`}>
                  {isSelected ? 'Viewing' : 'Select'} →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Disclaimer Note */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Demonstration Notice: </span>
          These application roles configure user authorization within PRAEVISIO for this demonstration. Do not represent them as official MoSPI organizational roles unless officially configured.
        </div>
      </div>

      {/* PERMISSION MATRIX TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Application Permission Matrix</h3>
            <p className="text-xs text-slate-400">Toggle permissions across roles to enforce strict access control boundaries.</p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {ALL_PERMISSIONS.length} Controlled System Privileges
          </span>
        </div>

        <div className="table-scroll-container">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-extrabold text-slate-400">
                <th className="p-3 w-1/3">Permission Name & Description</th>
                {APPLICATION_ROLES.map(r => (
                  <th key={r.id} className="p-3 text-center">
                    <div>{r.title}</div>
                    <div className="text-[9px] font-mono text-slate-500 font-normal">({r.id})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ALL_PERMISSIONS.map(perm => (
                <tr key={perm.key} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="font-bold text-white">{perm.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                  </td>

                  {APPLICATION_ROLES.map(r => {
                    const isGranted = (rolePermissions[r.id] || []).includes(perm.key);
                    return (
                      <td key={r.id} className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(r.id, perm.key)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                            isGranted 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                              : 'bg-slate-800 text-slate-600 border border-slate-700 hover:text-slate-400'
                          }`}
                          title={`Toggle ${perm.label} for ${r.title}`}
                        >
                          {isGranted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
