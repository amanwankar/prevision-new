import type { Project } from '../types';

export const MAHARASHTRA_DIVISIONS = [
  'Konkan Division',
  'Nashik Division',
  'Pune Division',
  'Aurangabad (Chhatrapati Sambhajinagar) Division',
  'Amravati Division',
  'Nagpur Division'
] as const;

export type MaharashtraDivision = typeof MAHARASHTRA_DIVISIONS[number];

// Comprehensive district and location mapping for Maharashtra's 6 official administrative divisions
const DIVISION_DISTRICT_KEYWORDS: Record<MaharashtraDivision, string[]> = {
  'Konkan Division': [
    'mumbai', 'mumbai city', 'mumbai suburban', 'thane', 'palghar', 'raigad', 
    'ratnagiri', 'sindhudurg', 'navi mumbai', 'vadhavan', 'nhava sheva', 'jnpa', 
    'dahanu', 'panvel', 'alibaug', 'uran', 'vasai', 'virar', 'kalyan', 'dombivli',
    'mira-bhayandar', 'mira bhayandar', 'ulhasnagar', 'konkan', 'dighi'
  ],
  'Nashik Division': [
    'nashik', 'ahmednagar', 'ahilyanagar', 'dhule', 'jalgaon', 'nandurbar',
    'malegaon', 'shirdi', 'manmad', 'bhusawal', 'khandesh', 'igatpuri', 'sinnar'
  ],
  'Pune Division': [
    'pune', 'satara', 'sangli', 'solapur', 'kolhapur', 'baramati', 'pcmc',
    'pimpri', 'chinchwad', 'karad', 'miraj', 'pandharpur', 'hinjawadi', 'talegaon'
  ],
  'Aurangabad (Chhatrapati Sambhajinagar) Division': [
    'aurangabad', 'chhatrapati sambhajinagar', 'sambhajinagar', 'jalna', 'beed',
    'parbhani', 'hingoli', 'nanded', 'latur', 'dharashiv', 'osmanabad', 'marathwada',
    'shendra', 'bidkin'
  ],
  'Amravati Division': [
    'amravati', 'akola', 'buldhana', 'washim', 'yavatmal', 'shegaon', 'khamgaon',
    'achlapur', 'pusad', 'western vidarbha'
  ],
  'Nagpur Division': [
    'nagpur', 'wardha', 'bhandara', 'gondia', 'chandrapur', 'gadchiroli',
    'ramtek', 'ballarpur', 'tadoba', 'vidarbha', 'eastern vidarbha', 'butibori',
    'central grid', 'mihan'
  ]
};

/**
 * Returns which Maharashtra division(s) a project belongs to based on its
 * district, locationName, and state fields.
 */
export function getProjectDivisions(project: Project): MaharashtraDivision[] {
  const textToScan = [
    project.district || '',
    project.locationName || '',
    project.name || '',
    project.location_name || '',
    project.state || ''
  ].join(' ').toLowerCase();

  // If statewide, it spans all divisions
  if (textToScan.includes('statewide') || textToScan.includes('across 30 rural') || textToScan.includes('entire maharashtra')) {
    return [...MAHARASHTRA_DIVISIONS];
  }

  const matchedDivisions: MaharashtraDivision[] = [];

  for (const division of MAHARASHTRA_DIVISIONS) {
    const keywords = DIVISION_DISTRICT_KEYWORDS[division];
    const hasMatch = keywords.some(keyword => {
      // Regex word boundary or direct substring
      return textToScan.includes(keyword);
    });

    if (hasMatch) {
      matchedDivisions.push(division);
    }
  }

  // Fallback: If no direct district matched but project is in Maharashtra,
  // distribute or inspect common defaults
  if (matchedDivisions.length === 0) {
    // Default to Konkan if port/coastal/airport, otherwise Nagpur/Pune depending on keywords
    if (textToScan.includes('port') || textToScan.includes('sea') || textToScan.includes('airport')) {
      return ['Konkan Division'];
    }
    return ['Konkan Division']; // General fallback for urban projects
  }

  return matchedDivisions;
}

/**
 * Check if a project matches the user's selected division(s).
 * If selectedDivisions is empty or contains 'All Divisions', returns true.
 */
export function isProjectInSelectedDivisions(
  project: Project,
  selectedDivisions: string[]
): boolean {
  if (!selectedDivisions || selectedDivisions.length === 0 || selectedDivisions.includes('All Divisions')) {
    return true;
  }

  const projectDivisions = getProjectDivisions(project);
  return projectDivisions.some(div => selectedDivisions.includes(div));
}

/**
 * Counts how many projects in the given list belong to a division.
 */
export function countProjectsInDivision(
  projects: Project[],
  division: MaharashtraDivision
): number {
  return projects.filter(p => getProjectDivisions(p).includes(division)).length;
}
