import { useState, useEffect } from 'react';
import type { User, Project, ProjectSector, ProjectStatus, ProjectImage, StoredUser } from './types';
import { ALL_SECTORS } from './data/mockData';
import { storedUserToAppUser } from './data/userStore';
import { 
  getProjectsTable, 
  getUsersTable, 
  updateProjectStatus as dbUpdateProjectStatus, 
  addImageToProject as dbAddImageToProject, 
  subscribeToDatabase, 
  resetDatabase 
} from './services/unifiedDatabase';
import { GovHeader } from './components/gov/GovHeader';
import { GovNav } from './components/gov/GovNav';
import { Login } from './components/gov/Login';
import { SectorDashboard } from './components/gov/SectorDashboard';
import { ProjectDetail } from './components/gov/ProjectDetail';
import { AdminPanel } from './components/gov/AdminPanel';
import { AllProjectsView } from './components/gov/AllProjectsView';
import { ReportsSection } from './components/gov/ReportsSection';

const STORAGE_CURRENT_USER_KEY = 'prevision_current_user_v4';

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

  // Initialize Users from unified database
  const [storedUsersList, setStoredUsersList] = useState<StoredUser[]>(() => {
    return getUsersTable();
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
    const defaults = getUsersTable();
    const defaultOfficer = defaults.find((u) => u.user_id === 'rahul_railways') || defaults[0];
    return defaultOfficer ? storedUserToAppUser(defaultOfficer) : null;
  });

  // Initialize Projects from unified database
  const [projects, setProjects] = useState<Project[]>(() => {
    return getProjectsTable();
  });

  // Listen for database changes across all pages and components
  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      setProjects(getProjectsTable());
      setStoredUsersList(getUsersTable());
    });
    return unsubscribe;
  }, []);

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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return projects[0]?.id || null;
  });

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

  // Project Mutations via Unified Database
  const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus, note: string) => {
    dbUpdateProjectStatus(
      projectId,
      newStatus,
      note,
      currentUser?.name || 'Monitoring Officer',
      currentUser?.designation || 'Sector Officer'
    );
  };

  const handleAddProjectImage = (projectId: string, newImage: ProjectImage) => {
    dbAddImageToProject(projectId, newImage);
  };

  // User Management callbacks for Admin Panel
  const handleAddUser = () => {
    setStoredUsersList(getUsersTable());
  };

  const handleUpdateUserSector = () => {
    setStoredUsersList(getUsersTable());
  };

  const handleToggleUserStatus = () => {
    setStoredUsersList(getUsersTable());
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
      {/* 1. Simplified PREVISION Header with Officer Info & Quick Report Download */}
      <GovHeader
        currentUser={currentUser}
        activeSector={activeSector}
        onSelectSector={handleSelectSector}
        onLogout={handleLogout}
        availableSectors={ALL_SECTORS as unknown as ProjectSector[]}
        onOpenReports={() => {
          setCurrentPage('reports');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSwitchUser={(targetUserId) => {
          const allUsers = getUsersTable();
          const target = allUsers.find((u) => u.user_id === targetUserId);
          if (target) {
            handleLogin(target);
          }
        }}
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

        {currentPage === 'reports' && (
          <ReportsSection
            projects={projects}
            currentUser={currentUser}
            activeSector={activeSector}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentPage === 'project_detail' && currentSelectedProject && (
          <ProjectDetail
            project={currentSelectedProject}
            onBack={() => setCurrentPage('dashboard')}
            onUpdateStatus={handleUpdateProjectStatus}
            onAddImage={handleAddProjectImage}
            onSelectProject={handleSelectProject}
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

      {/* 4. Official PREVISION Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-5 px-4 sm:px-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/30">
              P
            </div>
            <div>
              <div className="font-semibold text-slate-200">
                PREVISION — Multi-Sector Infrastructure Project Monitoring & Early Warning Portal
              </div>
              <div className="text-[11px] text-slate-400">
                AI Surveillance • PRAEVISIO 4-Pillar Decision Framework (Predict, Explain, Warn, Recommend)
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
                resetDatabase();
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
