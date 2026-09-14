import React, { useState, useEffect } from 'react';
import type { User, UserRole, UserStatus, Project } from '../types';
import { 
  getUsers, 
  createUser, 
  deactivateUser, 
  resetUserAccess 
} from '../services/userService';
import { 
  Users, 
  Search, 
  Eye, 
  Edit3, 
  UserX, 
  RotateCcw, 
  CheckCircle2, 
  X,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

interface UserManagementProps {
  currentUser?: User | null;
  allProjects?: Project[];
  onSelectUser?: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  allProjects: _allProjects = [],
  onSelectUser
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [deactivateConfirmUser, setDeactivateConfirmUser] = useState<User | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Create User Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('sector_lead');
  const [department, setDepartment] = useState<string>('Ministry of Road Transport & Highways');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    const list = await getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateUser = async () => {
    setFormError(null);
    if (!name.trim() || !email.trim()) {
      setFormError('Full Name and Email are required.');
      return;
    }

    try {
      await createUser({
        name,
        email,
        role,
        department,
        phone,
        status,
        designation: role === 'admin' ? 'System Administrator' : role === 'senior_director' ? 'Senior Monitoring Officer' : 'Project Officer'
      }, currentUser?.name || 'System Administrator');

      await loadData();
      setIsCreating(false);
      setName('');
      setEmail('');
      setPhone('');
      showToast('User created successfully.');
    } catch (e: any) {
      setFormError(e.message || 'Failed to create user.');
    }
  };

  const handleDeactivate = async (userId: string) => {
    await deactivateUser(userId, currentUser?.name || 'System Administrator');
    await loadData();
    setDeactivateConfirmUser(null);
    showToast('User deactivated successfully.');
  };

  const handleResetAccess = async (userId: string) => {
    await resetUserAccess(userId, currentUser?.name || 'System Administrator');
    await loadData();
    showToast('User security access reset successfully.');
  };

  // Extract unique departments for filter dropdown
  const uniqueDepartments = Array.from(new Set(users.map(u => u.department)));

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesDept = departmentFilter === 'All' || u.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || (u.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-20 min-w-0">
      
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[80] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-stagger-fade">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Deactivate User Account?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to deactivate <span className="text-white font-bold">{deactivateConfirmUser.name}</span>? Access to the platform will be revoked immediately.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeactivateConfirmUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(deactivateConfirmUser.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Create New Officer Account</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="r.kumar@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Role</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Road Transport & Highways"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded text-[10px] text-slate-400 border border-slate-800">
                <strong className="text-slate-300">Security Note: </strong> Credentials and passwords are managed through the configured authentication provider interface.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users className="w-7 h-7 text-amber-400" />
            <span>User Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage officer user accounts, departmental scopes, and role-based permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreating(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Search & Multi-Filter Control */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Name, Email, Role, Department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5"
            >
              <option value="All">All Roles</option>
              <option value="admin">System Administrator</option>
              <option value="senior_director">Senior Officer</option>
              <option value="sector_lead">Project Monitoring Officer</option>
              <option value="field_inspector">Project Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5"
            >
              <option value="All">All Departments</option>
              {uniqueDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

      </div>

      {/* USER TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="table-scroll-container">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-800">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Access Status</th>
                <th className="p-3.5 font-mono">Last Login</th>
                <th className="p-3.5 font-mono">Created</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" />
                      <div>
                        <div className="font-bold text-white text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-teal-400 text-[11px]">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] capitalize border ${
                      u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      u.role === 'senior_director' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs truncate">{u.department}</td>
                  <td className="p-3.5 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      u.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      u.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">{u.lastLogin || 'Today'}</td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">{u.createdDate || '2026-08-15'}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onSelectUser && onSelectUser(u.id)}
                        className="p-1 text-slate-400 hover:text-teal-400 transition"
                        title="View User Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectUser && onSelectUser(u.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition"
                        title="Edit Permissions"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleResetAccess(u.id)}
                        className="p-1 text-slate-400 hover:text-blue-400 transition"
                        title="Reset Access Credentials"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {u.status !== 'Inactive' && (
                        <button
                          onClick={() => setDeactivateConfirmUser(u)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                          title="Deactivate Account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
