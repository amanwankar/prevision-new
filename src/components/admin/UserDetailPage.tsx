import React, { useState } from 'react';
import type { User, Project, SystemAuditLog, UserRole, UserStatus } from '../../types';
import { getRoleDefinition } from '../../services/roleService';
import { 
  ArrowLeft, 
  Edit3, 
  UserX, 
  CheckCircle2, 
  Clock, 
  Key,
  X
} from 'lucide-react';

interface UserDetailPageProps {
  user: User;
  allProjects: Project[];
  auditLogs: SystemAuditLog[];
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeactivateUser: (userId: string) => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  user,
  allProjects,
  auditLogs,
  onBack,
  onUpdateUser,
  onDeactivateUser
}) => {
  const roleDef = getRoleDefinition(user.role);
  const userAuditLogs = auditLogs.filter(l => l.user.includes(user.name) || l.details.includes(user.email));

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<boolean>(false);

  // Edit form state
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [department, setDepartment] = useState(user.department);
  const [status, setStatus] = useState<UserStatus>(user.status || 'Active');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(user.authorizedProjects || []);

  const handleToggleProjectAccess = (pId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const handleSaveEdit = () => {
    const updated: User = {
      ...user,
      name,
      role,
      department,
      status,
      authorizedProjects: selectedProjectIds
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users Directory</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Edit User Access</span>
          </button>

          {user.status !== 'Inactive' && (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 flex items-center space-x-1.5 transition"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Deactivate Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <UserX className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Deactivate User Account?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to deactivate <span className="text-white font-bold">{user.name}</span>? They will no longer be able to log in or access project data.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeactivateUser(user.id);
                  setShowDeactivateConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Edit User Access Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="admin">System Administrator</option>
                    <option value="senior_director">Senior Monitoring Officer</option>
                    <option value="sector_lead">Project Monitoring Officer</option>
                    <option value="field_inspector">Project Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              {/* Project Access Checkboxes */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  Project Authorization Scope (Project-Level RBAC)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {allProjects.map(p => (
                    <label key={p.id} className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(p.id)}
                        onChange={() => handleToggleProjectAccess(p.id)}
                        className="rounded text-teal-500 accent-teal-500"
                      />
                      <span><strong className="text-white">{p.code}</strong> - {p.name} ({p.sector})</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/80 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-white">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                user.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                user.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {user.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.designation} • {user.department}</p>
            <p className="text-xs text-teal-400 font-mono mt-1">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs text-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Role</div>
            <div className="font-extrabold text-amber-400 capitalize mt-0.5">{user.role.replace('_', ' ')}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Created Date</div>
            <div className="font-mono text-slate-300 mt-0.5">{user.createdDate || '2026-08-15'}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Last Login</div>
            <div className="font-mono text-slate-300 mt-0.5">{user.lastLogin || 'Today'}</div>
          </div>
        </div>
      </div>

      {/* Grid: Access Summary & Activity Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Access Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Key className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-extrabold text-white">Access & Authorization Summary</h3>
          </div>

          <div className="space-y-3 text-xs">
            
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Role Description</div>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {roleDef.description}
              </p>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Authorized Projects (Project-Level Access)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.authorizedProjects && user.authorizedProjects.length > 0 ? (
                  user.authorizedProjects.map(pId => {
                    const prj = allProjects.find(p => p.id === pId);
                    return (
                      <span key={pId} className="px-2 py-1 bg-slate-800 text-teal-300 border border-slate-700 rounded font-mono font-bold">
                        {prj ? `${prj.code}` : pId}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-slate-500">All Portfolio Projects Authorized</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Granted Permissions</div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {roleDef.permissions.map(perm => (
                  <div key={perm} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{perm.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">Recent Activity & Audit Logs</h3>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {userAuditLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No recent activity recorded for this user account.</div>
            ) : (
              userAuditLogs.map(log => (
                <div key={log.id} className="py-2.5 space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{log.event}</span>
                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
