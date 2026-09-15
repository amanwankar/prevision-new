import type { Project, ProjectStatus, ProjectImage, ProjectAuditLog, StoredUser } from '../types';
import { initialProjects } from '../data/mockData';
import { INITIAL_USERS_TABLE } from '../data/userStore';
import { MAHARASHTRA_REAL_PROJECTS } from '../data/maharashtraProjects';

export interface DbImageRecord {
  id: string;
  project_id: string;
  url: string;
  caption: string;
  date: string;
  dateCaptured?: string;
  source?: string;
  stage?: string;
  uploadedBy?: string;
  lat?: number;
  lng?: number;
  isGeotagVerified?: boolean;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  notes?: string;
  created_at: string;
}

export interface DatabaseState {
  version: number;
  users: StoredUser[];
  projects: Project[];
  images: DbImageRecord[];
  lastUpdated: string;
}

const STORAGE_UNIFIED_KEY = 'praevisio_unified_database_v5';
const EVENT_NAME = 'praevisio_database_updated';

// Extract initial images table from initialProjects
function extractInitialImages(): DbImageRecord[] {
  const records: DbImageRecord[] = [];
  initialProjects.forEach((proj) => {
    if (Array.isArray(proj.images)) {
      proj.images.forEach((img) => {
        records.push({
          id: img.id,
          project_id: proj.id,
          url: img.url,
          caption: img.caption,
          date: img.date || 'Today, 2026',
          dateCaptured: img.dateCaptured || img.date,
          source: img.source || 'Field Verified',
          stage: img.stage,
          uploadedBy: img.uploadedBy || 'Field Monitoring Cell',
          lat: img.lat || proj.latitude,
          lng: img.lng || proj.longitude,
          isGeotagVerified: Boolean(img.isGeotagVerified),
          verificationStatus: img.verificationStatus || 'Verified',
          notes: img.notes,
          created_at: new Date().toISOString()
        });
      });
    }
  });
  return records;
}

// In-memory cache for ultra-fast queries
let cache: DatabaseState | null = null;
const listeners = new Set<() => void>();

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying database subscriber', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

function loadState(): DatabaseState {
  if (cache) return cache;

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_UNIFIED_KEY);
      if (stored) {
        const parsed: DatabaseState = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.projects)) {
          // Verify that all Maharashtra real projects are present
          let modified = false;
          MAHARASHTRA_REAL_PROJECTS.forEach(realProj => {
            const existingIdx = parsed.projects.findIndex(p => p.id === realProj.id);
            if (existingIdx === -1) {
              parsed.projects.unshift(realProj);
              modified = true;
            } else {
              // Update with any new road/predictive attributes
              parsed.projects[existingIdx] = {
                ...parsed.projects[existingIdx],
                ...realProj
              };
              modified = true;
            }
            // Also ensure images are synced
            if (Array.isArray(realProj.images)) {
              realProj.images.forEach(img => {
                if (!parsed.images.some(i => i.id === img.id)) {
                  parsed.images.push({
                    id: img.id,
                    project_id: realProj.id,
                    url: img.url,
                    caption: img.caption,
                    date: img.date || 'Today, 2026',
                    dateCaptured: img.dateCaptured || img.date,
                    source: img.source || 'Field Verified',
                    stage: img.stage,
                    uploadedBy: img.uploadedBy || 'Field Monitoring Cell',
                    lat: img.lat || realProj.latitude,
                    lng: img.lng || realProj.longitude,
                    isGeotagVerified: Boolean(img.isGeotagVerified),
                    verificationStatus: img.verificationStatus || 'Verified',
                    notes: img.notes,
                    created_at: new Date().toISOString()
                  });
                }
              });
            }
          });
          if (modified) {
            localStorage.setItem(STORAGE_UNIFIED_KEY, JSON.stringify(parsed));
          }
          cache = parsed;
          return cache;
        }
      }

      // Check legacy keys for seamless migration if unified key not set yet
      const legacyProjectsRaw = localStorage.getItem('sih26103_projects_v3');
      const legacyUsersRaw = localStorage.getItem('sih26103_users_table_v4');

      const migratedProjects: Project[] = legacyProjectsRaw ? JSON.parse(legacyProjectsRaw) : initialProjects;
      const migratedUsers: StoredUser[] = legacyUsersRaw ? JSON.parse(legacyUsersRaw) : INITIAL_USERS_TABLE;
      const initialImages = extractInitialImages();

      const initialSeed: DatabaseState = {
        version: 1,
        users: migratedUsers && migratedUsers.length > 0 ? migratedUsers : INITIAL_USERS_TABLE,
        projects: migratedProjects && migratedProjects.length > 0 ? migratedProjects : initialProjects,
        images: initialImages,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_UNIFIED_KEY, JSON.stringify(initialSeed));
      cache = initialSeed;
      return cache;
    }
  } catch (e) {
    console.error('Failed to load database from localStorage, initializing in-memory fallback', e);
  }

  const fallback: DatabaseState = {
    version: 1,
    users: INITIAL_USERS_TABLE,
    projects: initialProjects,
    images: extractInitialImages(),
    lastUpdated: new Date().toISOString()
  };
  cache = fallback;
  return fallback;
}

function saveState(nextState: DatabaseState): void {
  cache = nextState;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_UNIFIED_KEY, JSON.stringify(nextState));
      // Keep legacy keys in sync for backwards compatibility
      localStorage.setItem('sih26103_projects_v3', JSON.stringify(nextState.projects));
      localStorage.setItem('sih26103_users_table_v4', JSON.stringify(nextState.users));
    }
  } catch (e) {
    console.error('Failed to write database state to localStorage', e);
  }
  notifySubscribers();
}

// -------------------------------------------------------------
// USERS TABLE OPERATIONS
// -------------------------------------------------------------

export function getUsersTable(): StoredUser[] {
  return loadState().users;
}

export function getUserById(userId: string): StoredUser | null {
  const users = getUsersTable();
  const normalized = userId.trim().toLowerCase();
  return users.find((u) => u.user_id.toLowerCase() === normalized) || null;
}

export function authenticate(
  userIdInput: string,
  passwordInput: string,
  requiredRole?: 'officer' | 'admin'
): StoredUser | null {
  const users = getUsersTable();
  const normalizedId = userIdInput.trim().toLowerCase();
  const user = users.find((u) => u.user_id.toLowerCase() === normalizedId);

  if (!user) return null;
  if (user.password_hash !== passwordInput.trim()) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return user;
}

export function createStoredUser(newUser: {
  user_id: string;
  password_hash: string;
  name: string;
  sector: string;
  role?: 'officer' | 'admin';
}): { success: boolean; error?: string; user?: StoredUser } {
  const state = loadState();
  const normalizedId = newUser.user_id.trim().toLowerCase();

  if (!normalizedId) return { success: false, error: 'User ID cannot be empty.' };
  if (!newUser.password_hash.trim()) return { success: false, error: 'Password cannot be empty.' };
  if (!newUser.name.trim()) return { success: false, error: 'Full Name cannot be empty.' };
  if (!newUser.sector.trim()) return { success: false, error: 'Please select an assigned sector.' };

  const exists = state.users.some((u) => u.user_id.toLowerCase() === normalizedId);
  if (exists) {
    return { success: false, error: `User ID "${newUser.user_id}" already exists. Please choose a unique ID.` };
  }

  const record: StoredUser = {
    user_id: newUser.user_id.trim(),
    password_hash: newUser.password_hash.trim(),
    name: newUser.name.trim(),
    sector: newUser.sector.trim(),
    role: newUser.role || 'officer',
    created_at: new Date().toISOString().split('T')[0]
  };

  const updatedUsers = [record, ...state.users];
  saveState({
    ...state,
    users: updatedUsers,
    lastUpdated: new Date().toISOString()
  });

  return { success: true, user: record };
}

export function updateUserSector(userId: string, newSector: string): boolean {
  const state = loadState();
  let found = false;
  const updatedUsers = state.users.map((u) => {
    if (u.user_id === userId) {
      found = true;
      return { ...u, sector: newSector };
    }
    return u;
  });

  if (found) {
    saveState({
      ...state,
      users: updatedUsers,
      lastUpdated: new Date().toISOString()
    });
    return true;
  }
  return false;
}

export function deleteStoredUser(userId: string): boolean {
  const state = loadState();
  const updatedUsers = state.users.filter((u) => u.user_id !== userId);
  if (updatedUsers.length !== state.users.length) {
    saveState({
      ...state,
      users: updatedUsers,
      lastUpdated: new Date().toISOString()
    });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// PROJECTS TABLE OPERATIONS
// -------------------------------------------------------------

export function getProjectsTable(): Project[] {
  const state = loadState();
  // Join images from images table into project
  const imagesByProject = new Map<string, ProjectImage[]>();
  state.images.forEach((img) => {
    const list = imagesByProject.get(img.project_id) || [];
    list.push({
      id: img.id,
      url: img.url,
      caption: img.caption,
      date: img.date,
      dateCaptured: img.dateCaptured,
      source: img.source as any,
      stage: img.stage,
      uploadedBy: img.uploadedBy,
      lat: img.lat,
      lng: img.lng,
      isGeotagVerified: img.isGeotagVerified,
      verificationStatus: img.verificationStatus,
      notes: img.notes
    });
    imagesByProject.set(img.project_id, list);
  });

  return state.projects.map((p) => {
    const joinedImages = imagesByProject.get(p.id) || p.images || [];
    return {
      ...p,
      images: joinedImages
    };
  });
}

export function getProjectById(projectId: string): Project | null {
  const projects = getProjectsTable();
  return projects.find((p) => p.id === projectId) || null;
}

export function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus,
  note: string,
  authorName?: string,
  authorRole?: string
): boolean {
  const state = loadState();
  let found = false;

  const updatedProjects = state.projects.map((p) => {
    if (p.id !== projectId) return p;
    found = true;

    const previousRiskScore = p.riskScore || 50;
    const newRiskScore = newStatus === 'On Track' || newStatus === 'Completed'
      ? 20
      : newStatus === 'At Risk'
      ? 65
      : 88;

    const newAudit: ProjectAuditLog = {
      id: `aud-${Date.now()}`,
      date: 'Today, 2026',
      author: authorName || 'Sector Monitoring Officer',
      role: authorRole || 'Monitoring Officer',
      actionTaken: `Status adjusted to ${newStatus}`,
      note: note || 'Official monitoring cycle verification completed',
      previousRiskScore,
      newRiskScore
    };

    return {
      ...p,
      status: newStatus,
      riskScore: newRiskScore,
      lastUpdated: 'Today, 2026',
      auditTrail: [newAudit, ...(p.auditTrail || [])]
    };
  });

  if (found) {
    saveState({
      ...state,
      projects: updatedProjects,
      lastUpdated: new Date().toISOString()
    });
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// IMAGES TABLE OPERATIONS
// -------------------------------------------------------------

export function getImagesTable(projectId?: string): DbImageRecord[] {
  const state = loadState();
  if (projectId) {
    return state.images.filter((img) => img.project_id === projectId);
  }
  return state.images;
}

export function addImageToProject(projectId: string, newImage: ProjectImage): boolean {
  const state = loadState();
  const imageRecord: DbImageRecord = {
    id: newImage.id || `img-${Date.now()}`,
    project_id: projectId,
    url: newImage.url,
    caption: newImage.caption,
    date: newImage.date || 'Today, 2026',
    dateCaptured: newImage.dateCaptured || newImage.date,
    source: newImage.source || 'Field Verified',
    stage: newImage.stage || 'On-site Inspection',
    uploadedBy: newImage.uploadedBy || 'Monitoring Officer',
    lat: newImage.lat,
    lng: newImage.lng,
    isGeotagVerified: Boolean(newImage.isGeotagVerified),
    verificationStatus: newImage.verificationStatus || 'Verified',
    notes: newImage.notes,
    created_at: new Date().toISOString()
  };

  const updatedImages = [imageRecord, ...state.images];

  // Also reflect in project.images array
  const updatedProjects = state.projects.map((p) => {
    if (p.id !== projectId) return p;
    return {
      ...p,
      images: [newImage, ...(p.images || [])],
      lastUpdated: 'Today, 2026'
    };
  });

  saveState({
    ...state,
    images: updatedImages,
    projects: updatedProjects,
    lastUpdated: new Date().toISOString()
  });

  return true;
}

// -------------------------------------------------------------
// EVENT SUBSCRIPTION HOOK / LISTENER
// -------------------------------------------------------------

export function subscribeToDatabase(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// -------------------------------------------------------------
// RESET / RE-SEED
// -------------------------------------------------------------

export function resetDatabase(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_UNIFIED_KEY);
      localStorage.removeItem('sih26103_projects_v3');
      localStorage.removeItem('sih26103_users_table_v4');
    }
  } catch (e) {
    console.error(e);
  }
  cache = null;
  loadState();
  notifySubscribers();
}
