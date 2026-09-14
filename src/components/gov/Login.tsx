import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  KeyRound, 
  AlertCircle,
  ShieldAlert,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import type { StoredUser, ProjectSector } from '../../types';
import { authenticateUser, getStoredUsers } from '../../data/userStore';

interface LoginProps {
  onLogin: (user: StoredUser) => void;
  isAdminRoute: boolean;
  onSwitchRoute: (toAdmin: boolean) => void;
  availableSectors: ProjectSector[];
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  isAdminRoute,
  onSwitchRoute,
  availableSectors: _availableSectors
}) => {
  const [userId, setUserId] = useState(isAdminRoute ? 'admin' : 'rahul_railways');
  const [password, setPassword] = useState(isAdminRoute ? 'admin123' : 'rail123');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'quick'>('form');

  // Load latest users from storage
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    setStoredUsers(getStoredUsers());
  }, [isAdminRoute]);

  // Update default credentials when route switches
  useEffect(() => {
    setError(null);
    if (isAdminRoute) {
      setUserId('admin');
      setPassword('admin123');
    } else {
      setUserId('rahul_railways');
      setPassword('rail123');
    }
  }, [isAdminRoute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim()) {
      setError('Please enter your User ID.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your Password.');
      return;
    }

    const authenticated = authenticateUser(
      userId, 
      password, 
      isAdminRoute ? 'admin' : undefined
    );

    if (!authenticated) {
      if (isAdminRoute) {
        setError('Invalid Admin credentials. Use User ID "admin" and Password "admin123".');
      } else {
        setError('Invalid User ID or Password. Please check your credentials or pick an account below.');
      }
      return;
    }

    onLogin(authenticated);
  };

  const handleSelectQuickUser = (user: StoredUser) => {
    setUserId(user.user_id);
    setPassword(user.password_hash);
    setError(null);
    onLogin(user);
  };

  // Filter officers for quick demo list
  const officerUsers = storedUsers.filter((u) => u.role === 'officer');
  const adminUsers = storedUsers.filter((u) => u.role === 'admin');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Tricolor Bar */}
      <div className="gov-tricolor-bar" />

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
          
          {/* Header Banner - Conditional styling for Admin vs Officer */}
          <div className={`${isAdminRoute ? 'bg-slate-900 border-slate-950' : 'bg-blue-900 border-blue-950'} text-white px-6 sm:px-8 py-6 border-b transition-colors`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg ${isAdminRoute ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' : 'bg-white/10 border-white/20 text-white'} border flex flex-col items-center justify-center font-bold tracking-tight shrink-0 shadow-inner`}>
                  {isAdminRoute ? (
                    <>
                      <ShieldAlert size={20} className="text-amber-400" />
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5">ADMIN</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-amber-300 uppercase tracking-widest font-semibold">GOI</span>
                      <span className="text-base font-extrabold text-white">SIH</span>
                    </>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                      Government of India
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isAdminRoute ? 'text-amber-300 bg-amber-950/80 border-amber-600' : 'text-amber-300 bg-blue-950/80 border-blue-800'}`}>
                      {isAdminRoute ? 'RESTRICTED ADMIN ROUTE' : 'SECTOR OFFICER PORTAL'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                    {isAdminRoute ? 'Central Administration Gateway' : 'National Infrastructure Monitoring Portal'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {isAdminRoute 
                      ? 'Cross-Sector Central Oversight, User Provisioning & System Authority' 
                      : 'Role-Based, Sector-Restricted Infrastructure Surveillance'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Info Bar */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              {isAdminRoute ? (
                <>
                  <Lock size={14} className="text-amber-600" />
                  <span>Hidden Route: <code className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold">#admin-login</code></span>
                </>
              ) : (
                <>
                  <Building2 size={14} className="text-blue-700" />
                  <span>Sector Isolation Active: <strong>Users view ONLY their assigned sector</strong></span>
                </>
              )}
            </div>

            {/* Switch between Officer and Admin Route */}
            <button
              type="button"
              onClick={() => onSwitchRoute(!isAdminRoute)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isAdminRoute ? 'Switch to Sector Officer Login' : 'Admin Login (Restricted Route)'}</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Login Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Quick Toggle Tabs */}
            {!isAdminRoute && (
              <div className="flex border-b border-slate-200 bg-slate-50 rounded-lg p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`flex-1 py-2 px-3 rounded-md transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'form' 
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200 font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock size={14} />
                  <span>Enter User ID & Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 py-2 px-3 rounded-md transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'quick' 
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200 font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck size={14} />
                  <span>Quick Test Sector Officers ({officerUsers.length})</span>
                </button>
              </div>
            )}

            {/* Form Mode */}
            {(isAdminRoute || activeTab === 'form') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAdminRoute ? 'Administrator User ID' : 'Officer User ID'}
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={isAdminRoute ? 'admin' : 'e.g., rahul_railways'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isAdminRoute 
                      ? 'Default central admin ID is "admin"' 
                      : 'System fetches your assigned sector upon credential validation.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isAdminRoute ? 'Default password is "admin123"' : 'Demo accounts use password like "rail123", "road123", etc.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 ${
                      isAdminRoute 
                        ? 'bg-slate-900 hover:bg-black text-amber-300' 
                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                    } font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 text-xs transition cursor-pointer`}
                  >
                    <KeyRound size={15} />
                    <span>
                      {isAdminRoute 
                        ? 'Authenticate Central Administrator' 
                        : 'Validate Credentials & Open Sector Dashboard'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Selector for testing different sectors */}
            {!isAdminRoute && activeTab === 'quick' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600 mb-2">
                  Select any pre-seeded sector officer below to test <strong>automatic sector restriction</strong>:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {officerUsers.map((user) => (
                    <div
                      key={user.user_id}
                      onClick={() => handleSelectQuickUser(user)}
                      className="p-3 bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 rounded-lg text-left cursor-pointer transition shadow-2xs group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                            {user.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            ID: <span className="text-blue-700 font-semibold">{user.user_id}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-200 shrink-0">
                          {user.sector}
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Pass: <code className="font-mono text-slate-700">{user.password_hash}</code></span>
                        <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-0.5">
                          Log In <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Credentials helper for testing Admin route */}
            {isAdminRoute && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldCheck size={16} className="text-amber-700" />
                  <span>Admin Credentials Information</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Use the master administrator account to see <strong>all sectors</strong>, monitor national metrics, and use the <strong>Admin Panel</strong> to create new sector officer accounts.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono bg-white p-2 rounded border border-amber-200">
                  <span>User ID: <strong>admin</strong></span>
                  <span>•</span>
                  <span>Password: <strong>admin123</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      if (adminUsers.length > 0) {
                        handleSelectQuickUser(adminUsers[0]);
                      } else {
                        setUserId('admin');
                        setPassword('admin123');
                      }
                    }}
                    className="ml-auto text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-sans font-semibold px-2 py-0.5 rounded cursor-pointer"
                  >
                    1-Click Fill & Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Security Compliance Note */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-400 text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>NIC Certified GIGW v3.0 Auth Gateway</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isAdminRoute ? 'Route: /admin/login' : 'Route: /login'}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Official Government Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-3 px-4 sm:px-8 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Government of India — Ministry of Statistics and Programme Implementation (MoSPI)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span 
              onClick={() => onSwitchRoute(!isAdminRoute)} 
              className="text-amber-400 hover:underline cursor-pointer"
            >
              {isAdminRoute ? 'Return to Sector Officer Portal' : 'Admin Portal Route (#admin-login)'}
            </span>
            <span>•</span>
            <span>Security Code: SIH26103</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
