import type { StoredUser, User, ProjectSector } from '../types';

export const STORAGE_USERS_TABLE_KEY = 'sih26103_users_table_v4';

// Initial pre-seeded users table compliant with the requested table schema:
// user_id, password_hash, name, sector, role, created_at
export const INITIAL_USERS_TABLE: StoredUser[] = [
  {
    user_id: 'rahul_railways',
    password_hash: 'rail123',
    name: 'Rahul Sharma',
    sector: 'Railways',
    role: 'officer',
    created_at: '2026-08-01'
  },
  {
    user_id: 'priya_roads',
    password_hash: 'road123',
    name: 'Priya Verma',
    sector: 'Roads & Highways',
    role: 'officer',
    created_at: '2026-08-05'
  },
  {
    user_id: 'vikram_metro',
    password_hash: 'metro123',
    name: 'Vikram Malhotra',
    sector: 'Urban Transport (Metro)',
    role: 'officer',
    created_at: '2026-08-10'
  },
  {
    user_id: 'ananya_water',
    password_hash: 'water123',
    name: 'Ananya Deshmukh',
    sector: 'Water Resources / Bulk Water Supply',
    role: 'officer',
    created_at: '2026-08-15'
  },
  {
    user_id: 'arun_airports',
    password_hash: 'air123',
    name: 'Arun Mehra',
    sector: 'Civil Aviation / Airports',
    role: 'officer',
    created_at: '2026-08-20'
  },
  {
    user_id: 'suresh_ports',
    password_hash: 'port123',
    name: 'Suresh Pillai',
    sector: 'Shipping & Ports',
    role: 'officer',
    created_at: '2026-08-25'
  },
  {
    user_id: 'kavita_power',
    password_hash: 'power123',
    name: 'Kavita Kulkarni',
    sector: 'Power & Renewable Energy',
    role: 'officer',
    created_at: '2026-09-01'
  },
  {
    user_id: 'admin',
    password_hash: 'admin123',
    name: 'Priyanka Sen',
    sector: 'All Sectors',
    role: 'admin',
    created_at: '2026-07-01'
  }
];

/**
 * Retrieves the users table from localStorage or seeds it with initial default records.
 */
export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_TABLE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load users table from localStorage', e);
  }
  // Initialize default table
  try {
    localStorage.setItem(STORAGE_USERS_TABLE_KEY, JSON.stringify(INITIAL_USERS_TABLE));
  } catch (e) {
    console.error('Failed to save default users table to localStorage', e);
  }
  return INITIAL_USERS_TABLE;
}

/**
 * Persists the users table to localStorage.
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_TABLE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist users table', e);
  }
}

/**
 * Checks credentials against the stored users table.
 * Returns the matching StoredUser with assigned sector or null if invalid.
 */
export function authenticateUser(
  userIdInput: string,
  passwordInput: string,
  requiredRole?: 'officer' | 'admin'
): StoredUser | null {
  const users = getStoredUsers();
  const normalizedId = userIdInput.trim().toLowerCase();

  const user = users.find(
    (u) => u.user_id.toLowerCase() === normalizedId
  );

  if (!user) return null;

  // Simple string comparison for demo password_hash
  if (user.password_hash !== passwordInput.trim()) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return user;
}

/**
 * Creates a new user record in the users table (Admin only).
 * Enforces unique user_id and exact fields: user_id, password_hash, name, sector, role, created_at.
 */
export function createStoredUser(newUser: {
  user_id: string;
  password_hash: string;
  name: string;
  sector: string;
  role?: 'officer' | 'admin';
}): { success: boolean; error?: string; user?: StoredUser } {
  const users = getStoredUsers();
  const normalizedId = newUser.user_id.trim().toLowerCase();

  if (!normalizedId) {
    return { success: false, error: 'User ID cannot be empty.' };
  }
  if (!newUser.name.trim()) {
    return { success: false, error: 'Full Name cannot be empty.' };
  }
  if (!newUser.password_hash.trim()) {
    return { success: false, error: 'Password cannot be empty.' };
  }
  if (!newUser.sector.trim()) {
    return { success: false, error: 'Please select an assigned sector.' };
  }

  // Check unique user_id
  const exists = users.some((u) => u.user_id.toLowerCase() === normalizedId);
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

  const updated = [record, ...users];
  saveStoredUsers(updated);

  return { success: true, user: record };
}

/**
 * Deletes a user by user_id.
 */
export function deleteStoredUser(userId: string): boolean {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.user_id !== userId);
  if (filtered.length !== users.length) {
    saveStoredUsers(filtered);
    return true;
  }
  return false;
}

/**
 * Updates a user's assigned sector.
 */
export function updateStoredUserSector(userId: string, newSector: string): boolean {
  const users = getStoredUsers();
  let found = false;
  const updated = users.map((u) => {
    if (u.user_id === userId) {
      found = true;
      return { ...u, sector: newSector };
    }
    return u;
  });

  if (found) {
    saveStoredUsers(updated);
    return true;
  }
  return false;
}

/**
 * Converts a StoredUser into the full User object required by UI components.
 */
export function storedUserToAppUser(stored: StoredUser): User {
  const isAdm = stored.role === 'admin';
  return {
    id: stored.user_id,
    user_id: stored.user_id,
    name: stored.name,
    email: `${stored.user_id.replace(/[^a-zA-Z0-9]/g, '.')}@gov.in`,
    password_hash: stored.password_hash,
    password: stored.password_hash,
    sector: stored.sector as ProjectSector,
    role: isAdm ? 'admin' : 'project_officer',
    department: isAdm ? 'Central System Administration' : `${stored.sector} Directorate`,
    designation: isAdm ? 'Central System Administrator' : `${stored.sector} Monitoring Officer`,
    avatarUrl: isAdm
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    assignedSectors: [stored.sector as ProjectSector],
    created_at: stored.created_at,
    createdDate: stored.created_at,
    status: 'Active',
    lastLogin: 'Active Now'
  };
}

/**
 * Robust sector matching helper that matches projects to assigned sectors.
 */
export function matchSector(projectSector: string, targetSector: string): boolean {
  if (!targetSector || targetSector === 'All' || targetSector === 'All Sectors') return true;

  const p = projectSector.toLowerCase().trim();
  const t = targetSector.toLowerCase().trim();

  if (p === t) return true;

  // Keyword-based normalization
  if (t === 'railways' && p.includes('railway')) return true;
  if (t === 'roads & highways' && (p.includes('road') || p.includes('highway'))) return true;
  if (t === 'urban transport (metro)' && (p.includes('metro') || p.includes('transit') || p.includes('urban transport'))) return true;
  if (t.includes('water') && p.includes('water')) return true;
  if (t.includes('aviation') || t.includes('airport')) {
    if (p.includes('aviation') || p.includes('airport')) return true;
  }
  if (t.includes('port') || t.includes('shipping')) {
    if (p.includes('port') || p.includes('shipping') || p.includes('waterway')) return true;
  }
  if (t.includes('power') || t.includes('energy')) {
    if (p.includes('power') || p.includes('energy') || p.includes('renewable')) return true;
  }
  if (t.includes('irrigation') && p.includes('irrigation')) return true;

  return p.includes(t) || t.includes(p);
}
