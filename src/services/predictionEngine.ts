import type { Project, RiskLevel, RiskFactorExplanation, PrescriptiveAction } from '../types';

export interface PredictionResult {
  riskScore: number;
  riskLevel: RiskLevel;
  delayDays: number;
  aiPredictedDate: string;
  costOverrunForecastCr: number;
  explanations: RiskFactorExplanation[];
  prescriptiveActions: Partial<PrescriptiveAction>[];
}

/**
 * PRAEVISIO AI Predictive & Explainability Engine
 * Core Concept: PREDICT -> EXPLAIN -> ACT
 */
export function calculateProjectPredictions(project: Partial<Project>): PredictionResult {
  const targetProg = project.targetPhysicalProgress ?? 50;
  const actualProg = project.actualPhysicalProgress ?? 50;
  const originalBudget = project.originalBudgetCr ?? 1000;
  const revisedBudget = project.revisedBudgetCr ?? originalBudget;
  const finDisbursement = project.financialDisbursementPercentage ?? 50;

  // 1. Progress Lag Impact (0 - 45 points)
  const progressGap = Math.max(0, targetProg - actualProg);
  const progressLagScore = Math.min(45, Math.round(progressGap * 2.1));

  // 2. Budget Inflation Impact (0 - 30 points)
  const budgetRatio = (revisedBudget - originalBudget) / originalBudget;
  const budgetScore = Math.min(30, Math.round(Math.max(0, budgetRatio) * 40));

  // 3. Financial vs Physical Asymmetry (0 - 15 points)
  const finVsPhysGap = Math.max(0, finDisbursement - actualProg);
  const finScore = Math.min(15, Math.round(finVsPhysGap * 0.75));

  // 4. Base Risk Weighting from Sector / External Risk Factor count
  const externalFactorsCount = project.riskFactors?.length ?? 2;
  const externalScore = Math.min(10, externalFactorsCount * 2.5);

  // Total Calculated Score (0-100)
  const rawRiskScore = Math.min(100, Math.max(0, Math.round(progressLagScore + budgetScore + finScore + externalScore)));

  // Risk Level Classification
  let riskLevel: RiskLevel = 'Low';
  if (rawRiskScore >= 75) riskLevel = 'Critical';
  else if (rawRiskScore >= 60) riskLevel = 'High';
  else if (rawRiskScore >= 35) riskLevel = 'Medium';

  // Delay Calculation (Days)
  const estimatedDelayDays = Math.round((progressGap * 14.5) + (Math.max(0, budgetRatio) * 120));

  // Predicted Target Completion Date
  const baseTarget = project.originalTargetDate ? new Date(project.originalTargetDate) : new Date();
  const predictedDateObj = new Date(baseTarget.getTime() + estimatedDelayDays * 24 * 60 * 60 * 1000);
  const aiPredictedDate = predictedDateObj.toISOString().split('T')[0];

  // Cost Overrun Forecast (₹ Cr)
  const costOverrunForecastCr = Math.round((revisedBudget - originalBudget) + (revisedBudget * (progressGap * 0.006)));

  // Explainable AI (XAI) SHAP Feature Importance Breakdown
  const explanations: RiskFactorExplanation[] = [];

  if (progressGap > 0) {
    explanations.push({
      id: 'xai-1',
      factor: `Physical Progress Lag behind Baseline (-${progressGap.toFixed(1)}%)`,
      impactScore: Math.round(progressLagScore),
      direction: 'increase',
      category: 'Right of Way',
      detail: `Current actual physical progress (${actualProg}%) trails planned baseline target (${targetProg}%) by ${progressGap.toFixed(1)}%.`
    });
  }

  if (budgetRatio > 0) {
    explanations.push({
      id: 'xai-2',
      factor: `Sanctioned Budget Revision Surge (+${(budgetRatio * 100).toFixed(1)}%)`,
      impactScore: Math.round(budgetScore),
      direction: 'increase',
      category: 'Contractor Liquidity',
      detail: `Budget escalation from ₹${originalBudget} Cr to ₹${revisedBudget} Cr increases financial vulnerability.`
    });
  }

  if (finVsPhysGap > 5) {
    explanations.push({
      id: 'xai-3',
      factor: `Financial Disbursement Asymmetry (+${finVsPhysGap.toFixed(1)}%)`,
      impactScore: Math.round(finScore),
      direction: 'increase',
      category: 'Supply Chain',
      detail: `Financial disbursement (${finDisbursement}%) outpaces physical progress (${actualProg}%) indicating low milestone efficiency.`
    });
  }

  if (project.riskFactors && project.riskFactors.length > 0) {
    explanations.push(...project.riskFactors);
  } else {
    explanations.push({
      id: 'xai-4',
      factor: 'On-site Heavy Machinery & EPC Deployment',
      impactScore: 12,
      direction: 'decrease',
      category: 'Supply Chain',
      detail: 'EPC main contractor active mobilization buffers against further unexpected delays.'
    });
  }

  const prescriptiveActions: Partial<PrescriptiveAction>[] = [];

  if (rawRiskScore >= 70) {
    prescriptiveActions.push({
      title: 'Convene High-Level Inter-Ministerial Taskforce',
      category: 'Inter-Ministerial',
      rationale: 'Project is in Critical Risk zone. Direct intervention of Secretary IPMD is required to resolve multi-agency clearances.',
      priority: 'Urgent',
      expectedImpact: 'Resolves regulatory bottlenecks and recovers up to 90 delay days.'
    });
  }

  if (progressGap > 10) {
    prescriptiveActions.push({
      title: 'Fast-Track Land Compensation Disbursement Window',
      category: 'Land Expedite',
      rationale: `Progress lag of ${progressGap}% is primarily driven by right-of-way package holds. Immediate funds release to District Collector recommended.`,
      priority: 'High',
      expectedImpact: 'Unlocks continuous track/highway alignment for heavy machinery deployment.'
    });
  }

  if (finVsPhysGap > 10) {
    prescriptiveActions.push({
      title: 'Audit EPC Contractor Milestone Verification',
      category: 'Contractor Dispute',
      rationale: 'Financial disbursement exceeds physical progress. Require third-party physical inspection before approving next tranche.',
      priority: 'Normal',
      expectedImpact: 'Protects government treasury against premature capital depletion.'
    });
  }

  return {
    riskScore: rawRiskScore,
    riskLevel,
    delayDays: estimatedDelayDays,
    aiPredictedDate,
    costOverrunForecastCr,
    explanations,
    prescriptiveActions
  };
}
