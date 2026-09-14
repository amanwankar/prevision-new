import React from 'react';
import type { Project } from '../../types';

interface ProjectOverviewSectionProps {
  project: Project;
}

export const ProjectOverviewSection: React.FC<ProjectOverviewSectionProps> = ({ project }) => {
  return (
    <section className="mb-6 page-break-inside-avoid">
      <div className="flex items-center space-x-2 border-b border-slate-300 pb-2 mb-3">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
          2. Project Overview
        </h2>
      </div>

      <div className="border border-slate-300 rounded overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-2 font-bold text-slate-700 w-1/4 border-r border-slate-200">Project Name</td>
              <td className="p-2 font-extrabold text-slate-950 w-1/4 border-r border-slate-200">{project.name}</td>
              <td className="p-2 font-bold text-slate-700 w-1/4 border-r border-slate-200">Project Code / ID</td>
              <td className="p-2 font-mono font-bold text-slate-900 w-1/4">{project.code}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Department / Ministry</td>
              <td className="p-2 text-slate-900 border-r border-slate-200">{project.department}</td>
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Sector</td>
              <td className="p-2 text-slate-900">{project.sector}</td>
            </tr>

            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Location & State</td>
              <td className="p-2 text-slate-900 border-r border-slate-200">{project.locationName}, {project.state}</td>
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Nodal Agency / Manager</td>
              <td className="p-2 text-slate-900">{project.nodalAgency}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Start Date</td>
              <td className="p-2 font-mono text-slate-900 border-r border-slate-200">{project.startDate}</td>
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Expected Completion</td>
              <td className="p-2 font-mono text-slate-900">{project.revisedTargetDate || project.originalTargetDate}</td>
            </tr>

            <tr className="bg-slate-50">
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Approved Budget</td>
              <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">₹{project.originalBudgetCr} Cr</td>
              <td className="p-2 font-bold text-slate-700 border-r border-slate-200">Current Expenditure</td>
              <td className="p-2 font-mono font-bold text-slate-900">₹{project.expenditureToDateCr} Cr</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
