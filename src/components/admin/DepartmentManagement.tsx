import React, { useState, useEffect } from 'react';
import type { DepartmentDetail, Project, User, ProjectSector } from '../../types';
import { 
  getDepartmentDetails, 
  createDepartment 
} from '../../services/departmentService';
import { 
  Building2, 
  PlusCircle, 
  FolderKanban, 
  ArrowLeft, 
  X, 
  CheckCircle2
} from 'lucide-react';

interface DepartmentManagementProps {
  projects: Project[];
  users: User[];
  onSelectProject?: (projectId: string) => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  projects,
  users,
  onSelectProject
}) => {
  const [deptDetails, setDeptDetails] = useState<DepartmentDetail[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sector, setSector] = useState<ProjectSector>('Highways');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    const data = await getDepartmentDetails(projects, users);
    setDeptDetails(data);
  };

  useEffect(() => {
    loadData();
  }, [projects, users]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateDepartment = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Department name is required.');
      return;
    }

    try {
      await createDepartment({ name, code: code || name.substring(0, 4).toUpperCase(), sector, description });
      await loadData();
      setIsCreating(false);
      setName('');
      setCode('');
      setDescription('');
      showToast('Department created successfully.');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create department.');
    }
  };

  const selectedDept = deptDetails.find(d => d.id === selectedDeptId);
  const deptProjects = selectedDept 
    ? projects.filter(p => p.department.includes(selectedDept.code) || p.department.includes(selectedDept.name) || p.sector === selectedDept.sector)
    : [];

  return (
    <div className="space-y-6 font-sans pb-20 min-w-0">
      
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[80] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-stagger-fade">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Modal: Create Department */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Create New Department</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Port Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MoPD"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as ProjectSector)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="Highways">Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Power & Energy">Power & Energy</option>
                    <option value="Urban Transit">Urban Transit</option>
                    <option value="Ports & Waterways">Ports & Waterways</option>
                    <option value="Water Supply & Sanitation">Water Supply & Sanitation</option>
                    <option value="Smart Cities">Smart Cities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  placeholder="Responsibilities and mandate description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDepartment}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-amber-400" />
            <span>Department Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage infrastructure departments, assigned projects, and officer allocations.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsCreating(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Department</span>
        </button>
      </div>

      {selectedDept ? (
        /* DEPARTMENT DETAIL VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDeptId(null)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Departments</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">{selectedDept.code}</span>
                <h3 className="text-xl font-black text-white">{selectedDept.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDept.description}</p>
              </div>

              <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-bold self-start sm:self-auto">
                Sector: {selectedDept.sector}
              </span>
            </div>

            {/* Department Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total Projects</div>
                <div className="text-lg font-black text-white mt-1">{selectedDept.totalProjects}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Active Projects</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{selectedDept.activeProjects}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">High-Risk Projects</div>
                <div className="text-lg font-black text-red-400 mt-1">{selectedDept.highRiskProjects}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Average Risk Score</div>
                <div className="text-lg font-black text-amber-400 mt-1">{selectedDept.averageRiskScore} / 100</div>
              </div>
            </div>
          </div>

          {/* Department Projects Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <FolderKanban className="w-4 h-4 text-teal-400" />
              <span>Assigned Projects ({deptProjects.length})</span>
            </h4>

            {deptProjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg">
                No projects assigned to this department yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Project Name</th>
                      <th className="p-2.5">Progress</th>
                      <th className="p-2.5 text-center">Risk Score</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {deptProjects.map(p => (
                      <tr 
                        key={p.id} 
                        onClick={() => onSelectProject && onSelectProject(p.id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="p-2.5 font-mono font-bold text-teal-400">{p.code}</td>
                        <td className="p-2.5 font-bold text-white">{p.name}</td>
                        <td className="p-2.5 text-slate-300">{p.actualPhysicalProgress}% / {p.targetPhysicalProgress}%</td>
                        <td className="p-2.5 text-center font-bold text-amber-400 font-mono">{p.riskScore}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* DEPARTMENT CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deptDetails.map(dept => (
            <div 
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">{dept.code}</span>
                    <h3 className="text-base font-extrabold text-white">{dept.name}</h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {dept.sector}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/60">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Projects</div>
                    <div className="font-extrabold text-white mt-0.5">{dept.totalProjects}</div>
                  </div>

                  <div className="bg-slate-950 p-2 rounded border border-slate-800/60">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Officers</div>
                    <div className="font-extrabold text-teal-400 mt-0.5">{dept.userCount}</div>
                  </div>

                  <div className="bg-slate-950 p-2 rounded border border-slate-800/60">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">High Risk</div>
                    <div className="font-extrabold text-red-400 mt-0.5">{dept.highRiskProjects}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedDeptId(dept.id)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
