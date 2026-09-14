import React, { useState } from 'react';
import { Building2, LogOut, ChevronDown, Check } from 'lucide-react';
import type { User, ProjectSector } from '../../types';

interface GovHeaderProps {
  currentUser: User | null;
  activeSector: ProjectSector | 'All';
  onSelectSector: (sector: ProjectSector | 'All') => void;
  onLogout: () => void;
  availableSectors: ProjectSector[];
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentUser,
  activeSector,
  onSelectSector,
  onLogout,
  availableSectors
}) => {
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Indian National Tricolor Accent Line */}
      <div className="gov-tricolor-bar" />

      {/* Top Identity Band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Official Gov Emblem & Brand */}
        <div className="flex items-center gap-3.5">
          {/* Official Emblem Shield */}
          <div className="w-11 h-11 rounded-lg bg-blue-900 text-white flex flex-col items-center justify-center font-bold tracking-tight shadow-sm shrink-0 border border-blue-950">
            <span className="text-[9px] uppercase tracking-widest text-amber-300 font-semibold">GOI</span>
            <span className="text-xs leading-none font-extrabold">SIH</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Government of India
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SIH26103 Portal
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              National Infrastructure Project Monitoring Portal
            </h1>
          </div>
        </div>

        {/* Right: Officer Profile & Sector Badge */}
        {currentUser && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Sector Selector Pill: Admin has switcher; Officer has static locked sector */}
            {currentUser.role === 'admin' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-md text-xs font-medium transition cursor-pointer"
                  title="Change active sector view (Admin Authority)"
                >
                  <Building2 size={14} className="text-blue-700" />
                  <span className="font-semibold max-w-[150px] sm:max-w-[200px] truncate">
                    Sector: {activeSector}
                  </span>
                  <ChevronDown size={14} className="text-blue-600" />
                </button>

                {/* Sector Dropdown Menu for Admin */}
                {sectorDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSectorDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-xs max-h-80 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Admin Sector Oversight
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSector('All');
                          setSectorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          activeSector === 'All' ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <span>All Infrastructure Sectors (Consolidated)</span>
                        {activeSector === 'All' && <Check size={14} className="text-blue-600" />}
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
                            activeSector === sector ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{sector}</span>
                          {activeSector === sector && <Check size={14} className="text-blue-600 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Officer: Single locked assigned sector badge */
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md text-xs font-semibold">
                <Building2 size={14} className="text-blue-700 shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  Sector: {currentUser.sector || activeSector}
                </span>
              </div>
            )}

            {/* Officer Details & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1 justify-end">
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'admin' ? (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">
                      [{currentUser.user_id || currentUser.id}]
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {currentUser.role === 'admin' ? 'Central System Administrator' : `${currentUser.sector || activeSector} Officer`}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                title="Log Out of Portal"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
