import React, { useState } from 'react';
import { Building2, LogOut, ChevronDown, Check, FileDown, UserCheck } from 'lucide-react';
import type { User, ProjectSector } from '../../types';

interface GovHeaderProps {
  currentUser: User | null;
  activeSector: ProjectSector | 'All';
  onSelectSector: (sector: ProjectSector | 'All') => void;
  onLogout: () => void;
  availableSectors: ProjectSector[];
  onOpenReports?: () => void;
  onSwitchUser?: (userId: string) => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentUser,
  activeSector,
  onSelectSector,
  onLogout,
  availableSectors,
  onOpenReports,
  onSwitchUser
}) => {
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Subtle National Tricolor Accent Line */}
      <div className="gov-tricolor-bar" />

      {/* Streamlined Identity Band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black tracking-tight shadow-xs shrink-0 border border-blue-950">
            <span className="text-sm text-amber-300">P</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                PREVISION
              </span>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block mt-0.5">
              National Infrastructure Project Monitoring & Early Warning
            </p>
          </div>

          {/* PREVISION Multi-Horizon Predictive Surveillance Live Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[11px] font-medium border border-slate-800 shadow-xs ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-slate-200">Surveillance:</span>
            <span className="text-slate-300">3m/6m/12m Horizons Active</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300 font-semibold">EVM + SHAP</span>
          </div>
        </div>

        {/* Right: Actions, Sector, and User Info */}
        {currentUser && (
          <div className="flex items-center gap-2.5">
            {/* Download Report Quick Action */}
            {onOpenReports && (
              <button
                type="button"
                onClick={onOpenReports}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Open Reports & Download Project Dossiers"
              >
                <FileDown size={14} />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            )}

            {/* Sector Selector / Badge */}
            {currentUser.role === 'admin' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition cursor-pointer"
                  title="Filter Sector View (Admin)"
                >
                  <Building2 size={13} className="text-blue-800 shrink-0" />
                  <span className="max-w-[110px] sm:max-w-[150px] truncate">
                    {activeSector}
                  </span>
                  <ChevronDown size={13} className="text-slate-500" />
                </button>

                {/* Sector Dropdown Menu for Admin */}
                {sectorDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSectorDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs max-h-80 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Select Sector
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSector('All');
                          setSectorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          activeSector === 'All' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <span>All Sectors</span>
                        {activeSector === 'All' && <Check size={13} className="text-blue-600" />}
                      </button>
                      {availableSectors.map((sector) => (
                        <button
                          key={sector}
                          type="button"
                          onClick={() => {
                            onSelectSector(sector);
                            setSectorDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                            activeSector === sector ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{sector}</span>
                          {activeSector === sector && <Check size={13} className="text-blue-600 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md text-xs font-semibold">
                <Building2 size={13} className="text-blue-700 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {currentUser.sector || activeSector}
                </span>
              </div>
            )}

            {/* Officer Profile, Quick Switcher & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 relative">
              <button
                type="button"
                onClick={() => setOfficerDropdownOpen(!officerDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer text-left"
                title="Switch Officer Persona"
              >
                <div 
                  className="w-7 h-7 rounded-full bg-blue-900 text-amber-300 border border-blue-950 flex items-center justify-center font-bold text-xs shrink-0"
                >
                  {currentUser.name.charAt(0)}
                </div>

                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <ChevronDown size={11} className="text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.role === 'admin' ? 'Administrator' : `${currentUser.sector || 'Officer'}`}
                  </div>
                </div>
              </button>

              {/* Quick Persona Switcher Menu */}
              {officerDropdownOpen && onSwitchUser && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOfficerDropdownOpen(false)}
                  />
                  <div className="absolute right-8 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Switch PREVISION Persona</span>
                      <UserCheck size={12} className="text-blue-600" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser('priya_roads');
                        setOfficerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        currentUser.user_id === 'priya_roads' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">Priya Verma</div>
                        <div className="text-[10px] text-amber-800">Roads & Highways Sector Officer</div>
                      </div>
                      {currentUser.user_id === 'priya_roads' && <Check size={14} className="text-amber-700" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser('rahul_railways');
                        setOfficerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        currentUser.user_id === 'rahul_railways' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">Rahul Sharma</div>
                        <div className="text-[10px] text-blue-700">Railways Sector Officer</div>
                      </div>
                      {currentUser.user_id === 'rahul_railways' && <Check size={14} className="text-blue-700" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser('admin');
                        setOfficerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer border-t border-slate-100 ${
                        currentUser.user_id === 'admin' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">Chief Project Director</div>
                        <div className="text-[10px] text-slate-500">System Administrator (All Sectors)</div>
                      </div>
                      {currentUser.user_id === 'admin' && <Check size={14} className="text-blue-700" />}
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
