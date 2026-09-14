import type { Project, Milestone } from '../types';

export type SignalSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface DataQualityIssue {
  id: string;
  field: string;
  severity: SignalSeverity;
  problem: string;
  whyItMatters: string;
  suggestedAction: string;
  category: 'Completeness' | 'Consistency' | 'Validity' | 'Timeliness';
}

export interface DataQualityDimensions {
  completeness: number; // 0-100%
  consistency: number;  // 0-100%
  validity: number;     // 0-100%
  timeliness: number;   // 0-100%
}

export interface DataQualityResult {
  overallScore: number; // 0-100
  status: 'DATA READY' | 'NEEDS REVIEW' | 'INCOMPLETE' | 'VALIDATION ERROR';
  dimensions: DataQualityDimensions;
  explanation: string;
  issues: DataQualityIssue[];
}

export type RiskReadinessState = 'READY' | 'READY WITH WARNINGS' | 'LIMITED' | 'BLOCKED';

export interface RiskReadiness {
  state: RiskReadinessState;
  explanation: string;
  missingParameters: string[];
  canRunRiskAnalysis: boolean;
}

/**
 * Validates project data against strict logical infrastructure rules.
 */
export function validateProjectData(project: Partial<Project>): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  // --- 1. COMPLETENESS RULES ---
  if (!project.name || project.name.trim().length === 0) {
    issues.push({
      id: 'iss-name',
      field: 'Project Name',
      severity: 'CRITICAL',
      problem: 'Project Name is missing or empty.',
      whyItMatters: 'Project identifier is mandatory for system tracking and reporting.',
      suggestedAction: 'Enter a valid official project title.',
      category: 'Completeness',
    });
  }

  if (!project.code || project.code.trim().length === 0) {
    issues.push({
      id: 'iss-code',
      field: 'Project Code / ID',
      severity: 'CRITICAL',
      problem: 'Project Code (ID) is missing.',
      whyItMatters: 'Unique project code is required for database alignment and audit trail.',
      suggestedAction: 'Assign a valid project code (e.g. PRJ-104).',
      category: 'Completeness',
    });
  }

  if (!project.department || project.department.trim().length === 0) {
    issues.push({
      id: 'iss-dept',
      field: 'Department',
      severity: 'WARNING',
      problem: 'Nodal department is unspecified.',
      whyItMatters: 'Department-level RBAC and sectoral filtering rely on department tags.',
      suggestedAction: 'Select an authorized monitoring department.',
      category: 'Completeness',
    });
  }

  if (project.originalBudgetCr === undefined || project.originalBudgetCr <= 0) {
    issues.push({
      id: 'iss-budget-orig',
      field: 'Approved Budget',
      severity: 'CRITICAL',
      problem: 'Original approved budget is missing or zero.',
      whyItMatters: 'Cost overrun calculations and financial risk models cannot execute without baseline budget.',
      suggestedAction: 'Input the sanctioned budget in ₹ Crores.',
      category: 'Completeness',
    });
  }

  if (project.expenditureToDateCr === undefined && project.financialDisbursementPercentage === undefined) {
    issues.push({
      id: 'iss-expenditure-missing',
      field: 'Financial Expenditure',
      severity: 'WARNING',
      problem: 'Expenditure to date is unrecorded.',
      whyItMatters: 'Financial risk sub-index will operate on estimated defaults.',
      suggestedAction: 'Record total expenditure to date in ₹ Crores.',
      category: 'Completeness',
    });
  }

  // --- 2. VALIDITY RULES ---
  if (project.originalBudgetCr !== undefined && project.originalBudgetCr < 0) {
    issues.push({
      id: 'iss-budget-neg',
      field: 'Approved Budget',
      severity: 'CRITICAL',
      problem: 'Approved budget cannot be negative.',
      whyItMatters: 'Negative financial metrics produce invalid cost risk scores.',
      suggestedAction: 'Correct the budget figure to a positive value.',
      category: 'Validity',
    });
  }

  if (project.actualPhysicalProgress !== undefined) {
    if (project.actualPhysicalProgress < 0 || project.actualPhysicalProgress > 100) {
      issues.push({
        id: 'iss-prog-bounds',
        field: 'Actual Progress',
        severity: 'CRITICAL',
        problem: 'Physical progress must be between 0% and 100%.',
        whyItMatters: 'Progress gap metrics require valid percentages.',
        suggestedAction: 'Adjust progress percentage to be between 0 and 100.',
        category: 'Validity',
      });
    }
  }

  if (project.targetPhysicalProgress !== undefined) {
    if (project.targetPhysicalProgress < 0 || project.targetPhysicalProgress > 100) {
      issues.push({
        id: 'iss-target-bounds',
        field: 'Target Progress',
        severity: 'CRITICAL',
        problem: 'Planned target progress must be between 0% and 100%.',
        whyItMatters: 'Progress variance calculations will fail.',
        suggestedAction: 'Enter valid planned target progress percentage.',
        category: 'Validity',
      });
    }
  }

  // --- 3. CONSISTENCY RULES ---
  if (project.startDate && project.originalTargetDate) {
    const start = new Date(project.startDate).getTime();
    const target = new Date(project.originalTargetDate).getTime();
    if (!isNaN(start) && !isNaN(target) && target < start) {
      issues.push({
        id: 'iss-timeline-reverse',
        field: 'Timeline Dates',
        severity: 'CRITICAL',
        problem: 'Target completion date is earlier than project start date.',
        whyItMatters: 'Invalid duration metrics break schedule delay prediction models.',
        suggestedAction: 'Ensure completion target is after the project start date.',
        category: 'Consistency',
      });
    }
  }

  if (project.revisedTargetDate && project.originalTargetDate) {
    const orig = new Date(project.originalTargetDate).getTime();
    const rev = new Date(project.revisedTargetDate).getTime();
    if (!isNaN(orig) && !isNaN(rev) && rev > orig) {
      issues.push({
        id: 'iss-timeline-extended',
        field: 'Revised Target Date',
        severity: 'WARNING',
        problem: 'Current expected completion is later than original target date.',
        whyItMatters: 'Schedule risk analysis indicates potential milestone slippage.',
        suggestedAction: 'Review delay justifications and update milestone expectations.',
        category: 'Consistency',
      });
    }
  }

  if (project.expenditureToDateCr !== undefined && project.revisedBudgetCr !== undefined) {
    if (project.expenditureToDateCr > project.revisedBudgetCr * 1.5) {
      issues.push({
        id: 'iss-expenditure-overrun',
        field: 'Financial Expenditure',
        severity: 'WARNING',
        problem: 'Expenditure exceeds revised budget by more than 50%.',
        whyItMatters: 'Signals potential severe financial overrun or unrecorded budget revision.',
        suggestedAction: 'Verify expenditure logs or update revised budget amount.',
        category: 'Consistency',
      });
    }
  }

  if (project.milestones && project.milestones.length > 0) {
    project.milestones.forEach((m: Milestone, idx: number) => {
      if (m.plannedStartDate && m.plannedEndDate) {
        const pStart = new Date(m.plannedStartDate).getTime();
        const pEnd = new Date(m.plannedEndDate).getTime();
        if (!isNaN(pStart) && !isNaN(pEnd) && pEnd < pStart) {
          issues.push({
            id: `iss-ms-date-${idx}`,
            field: `Milestone: ${m.name || 'Unnamed'}`,
            severity: 'WARNING',
            problem: `Milestone end date precedes planned start date.`,
            whyItMatters: 'Milestone risk modeling relies on chronological sequence.',
            suggestedAction: 'Fix milestone start and end dates.',
            category: 'Consistency',
          });
        }
      }

      if (m.status === 'Completed' && (m.progressPercentage !== undefined && m.progressPercentage < 100)) {
        issues.push({
          id: `iss-ms-status-${idx}`,
          field: `Milestone: ${m.name || 'Unnamed'}`,
          severity: 'INFO',
          problem: `Milestone marked as 'Completed' but progress is ${m.progressPercentage}%.`,
          whyItMatters: 'Status and progress inconsistency may skew milestone risk index.',
          suggestedAction: 'Set milestone progress to 100% or adjust status to In Progress.',
          category: 'Consistency',
        });
      }
    });
  }

  // --- 4. TIMELINESS RULES ---
  if (project.auditTrail && project.auditTrail.length > 0) {
    const lastAudit = project.auditTrail[0]?.date;
    if (lastAudit) {
      const auditTime = new Date(lastAudit).getTime();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (!isNaN(auditTime) && auditTime < thirtyDaysAgo) {
        issues.push({
          id: 'iss-stale-data',
          field: 'Project Audit Trail',
          severity: 'INFO',
          problem: 'Project data has not been updated in over 30 days.',
          whyItMatters: 'Stale inputs reduce AI predictive risk confidence.',
          suggestedAction: 'Perform a routine monthly data review and save status.',
          category: 'Timeliness',
        });
      }
    }
  }

  return issues;
}

/**
 * Calculates deterministic Data Quality Score & Dimensions.
 */
export function calculateDataQuality(project: Partial<Project>): DataQualityResult {
  const issues = validateProjectData(project);

  const criticals = issues.filter((i) => i.severity === 'CRITICAL').length;
  const warnings = issues.filter((i) => i.severity === 'WARNING').length;

  // Calculate Sub-Index Scores (0-100)
  const completenessIssues = issues.filter((i) => i.category === 'Completeness');
  const consistencyIssues = issues.filter((i) => i.category === 'Consistency');
  const validityIssues = issues.filter((i) => i.category === 'Validity');
  const timelinessIssues = issues.filter((i) => i.category === 'Timeliness');

  const completeness = Math.max(20, Math.min(100, 100 - completenessIssues.length * 25));
  const consistency = Math.max(20, Math.min(100, 100 - consistencyIssues.length * 20));
  const validity = Math.max(20, Math.min(100, 100 - validityIssues.length * 30));
  const timeliness = Math.max(20, Math.min(100, 100 - timelinessIssues.length * 15));

  // Weighted overall score
  let rawScore = Math.round(completeness * 0.35 + consistency * 0.30 + validity * 0.25 + timeliness * 0.10);

  if (criticals > 0) {
    rawScore = Math.min(rawScore, 55 - criticals * 10);
  }

  const overallScore = Math.max(0, Math.min(100, rawScore));

  let status: DataQualityResult['status'] = 'DATA READY';
  if (criticals > 0) {
    status = 'VALIDATION ERROR';
  } else if (overallScore < 70) {
    status = 'INCOMPLETE';
  } else if (warnings > 0 || overallScore < 85) {
    status = 'NEEDS REVIEW';
  }

  // Explanation Synthesis
  let explanation = '';
  if (status === 'DATA READY') {
    explanation = 'Project data is complete, logically consistent, and fully verified for predictive risk analysis.';
  } else if (status === 'NEEDS REVIEW') {
    explanation = `Data quality is acceptable (${overallScore}/100), but ${warnings} warning signal(s) require review for optimal risk confidence.`;
  } else if (status === 'INCOMPLETE') {
    explanation = 'Key schedule or financial inputs are missing, which limits AI risk forecasting accuracy.';
  } else {
    explanation = `Validation errors detected (${criticals} critical issue(s)). Critical fields must be corrected before risk analysis.`;
  }

  return {
    overallScore,
    status,
    dimensions: {
      completeness,
      consistency,
      validity,
      timeliness,
    },
    explanation,
    issues,
  };
}

/**
 * Evaluates Risk Analysis Readiness State
 */
export function getRiskAnalysisReadiness(project: Partial<Project>): RiskReadiness {
  const quality = calculateDataQuality(project);
  const issues = quality.issues;
  const criticals = issues.filter((i) => i.severity === 'CRITICAL');
  const warnings = issues.filter((i) => i.severity === 'WARNING');

  const missingParameters: string[] = [];
  if (!project.name) missingParameters.push('Project Title');
  if (!project.code) missingParameters.push('Project Code');
  if (!project.originalBudgetCr) missingParameters.push('Sanctioned Budget');
  if (project.actualPhysicalProgress === undefined) missingParameters.push('Physical Progress');
  if (!project.startDate) missingParameters.push('Project Start Date');
  if (!project.originalTargetDate) missingParameters.push('Target Completion Date');

  if (criticals.length > 0 || missingParameters.length > 2) {
    return {
      state: 'BLOCKED',
      explanation: `Required project inputs are missing or invalid (${criticals.length} critical error(s)).`,
      missingParameters,
      canRunRiskAnalysis: false,
    };
  }

  if (missingParameters.length > 0 || quality.overallScore < 70) {
    return {
      state: 'LIMITED',
      explanation: 'Some non-critical inputs are unavailable. Risk analysis will execute using sector baseline defaults.',
      missingParameters,
      canRunRiskAnalysis: true,
    };
  }

  if (warnings.length > 0 || quality.overallScore < 88) {
    return {
      state: 'READY WITH WARNINGS',
      explanation: 'All required parameters exist, but timeline/financial warnings may impact confidence scores.',
      missingParameters,
      canRunRiskAnalysis: true,
    };
  }

  return {
    state: 'READY',
    explanation: 'All required project parameters are verified. Ready for full AI risk engine execution.',
    missingParameters: [],
    canRunRiskAnalysis: true,
  };
}
