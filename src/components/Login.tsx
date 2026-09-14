import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  AlertCircle,
  Building2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Zap,
  FileCheck
} from 'lucide-react';
import type { User } from '../types';
import { sampleUsers } from '../data/mockData';
import { IntelligenceField } from './background/IntelligenceField';
import { CursorGlow } from './background/CursorGlow';
import { AICore } from './motion/AICore';

interface LoginProps {
  onLogin: (user: User) => void;
  onBackToLanding?: () => void;
  onStartDemo?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBackToLanding, onStartDemo }) => {
  const [email, setEmail] = useState('director.infra@mospi.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [inputFocused, setInputFocused] = useState<'email' | 'password' | null>(null);
  const [authStep, setAuthStep] = useState<'idle' | 'authenticating' | 'verified' | 'granted'>('idle');

  const executeAuthSequence = (user: User) => {
    setAuthStep('authenticating');

    // 300ms authenticating -> 300ms verified -> 300ms granted -> dashboard
    setTimeout(() => {
      setAuthStep('verified');
      setTimeout(() => {
        setAuthStep('granted');
        setTimeout(() => {
          onLogin(user);
        }, 350);
      }, 350);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid government email address');
      return;
    }
    const matchedUser = sampleUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || sampleUsers[0];
    executeAuthSequence(matchedUser);
  };

  const handleQuickLogin = (user: User) => {
    setEmail(user.email);
    executeAuthSequence(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      
      {/* PRAEVISIO Intelligence Field */}
      <IntelligenceField projectState="normal" />

      {/* Desktop Mouse Parallax Glow */}
      <CursorGlow />

      <div className="sm:mx-auto sm:w-full sm:max-w-5xl relative z-10">
        
        {/* Top Back Link */}
        {onBackToLanding && (
          <div className="mb-4 text-left">
            <button
              onClick={onBackToLanding}
              className="text-xs font-mono text-cyan-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <span>← Back to PRAEVISIO Landing</span>
            </button>
          </div>
        )}

        {/* Main Glass Panel */}
        <div className={`bg-slate-900/80 backdrop-blur-2xl border ${
          inputFocused === 'email'
            ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
            : inputFocused === 'password'
            ? 'border-purple-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]'
            : 'border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]'
        } rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] glass-reflection transition-all duration-300`}>
          
          {/* Left Column: AI Core & Platform Info */}
          <div className="md:col-span-6 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-cyan-950/40 p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 relative">
            
            <div>
              <div className="flex items-center space-x-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50">
                  P
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-white">PRAEVISIO</h1>
                  <p className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider">
                    MoSPI Government Portal • Problem SIH26103
                  </p>
                </div>
              </div>

              {/* Central AI Core Indicator inside Login */}
              <div className="my-6 flex justify-center">
                <AICore 
                  size="lg" 
                  state={inputFocused === 'password' ? 'PREDICTING' : inputFocused === 'email' ? 'PROCESSING' : 'IDLE'}
                />
              </div>

              <div className="space-y-3 mt-4 text-center sm:text-left">
                <h2 className="text-lg font-extrabold text-white leading-tight">
                  AI-Powered Predictive Analytics & Early Warning System
                </h2>
                
                <div className="inline-flex items-center space-x-2 bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs px-4 py-1.5 rounded-xl font-bold shadow-inner">
                  <span>PREDICT</span>
                  <span className="text-purple-400">→</span>
                  <span>EXPLAIN</span>
                  <span className="text-purple-400">→</span>
                  <span>ACT</span>
                </div>
              </div>
            </div>

            <div className="my-6 space-y-3">
              <div className="flex items-start space-x-3 text-slate-300 text-xs">
                <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span>Predictive Risk Score (0-100) & Delay Forecasting</span>
              </div>
              <div className="flex items-start space-x-3 text-slate-300 text-xs">
                <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <span>Explainable AI (XAI) SHAP Feature Attributions</span>
              </div>
              <div className="flex items-start space-x-3 text-slate-300 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Prescriptive Actions & Officer Action Workflows</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">TEAM-CONNECT</span>
              </div>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                SIH 2026 DEMO
              </span>
            </div>

          </div>

          {/* Right Column: Glass Login Form */}
          <div className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-slate-950/70">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Authorized Monitoring Portal</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your official credentials to access national monitoring data.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-950/60 border border-red-800 text-red-300 px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Government Email / NIC ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setInputFocused('email')}
                      onBlur={() => setInputFocused(null)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                      placeholder="director.infra@mospi.gov.in"
                      disabled={authStep !== 'idle'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setInputFocused('password')}
                      onBlur={() => setInputFocused(null)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                      placeholder="••••••••••••"
                      disabled={authStep !== 'idle'}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Remember session</span>
                  </label>
                </div>

                {/* SUBMIT BUTTON WITH AUTH SEQUENCE */}
                <button
                  type="submit"
                  disabled={authStep !== 'idle'}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg transition-all ${
                    authStep === 'idle'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]'
                      : authStep === 'authenticating'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : authStep === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  }`}
                >
                  {authStep === 'idle' && (
                    <>
                      <span>SIGN IN TO COMMAND CENTER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {authStep === 'authenticating' && (
                    <span>AUTHENTICATING CREDENTIALS...</span>
                  )}
                  {authStep === 'verified' && (
                    <span className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>AUTHENTICATION VERIFIED</span>
                    </span>
                  )}
                  {authStep === 'granted' && (
                    <span>PRAEVISIO SYSTEM ACCESS GRANTED...</span>
                  )}
                </button>
              </form>
            </div>

            {/* QUICK DEMO ROLES */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              {onStartDemo && (
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>START LAUNCH SIH 2026 DEMO MODE</span>
                </button>
              )}

              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>DEMO ROLE QUICK-SELECT:</span>
                <span className="text-cyan-400">SIH 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {sampleUsers.slice(0, 4).map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => handleQuickLogin(usr)}
                    disabled={authStep !== 'idle'}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors text-slate-300 hover:text-white"
                  >
                    <div className="font-bold truncate">{usr.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 capitalize truncate">
                      {usr.role.replace('_', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
