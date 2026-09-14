import { useState, useEffect } from 'react';
import type { User, Project, ProjectSector, ProjectStatus, ProjectImage, ProjectAuditLog, StoredUser } from './types';
import { initialProjects, ALL_SECTORS } from './data/mockData';
import { getStoredUsers, storedUserToAppUser } from './data/userStore';
import { GovHeader } from './components/gov/GovHeader';
import { GovNav } from './components/gov/GovNav';
import { Login } from './components/gov/Login';
import { SectorDashboard } from './components/gov/SectorDashboard';
import { ProjectDetail } from './components/gov/ProjectDetail';
import { AdminPanel } from './components/gov/AdminPanel';
import { AllProjectsView } from './components/gov/AllProjectsView';

const STORAGE_PROJECTS_KEY = 'sih26103_projects_v3';
const STORAGE_CURRENT_USER_KEY = 'sih26103_current_user_v3';

export default function App() {
  // Check URL hash for admin route: #admin-login or #admin
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.hash === '#admin-login' || window.location.hash === '#admin';
  });

  // Track hash changes in window
  useEffect(() => {
    const handleHashChange = () => {
      const isAdm = window.location.hash === '#admin-login' || window.location.hash === '#admin';
      setIsAdminRoute(isAdm);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize Users from userStore (localStorage backed)
  const [storedUsersList, setStoredUsersList] = useState<StoredUser[]>(() => {
    return getStoredUsers();
  });

  // Initialize Current User (restore from localStorage if valid)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Default to Rahul Sharma (Railways) for immediate preview, or null if logged out
    const defaults = getStoredUsers();
    const defaultOfficer = defaults.find((u) => u.user_id === 'rahul_railways') || defaults[0];
    return defaultOfficer ? storedUserToAppUser(defaultOfficer) : null;
  });

  // Initialize Projects from storage or mock data
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialProjects;
  });

  // Active Sector being monitored
  const [activeSector, setActiveSector] = useState<ProjectSector | 'All'>(() => {
    if (currentUser?.role === 'admin') return 'All';
    return (currentUser?.sector as ProjectSector) || 
           (currentUser?.assignedSectors?.[0] as ProjectSector) || 
           'Railways';
  });

  // Current View: 'dashboard' | 'all_projects' | 'project_detail' | 'admin'
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  // Selected Project for Inspection
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);

  // Sync projects to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Sync currentUser to LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Sync sector whenever current user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActiveSector('All');
      } else {
        const officerSector = (currentUser.sector as ProjectSector) || 
                              (currentUser.assignedSectors?.[0] as ProjectSector) || 
                              'Railways';
        setActiveSector(officerSector);
      }
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (storedUser: StoredUser) => {
    const appUser = storedUserToAppUser(storedUser);
    setCurrentUser(appUser);
    
    if (appUser.role === 'admin') {
      setActiveSector('All');
      setCurrentPage('dashboard');
    } else {
      const sector = (storedUser.sector as ProjectSector) || 'Railways';
      setActiveSector(sector);
      setCurrentPage('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  };

  const handleSwitchLoginRoute = (toAdmin: boolean) => {
    setIsAdminRoute(toAdmin);
    window.location.hash = toAdmin ? 'admin-login' : '';
  };

  // Navigation Handlers
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSector = (sector: ProjectSector | 'All') => {
    // Only admins can switch sectors freely
    if (currentUser?.role === 'admin') {
      setActiveSector(sector);
      if (currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
      }
    }
  };

  // Project Mutations
  const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus, note: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newAudit: ProjectAuditLog = {
          id: `aud-${Date.now()}`,
          date: 'Today, 2026',
          author: currentUser?.name || 'Monitoring Officer',
          role: currentUser?.designation || 'Sector Officer',
          actionTaken: `Status adjusted to ${newStatus}`,
          note: note || 'Inspection report review completed',
          previousRiskScore: p.riskScore || 50,
          newRiskScore: newStatus === 'On Track' ? 25 : newStatus === 'At Risk' ? 65 : 85
        };
        return {
          ...p,
          status: newStatus,
          lastUpdated: 'Today, 2026',
          auditTrail: [newAudit, ...(p.auditTrail || [])]
        };
      })
    );
  };

  const handleAddProjectImage = (projectId: string, newImage: ProjectImage) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          images: [newImage, ...(p.images || [])],
          lastUpdated: 'Today, 2026'
        };
      })
    );
  };

  // User Management
  const handleAddUser = (_newUser: User) => {
    setStoredUsersList(getStoredUsers());
  };

  const handleUpdateUserSector = (_userId: string, _newSector: ProjectSector) => {
    setStoredUsersList(getStoredUsers());
  };

  const handleToggleUserStatus = (_userId: string) => {
    setStoredUsersList(getStoredUsers());
  };

  // If user is not logged in, render the official Login page
  if (!currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        isAdminRoute={isAdminRoute}
        onSwitchRoute={handleSwitchLoginRoute}
        availableSectors={ALL_SECTORS as unknown as ProjectSector[]}
      />
    );
  }

  // Find currently inspected project
  const currentSelectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Convert storedUsersList to app User[] for AdminPanel
  const appUsersList = storedUsersList.map(storedUserToAppUser);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* 1. Official Government Header with Emblem and Officer Info */}
      <GovHeader
        currentUser={currentUser}
        activeSector={activeSector}
        onSelectSector={handleSelectSector}
        onLogout={handleLogout}
        availableSectors={ALL_SECTORS as unknown as ProjectSector[]}
      />

      {/* 2. Primary Government Navigation Bar */}
      <GovNav
        currentPage={currentPage}
        onNavigate={(page) => {
          // Prevent regular officer from accessing admin panel
          if (page === 'admin' && currentUser.role !== 'admin') {
            setCurrentPage('dashboard');
            return;
          }
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userRole={currentUser.role}
        selectedProjectName={currentSelectedProject?.name}
      />

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'dashboard' && (
          <SectorDashboard
            projects={projects}
            currentUser={currentUser}
            activeSector={activeSector}
            onSelectProject={handleSelectProject}
            onSelectSector={handleSelectSector}
          />
        )}

        {currentPage === 'all_projects' && (
          <AllProjectsView
            projects={projects}
            sectors={ALL_SECTORS as unknown as ProjectSector[]}
            currentUser={currentUser}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentPage === 'project_detail' && currentSelectedProject && (
          <ProjectDetail
            project={currentSelectedProject}
            onBack={() => setCurrentPage('dashboard')}
            onUpdateStatus={handleUpdateProjectStatus}
            onAddImage={handleAddProjectImage}
          />
        )}

        {currentPage === 'admin' && currentUser.role === 'admin' && (
          <AdminPanel
            users={appUsersList}
            sectors={ALL_SECTORS as unknown as ProjectSector[]}
            onAddUser={handleAddUser}
            onUpdateUserSector={handleUpdateUserSector}
            onToggleUserStatus={handleToggleUserStatus}
          />
        )}
      </main>

      {/* 4. Official Government Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-5 px-4 sm:px-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-amber-300 text-xs border border-white/20">
              GOI
            </div>
            <div>
              <div className="font-semibold text-slate-200">
                SIH26103 — National Infrastructure Project Monitoring Portal
              </div>
              <div className="text-[11px] text-slate-400">
                Ministry of Statistics & Programme Implementation (MoSPI) • National Informatics Centre (NIC)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span>Server Time: <strong>IST (UTC+5:30)</strong></span>
            <span>•</span>
            <span>Security Compliance: <strong>GIGW v3.0 Certified</strong></span>
            <span>•</span>
            <span 
              onClick={handleLogout}
              className="text-amber-400 hover:text-amber-300 cursor-pointer underline font-medium"
              title="Switch user account"
            >
              Sign Out / Switch User
            </span>
            <span>•</span>
            <span 
              onClick={() => {
                localStorage.removeItem(STORAGE_PROJECTS_KEY);
                localStorage.removeItem('sih26103_users_db_v1');
                localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
                window.location.reload();
              }}
              className="text-blue-400 hover:text-blue-300 cursor-pointer underline"
              title="Reset data to initial state"
            >
              Reset Seed Data
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
