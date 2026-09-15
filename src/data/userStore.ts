import type { StoredUser, User, ProjectSector } from '../types';

export const STORAGE_USERS_TABLE_KEY = 'sih26103_users_table_v4';

import {
  getUsersTable,
  createStoredUser as dbCreateStoredUser,
  updateUserSector as dbUpdateUserSector,
  deleteStoredUser as dbDeleteStoredUser,
  authenticate as dbAuthenticate
} from '../services/unifiedDatabase';

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
    user_id: 'rajesh_head',
    password_hash: 'head@123',
    name: 'Rajesh Kumar',
    sector: 'All Sectors',
    role: 'admin',
    created_at: '2026-07-01'
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
 * Retrieves the users table from unified database
 */
export function getStoredUsers(): StoredUser[] {
  return getUsersTable();
}

/**
 * Persists the users table to localStorage (compatibility wrapper)
 */
export function saveStoredUsers(_users: StoredUser[]): void {
  // unifiedDatabase handles persistence automatically
}

/**
 * Checks credentials against the stored users table.
 */
export function authenticateUser(
  userIdInput: string,
  passwordInput: string,
  requiredRole?: 'officer' | 'admin'
): StoredUser | null {
  return dbAuthenticate(userIdInput, passwordInput, requiredRole);
}

/**
 * Creates a new user record in the users table (Admin only).
 */
export function createStoredUser(newUser: {
  user_id: string;
  password_hash: string;
  name: string;
  sector: string;
  role?: 'officer' | 'admin';
}): { success: boolean; error?: string; user?: StoredUser } {
  return dbCreateStoredUser(newUser);
}

/**
 * Deletes a user by user_id.
 */
export function deleteStoredUser(userId: string): boolean {
  return dbDeleteStoredUser(userId);
}

/**
 * Updates a user's assigned sector.
 */
export function updateStoredUserSector(userId: string, newSector: string): boolean {
  return dbUpdateUserSector(userId, newSector);
}

/**
 * Converts a StoredUser into the full User object required by UI components.
 */
export function storedUserToAppUser(stored: StoredUser): User {
  const isHead = stored.user_id === 'rajesh_head';
  const isAdm = stored.role === 'admin' || isHead;
  return {
    id: stored.user_id,
    user_id: stored.user_id,
    name: stored.name,
    email: `${stored.user_id.replace(/[^a-zA-Z0-9]/g, '.')}@gov.in`,
    password_hash: stored.password_hash,
    password: stored.password_hash,
    sector: stored.sector as ProjectSector,
    role: isAdm ? 'admin' : 'project_officer',
    department: isHead 
      ? 'National Infrastructure Monitoring Authority' 
      : isAdm 
      ? 'Central System Administration' 
      : `${stored.sector} Directorate`,
    designation: isHead 
      ? 'National Head' 
      : isAdm 
      ? 'Central System Administrator' 
      : `${stored.sector} Monitoring Officer`,
    avatarUrl: isAdm
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    assignedSectors: isHead 
      ? ['All Sectors' as any] 
      : [stored.sector as ProjectSector],
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
