import React, { useState } from 'react';
import { LayoutDashboard, FolderKanban, FileText, Users, FileDown, Menu, X } from 'lucide-react';
import type { UserRole } from '../../types';

interface GovNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: UserRole;
  selectedProjectName?: string | null;
}

export const GovNav: React.FC<GovNavProps> = ({
  currentPage,
  onNavigate,
  userRole,
  selectedProjectName
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userRole === 'admin';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Sector Dashboard',
      icon: LayoutDashboard,
      description: 'Sector health & monitoring'
    },
    {
      id: 'all_projects',
      label: isAdmin ? 'All Projects (Multi-Sector)' : 'Sector Projects',
      icon: FolderKanban,
      description: 'Search & filter directory'
    },
    {
      id: 'reports',
      label: 'Reports & Downloads',
      icon: FileDown,
      description: 'Project dossiers & CSV/PDF export',
      badge: 'Export'
    },
    {
      id: 'project_detail',
      label: selectedProjectName ? `Project: ${selectedProjectName.slice(0, 20)}...` : 'Project Detail',
      icon: FileText,
      description: 'Map, gallery & timeline',
      badge: selectedProjectName ? 'Active' : undefined
    },
    ...(isAdmin ? [
      {
        id: 'admin',
        label: 'Admin Panel',
        icon: Users,
        description: 'Users & sector assignment',
        adminOnly: true
      }
    ] : [])
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-blue-900 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-800 text-white shadow-inner border border-blue-700'
                      : 'text-blue-100 hover:bg-blue-800/60 hover:text-white'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-amber-300' : 'text-blue-200'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-400 text-blue-950 font-bold px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice Tag on Desktop */}
          <div className="hidden md:flex items-center text-xs text-blue-200 gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-100">PREVISION Surveillance Active</span>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden w-full justify-between items-center py-2">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              {navItems.find((n) => n.id === currentPage)?.label || 'Navigation'}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-1 pb-3 space-y-1 border-t border-blue-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-800 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-amber-300' : 'text-blue-300'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-400 text-blue-950 font-bold px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
