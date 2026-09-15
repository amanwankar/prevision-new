import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Check, 
  X, 
  Shield, 
  ShieldCheck, 
  Building2, 
  Eye, 
  EyeOff, 
  Copy, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  Lock
} from 'lucide-react';
import type { User, ProjectSector, StoredUser } from '../../types';
import { getStoredUsers, createStoredUser, saveStoredUsers, storedUserToAppUser } from '../../data/userStore';
import { subscribeToDatabase } from '../../services/unifiedDatabase';

interface AdminPanelProps {
  users: User[];
  sectors: ProjectSector[];
  onAddUser: (newUser: User) => void;
  onUpdateUserSector: (userId: string, newSector: ProjectSector) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users: _users,
  sectors,
  onAddUser,
  onUpdateUserSector: _onUpdateUserSector,
  onToggleUserStatus: _onToggleUserStatus
}) => {
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Sector Modal State
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [editSectorValue, setEditSectorValue] = useState<ProjectSector>(sectors[0]);

  // Form Fields per Requirement 2:
  // "Admin panel form fields: User ID, Password, Name, and a dropdown to 'Select Sector' (single select from the sector list)"
  const [formUserId, setFormUserId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formSector, setFormSector] = useState<string>(sectors[0] || 'Railways');
  const [formRole, setFormRole] = useState<'officer' | 'admin'>('officer');
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Load from userStore on mount and subscribe to unified database
  useEffect(() => {
    setStoredUsers(getStoredUsers());
    const unsubscribe = subscribeToDatabase(() => {
      setStoredUsers(getStoredUsers());
    });
    return unsubscribe;
  }, []);

  const refreshUsers = () => {
    setStoredUsers(getStoredUsers());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    const cleanUserId = formUserId.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUserId) {
      setFormError('User ID is required.');
      return;
    }
    if (!formPassword.trim()) {
      setFormError('Password is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!formSector) {
      setFormError('Please select an assigned sector.');
      return;
    }

    try {
      const result = createStoredUser({
        user_id: cleanUserId,
        password_hash: formPassword.trim(),
        name: formName.trim(),
        sector: formSector,
        role: formRole
      });

      if (!result.success || !result.user) {
        setFormError(result.error || 'Failed to create user account.');
        return;
      }

      const created = result.user;

      // Also trigger parent callback
      onAddUser(storedUserToAppUser(created));
      refreshUsers();
      setIsAddModalOpen(false);

      // Show success toast banner
      setSuccessNotice(
        `Account created for ${created.name}! User ID: "${created.user_id}", Password: "${created.password_hash}", Sector: "${created.sector}".`
      );

      // Reset form
      setFormUserId('');
      setFormPassword('');
      setFormName('');
      setFormSector(sectors[0] || 'Railways');
      setFormRole('officer');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user account.');
    }
  };

  const handleSaveSectorChange = () => {
    if (!editingUser) return;
    const current = getStoredUsers();
    const updated = current.map((u) => {
      if (u.user_id === editingUser.user_id) {
        return { ...u, sector: editSectorValue };
      }
      return u;
    });
    saveStoredUsers(updated);
    setStoredUsers(updated);
    setEditingUser(null);
    setSuccessNotice(`Sector for ${editingUser.name} updated to "${editSectorValue}".`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'admin') {
      alert('The primary System Administrator account cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove user "${userId}"?`)) {
      const current = getStoredUsers();
      const updated = current.filter((u) => u.user_id !== userId);
      saveStoredUsers(updated);
      setStoredUsers(updated);
    }
  };

  const handleCopyCredentials = (user: StoredUser) => {
    navigator.clipboard.writeText(`User ID: ${user.user_id} | Password: ${user.password_hash}`);
    setCopiedId(user.user_id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = storedUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
              Admin Authority
            </span>
            <span className="text-xs text-slate-500 font-medium">Role-Based User & Sector Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User Accounts & Sector Jurisdiction Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Create sector monitoring officers with strict single-sector jurisdiction. Logged-in officers only ever see projects belonging to their assigned sector.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Add New User Account</span>
        </button>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Database Schema Summary Card */}
      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Database Table: users (localStorage persistence)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Fields: <code>user_id</code>, <code>password_hash</code>, <code>name</code>, <code>sector</code>, <code>role</code>, <code>created_at</code>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Accounts</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{storedUsers.length}</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Sector Officers</span>
            <span className="text-lg font-bold text-blue-300 font-mono mt-0.5 block">
              {storedUsers.filter((u) => u.role === 'officer').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">System Admins</span>
            <span className="text-lg font-bold text-amber-300 font-mono mt-0.5 block">
              {storedUsers.filter((u) => u.role === 'admin').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Available Sectors</span>
            <span className="text-lg font-bold text-emerald-300 font-mono mt-0.5 block">{sectors.length}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by User ID, name, sector, or role..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredUsers.length}</strong> of {storedUsers.length} registered accounts
          </div>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Assigned Sector</th>
                <th>Role</th>
                <th>Password (Credentials)</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'admin';
                const isPassVisible = !!showPasswords[user.user_id];

                return (
                  <tr key={user.user_id}>
                    {/* User ID */}
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs text-slate-900">{user.user_id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td>
                      <div className="font-semibold text-slate-900 text-xs">{user.name}</div>
                    </td>

                    {/* Assigned Sector */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-blue-700 shrink-0" />
                        <span className="font-semibold text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {user.sector}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded uppercase tracking-wider ${
                        isAdmin 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {isAdmin ? <Shield size={11} className="text-amber-700" /> : <ShieldCheck size={11} className="text-slate-600" />}
                        <span>{user.role}</span>
                      </span>
                    </td>

                    {/* Password */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          {isPassVisible ? user.password_hash : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.user_id)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={isPassVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(user)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Copy User ID & Password"
                        >
                          {copiedId === user.user_id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{user.created_at || '2026-09-14'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setEditSectorValue(user.sector as ProjectSector);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 text-xs font-semibold rounded transition border border-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Change Sector Assignment"
                        >
                          <Edit3 size={12} />
                          <span>Reassign</span>
                        </button>

                        {user.user_id !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New User Account (Strictly complies with Requirement 2) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Create User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              {/* Field 1: User ID */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  placeholder="e.g. rahul_railways or priya_water"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Unique identifier used by the officer to log in.
                </p>
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="e.g. Pass@123"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Initial authentication key for portal access.
                </p>
              </div>

              {/* Field 3: Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                />
              </div>

              {/* Field 4: Select Sector (Single Select) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Sector <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSector}
                  onChange={(e) => setFormSector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                  required
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Per security rules: <strong>each user can only belong to ONE sector</strong>.
                </p>
              </div>

              {/* Field 5: Role */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('officer')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition ${
                      formRole === 'officer'
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Sector Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition ${
                      formRole === 'admin'
                        ? 'bg-amber-50 border-amber-600 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save & Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reassign Sector */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Reassign Sector Jurisdiction
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>Officer: <strong>{editingUser.name}</strong></div>
                <div className="font-mono text-slate-500 mt-0.5">User ID: {editingUser.user_id}</div>
                <div className="text-slate-500 mt-0.5">Current Sector: <strong className="text-blue-900">{editingUser.sector}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assign New Sector
                </label>
                <select
                  value={editSectorValue}
                  onChange={(e) => setEditSectorValue(e.target.value as ProjectSector)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSectorChange}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Update Sector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
