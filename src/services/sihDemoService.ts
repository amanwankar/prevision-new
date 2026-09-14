export interface DemoStep {
  id: number;
  key: string;
  badge: string;
  title: string;
  subtitle: string;
  targetPage: string; // 'projects' | 'details' | 'alerts' | 'actions' | 'reports' | 'executive_reports' | 'digital_twin'
  projectId?: string;
  alertId?: string;
  actionId?: string;
  
  whatToShow: string;
  whatToSay: string;
  
  // Suggested duration in auto-play mode (seconds)
  autoPlayDurationSec: number;
  requiresOfficerAction?: boolean;
}

export const SIH_DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    key: 'PORTFOLIO',
    badge: '01 PORTFOLIO',
    title: '1. National Portfolio Intelligence Center',
    subtitle: 'Cross-Project Situation Room & Priority Radar',
    targetPage: 'portfolio',
    whatToShow: 'The PRAEVISIO Portfolio Intelligence Center showing national health dimensions, project priority radar, and risk distribution across all monitored departments.',
    whatToSay: 'Traditional monitoring operates in silos. PRAEVISIO provides an executive national situation room to compare, prioritize, and identify cross-project risks instantly.',
    autoPlayDurationSec: 20,
  },
  {
    id: 2,
    key: 'EXECUTION',
    badge: '02 EXECUTION',
    title: '2. Project Execution Control Center',
    subtitle: 'National Highway 44 Expansion (NH-44-EXP)',
    targetPage: 'project_execution',
    projectId: 'PRJ-001',
    whatToShow: 'Execution Control Center showing live Plan vs Reality S-Curves, Execution Scorecard, Control Loop, and Milestone Control table for PRJ-001.',
    whatToSay: 'Officers can step into any project control room to analyze physical progress drift (-14%), delay projections (+145 days), and active execution signals.',
    autoPlayDurationSec: 22,
  },
  {
    id: 3,
    key: 'PREDICT',
    badge: '03 PREDICT',
    title: '3. Predictive Risk Assessment & XAI',
    subtitle: 'Explainable AI Attribution Model',
    targetPage: 'details',
    projectId: 'PRJ-001',
    whatToShow: 'High-risk project telemetry deep-dive: AI Risk Score 82/100 (HIGH), 145-day delay projection, and physical execution lag.',
    whatToSay: 'PRAEVISIO evaluates physical progress, milestone velocity, and environmental clearances to calculate an accurate risk score with transparent SHAP factor attribution.',
    autoPlayDurationSec: 22,
  },
  {
    id: 4,
    key: 'WARN',
    badge: '04 WARN',
    title: '4. Early Warning Alert Activation',
    subtitle: 'Automated Threshold Alerting Protocol',
    targetPage: 'alert_details',
    alertId: 'ew-01',
    projectId: 'PRJ-001',
    whatToShow: 'Active Early Warning Inspection: Critical severity alert triggered by 145-day delay threshold crossing on NH-44-EXP.',
    whatToSay: 'When an emerging risk crosses the application threshold, PRAEVISIO automatically generates a structured early warning and routes it to the designated officer.',
    autoPlayDurationSec: 20,
  },
  {
    id: 5,
    key: 'ACT',
    badge: '05 ACT',
    title: '5. Recommended Operational Response',
    subtitle: 'Inter-Ministerial & Fast-Track Mitigation Protocol',
    targetPage: 'action_details',
    actionId: 'act-01',
    projectId: 'PRJ-001',
    whatToShow: 'Recommended Action: Fast-track land acquisition clearance with 94% AI confidence rating and assigned officer designation.',
    whatToSay: 'PRAEVISIO formulates concrete, prescriptive responses—such as inter-ministerial expediting—giving officers an immediate path to resolution.',
    autoPlayDurationSec: 20,
    requiresOfficerAction: true,
  },
  {
    id: 6,
    key: 'TRACK',
    badge: '06 TRACK',
    title: '6. Officer Response & Audit Trail',
    subtitle: 'Immutable Action Tracking & Accountability',
    targetPage: 'action_details',
    actionId: 'act-01',
    projectId: 'PRJ-001',
    whatToShow: 'Officer state transformation (Acknowledge -> Start Action -> Complete) and immutable System Audit Log trail.',
    whatToSay: 'Every officer intervention, status update, and note is recorded in the system audit trail, ensuring complete accountability and transparency.',
    autoPlayDurationSec: 22,
    requiresOfficerAction: true,
  },
  {
    id: 7,
    key: 'DECIDE',
    badge: '07 DECIDE',
    title: '7. Executive Situation Room & Copilot',
    subtitle: 'Portfolio-Level Intelligence & Conversational AI',
    targetPage: 'executive_reports',
    whatToShow: 'Executive Situation Room displaying national risk matrix, spotlight priorities, macro trends, and interactive PRAEVISIO AI Copilot.',
    whatToSay: 'At the executive level, decision-makers move from individual project monitoring to portfolio-wide intelligence. One click allows leadership to review, direct, and resolve national infrastructure risks.',
    autoPlayDurationSec: 25,
  }
];

export const DEMO_PROJECT_ID = 'PRJ-001';
export const DEMO_ALERT_ID = 'ew-01';
export const DEMO_ACTION_ID = 'act-01';
