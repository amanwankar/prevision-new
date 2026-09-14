import type { Department, DepartmentDetail, Project, User } from '../types';
import { sampleDepartments } from '../data/mockData';
import { saveAuditLogLocally } from './dbService';

const STORAGE_KEY_DEPARTMENTS = 'praevisio_departments_v2';

export async function getDepartments(): Promise<Department[]> {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('Failed to fetch departments from localStorage', e);
  }
  return sampleDepartments;
}

export function saveDepartmentsLocally(depts: Department[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(depts));
  } catch (e) {
    console.error('Failed to save departments to localStorage', e);
  }
}

export async function getDepartmentDetails(projects: Project[], users: User[]): Promise<DepartmentDetail[]> {
  const depts = await getDepartments();

  return depts.map(d => {
    const deptProjects = projects.filter(p => p.department.includes(d.code) || p.department.includes(d.name) || p.sector === d.sector);
    const deptUsers = users.filter(u => u.department.includes(d.name) || u.department.includes(d.code));

    const totalProjects = deptProjects.length;
    const activeProjects = deptProjects.filter(p => p.status === 'On Track' || p.status === 'At Risk').length;
    const highRiskProjects = deptProjects.filter(p => p.riskScore >= 75).length;
    const avgScore = totalProjects > 0 ? Math.round(deptProjects.reduce((a, b) => a + b.riskScore, 0) / totalProjects) : 0;

    return {
      ...d,
      description: d.description || `Responsible for ${d.sector} infrastructure execution and monitoring.`,
      status: d.status || 'Active',
      totalProjects,
      activeProjects,
      highRiskProjects,
      averageRiskScore: avgScore,
      userCount: deptUsers.length
    };
  });
}

export async function createDepartment(
  deptData: Partial<Department>, 
  performedBy: string = 'System Administrator'
): Promise<Department> {
  const existing = await getDepartments();

  // Validate duplicate name
  const isDuplicate = existing.some(d => d.name.toLowerCase() === (deptData.name || '').toLowerCase());
  if (isDuplicate) {
    throw new Error(`Department with name "${deptData.name}" already exists.`);
  }

  const newId = `dept-${Math.floor(10 + Math.random() * 90)}`;
  const newDept: Department = {
    id: newId,
    name: deptData.name || 'New Department',
    code: deptData.code || `DEPT-${newId.toUpperCase()}`,
    sector: deptData.sector || 'Highways',
    description: deptData.description || 'Infrastructure division.',
    status: deptData.status || 'Active'
  };

  const updated = [...existing, newDept];
  saveDepartmentsLocally(updated);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Department Created',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_DEPT',
    details: `Created new department ${newDept.name} (${newDept.code}).`
  });

  return newDept;
}

export async function updateDepartment(
  updatedDept: Department, 
  performedBy: string = 'System Administrator'
): Promise<Department> {
  const existing = await getDepartments();
  const updatedList = existing.map(d => d.id === updatedDept.id ? updatedDept : d);
  saveDepartmentsLocally(updatedList);

  saveAuditLogLocally({
    id: `log-${Date.now()}`,
    event: 'Department Updated',
    user: performedBy,
    timestamp: new Date().toLocaleString('en-IN'),
    relatedProjectId: 'ADMIN_DEPT',
    details: `Updated department metadata for ${updatedDept.name}.`
  });

  return updatedDept;
}
