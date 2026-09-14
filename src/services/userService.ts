import type { User } from '../types';
import { sampleUsers } from '../data/mockData';
import { saveAuditLogLocally } from './dbService';

const STORAGE_KEY_USERS = 'praevisio_users_v2';

export async function getUsers(): Promise<User[]> {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_USERS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to fetch users from localStorage', e);
  }
  return sampleUsers;
}

export function saveUsersLocally(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export async function createUser(userData: Partial<User>, performedBy: string = 'System Administrator'): Promise<User> {
  const existingUsers = await getUsers();

  const newId = `usr-${Math.floor(100 + Math.random() * 900)}`;
  const newUser: User = {
    id: newId,
    name: userData.name || 'New Officer',
    email: userData.email || `officer-${newId}@example.com`,
    role: userData.role || 'sector_lead',
    department: userData.department || 'Ministry of Road Transport & Highways',
    designation: userData.designation || 'Project Officer',
    avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    assignedSectors: userData.assignedSectors || ['Highways'],
    status: userData.status || 'Active',
    phone: userData.phone || '+91 98765 00000',
    createdDate: new Date().toISOString().substring(0, 10),
    lastLogin: 'Never',
    authorizedProjects: userData.authorizedProjects || ['PRJ-001', 'PRJ-002'],
    authorizedDepartments: userData.authorizedDepartments || [userData.department || 'Ministry of Road Transport & Highways']
  };

  const updated = [newUser, ...existingUsers];
  saveUsersLocally(updated);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'User Created',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_USER',
    details: `Created new user account ${newUser.email} with role ${newUser.role}.`
  });

  return newUser;
}

export async function updateUser(updatedUser: User, performedBy: string = 'System Administrator'): Promise<User> {
  const existingUsers = await getUsers();
  const updatedList = existingUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
  saveUsersLocally(updatedList);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'User Updated',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_USER',
    details: `Updated user profile & RBAC permissions for ${updatedUser.name} (${updatedUser.id}).`
  });

  return updatedUser;
}

export async function deactivateUser(userId: string, performedBy: string = 'System Administrator'): Promise<User | null> {
  const existingUsers = await getUsers();
  const target = existingUsers.find(u => u.id === userId);
  if (!target) return null;

  const deactivated: User = {
    ...target,
    status: 'Inactive'
  };

  const updatedList = existingUsers.map(u => u.id === userId ? deactivated : u);
  saveUsersLocally(updatedList);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'User Deactivated',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_USER',
    details: `Deactivated user account ${target.name} (${target.email}). Access revoked.`
  });

  return deactivated;
}

export async function resetUserAccess(userId: string, performedBy: string = 'System Administrator'): Promise<User | null> {
  const existingUsers = await getUsers();
  const target = existingUsers.find(u => u.id === userId);
  if (!target) return null;

  const resetUser: User = {
    ...target,
    status: 'Active',
    lastLogin: 'Access Reset'
  };

  const updatedList = existingUsers.map(u => u.id === userId ? resetUser : u);
  saveUsersLocally(updatedList);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'User Access Reset',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_USER',
    details: `Reset security access token and activated state for ${target.name}.`
  });

  return resetUser;
}
