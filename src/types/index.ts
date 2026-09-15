export type UserRole = 
  | 'admin' 
  | 'project_officer'
  | 'sector_head'
  | 'ministry_officer'
  | 'finance_officer'
  | 'senior_director' 
  | 'sector_lead' 
  | 'field_inspector' 
  | 'viewer';

export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface StoredUser {
  user_id: string;
  password_hash: string;
  name: string;
  sector: string;
  role: 'officer' | 'admin';
  created_at: string;
}

export interface User {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  password_hash?: string;
  password?: string;
  sector?: ProjectSector | string;
  role: UserRole;
  department: string;
  designation: string;
  avatarUrl: string;
  assignedSectors: ProjectSector[];
  created_at?: string;
  status?: UserStatus;
  phone?: string;
  createdDate?: string;
  lastLogin?: string;
  authorizedProjects?: string[]; // Project IDs authorized for project-level RBAC
  authorizedDepartments?: string[]; // Department names authorized for department-level RBAC
}

export type PermissionKey =
  | 'view_dashboard'
  | 'view_projects'
  | 'view_all_sectors'
  | 'edit_projects'
  | 'submit_field_inspection'
  | 'upload_verification_photos'
  | 'approve_progress_signoff'
  | 'audit_financials'
  | 'manage_disbursements'
  | 'view_risk_analytics'
  | 'review_warnings'
  | 'manage_users'
  | 'assign_sectors'
  | 'view_audit_logs'
  | 'generate_reports'
  | 'manage_settings'
  | 'manage_departments';

export interface RoleDefinition {
  id: UserRole;
  title: string;
  roleCode?: string;
  description: string;
  permissions: PermissionKey[];
  userCount?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  sector: ProjectSector;
  description?: string;
  status?: 'Active' | 'Inactive';
}

export interface DepartmentDetail extends Department {
  totalProjects: number;
  activeProjects: number;
  highRiskProjects: number;
  averageRiskScore: number;
  userCount: number;
}

export interface SecuritySettings {
  lowRiskThreshold: number;
  mediumRiskThreshold: number;
  highRiskThreshold: number;
  earlyWarningNotifications: boolean;
  highRiskAlerts: boolean;
  actionDueReminders: boolean;
  reportNotifications: boolean;
  emailNotificationsEnabled: boolean;
  sessionTimeoutMinutes: number;
  passwordPolicy: 'Standard' | 'Strict' | 'Government Compliance';
  twoFactorAvailable: boolean;
}

export interface AuditLogFilter {
  user?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// -------------------------------------------------------------
// PAIMANA Architecture Document Database Entities (Section 5 & 6)
// -------------------------------------------------------------
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  department_id: string;
  designation: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface DbRolesAndPermissions {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
  permissions: string[];
}

export interface DbProjectAssignment {
  id: string;
  user_id: string;
  project_id: string;
  sector: string;
  assignment_type: 'primary_officer' | 'sector_head' | 'finance_auditor' | 'inspector';
  assigned_at: string;
}

export interface DbProject {
  id: string;
  project_code: string;
  name: string;
  sector: string;
  sub_sector?: string;
  nodal_agency: string;
  contractor_name: string;
  state: string;
  district?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  original_cost_cr: number;
  revised_cost_cr: number;
  expenditure_to_date_cr: number;
  sanctioned_budget_cr: number;
  start_date: string;
  original_completion_date: string;
  revised_completion_date: string;
  ai_forecast_completion_date: string;
  target_physical_progress: number;
  actual_physical_progress: number;
  financial_disbursement_pct: number;
  status: 'On Track' | 'Delayed' | 'At Risk' | 'Critical Overrun' | 'Completed';
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  primary_risk_factor?: string;
  delay_months: number;
  cost_overrun_cr: number;
  last_updated: string;
  last_inspected_by?: string;
}

export interface DbProjectImage {
  id: string;
  project_id: string;
  image_type: ProjectImageType;
  image_url: string;
  caption: string;
  captured_at: string;
  uploaded_by: string;
  uploader_role: string;
  latitude: number;
  longitude: number;
  is_geotag_verified: boolean;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  verified_by?: string;
  physical_progress_claim_pct?: number;
}

// -------------------------------------------------------------
// Official PAIMANA Sectors (MoSPI Central Sector Monitoring)
// -------------------------------------------------------------
export type ProjectSector = 
  | 'Roads & Highways'
  | 'Railways'
  | 'Urban Transport (Metro)'
  | 'Power & Renewable Energy'
  | 'Petroleum & Natural Gas'
  | 'Coal'
  | 'Shipping & Ports'
  | 'Civil Aviation / Airports'
  | 'Water Resources / Bulk Water Supply'
  | 'Irrigation'
  | 'Telecommunications'
  | 'Steel'
  | 'Mines & Minerals'
  | 'Atomic Energy'
  | 'Chemicals & Petrochemicals'
  | 'Heavy Industry & Manufacturing'
  // Common legacy & short aliases
  | 'Highways'
  | 'Power & Energy'
  | 'Water Supply'
  | 'Airports'
  | 'Urban Transit'
  | 'Ports & Waterways'
  | 'Water Supply & Sanitation'
  | 'Smart Cities'
  | 'Rural Development & Housing';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Critical Overrun' | 'Completed';

// Section 13: Image and Field Verification Strategy
export type ProjectImageType = 
  | 'Design/Plan image' 
  | 'Verified Field Photo' 
  | 'Geo-tagged drone' 
  | 'Satellite/KML verification' 
  | 'Milestone Proof';

export interface ProjectImage {
  id: string;
  url: string;
  caption: string;
  date: string;
  dateCaptured?: string;
  source?: 'Official Site' | 'Field Verified' | 'Satellite View' | 'Geo-tagged Drone' | 'Milestone Proof' | string;
  stage?: string;
  uploadedBy?: string;
  uploaderRole?: string;
  imageType?: ProjectImageType;
  lat?: number;
  lng?: number;
  isGeotagVerified?: boolean;
  distanceFromSiteMeters?: number;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  physicalProgressClaimPct?: number;
  notes?: string;
  exifMetadata?: {
    capturedTimestamp?: string;
    cameraModel?: string;
    altitudeMeters?: number;
    gpsAccuracyMeters?: number;
  } | string;
}

export interface RiskFactorExplanation {
  id: string;
  factor: string;
  impactScore: number;
  direction: 'increase' | 'decrease';
  category: 
    | 'Land Acquisition' 
    | 'Regulatory Clearances' 
    | 'Contractor Liquidity' 
    | 'Seasonality' 
    | 'Supply Chain' 
    | 'Right of Way' 
    | 'Procurement Hold' 
    | 'Environmental / Geotechnical' 
    | 'Cost Escalation' 
    | 'Technical';
  detail?: string;
}

export interface Milestone {
  id: string;
  name: string;
  title?: string;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  expectedDate?: string;
  actualDate?: string;
  actualEndDate?: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
  progressPercentage?: number;
  progress?: number;
  dependencyId?: string;
  risk?: RiskLevel;
}

export interface ProjectAuditLog {
  id: string;
  date: string;
  author: string;
  role: string;
  note: string;
  actionTaken: string;
  previousRiskScore: number;
  newRiskScore: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  sector: ProjectSector;
  department: string;
  state: string;
  district?: string;
  locationName: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  lat: number;
  lng: number;
  nodalAgency: string;
  contractorName: string;
  
  // Financials (in ₹ Crores)
  originalBudgetCr: number;
  revisedBudgetCr: number;
  expenditureToDateCr: number;
  costCr?: number; // Primary display cost in ₹ Crores
  
  // Schedule
  startDate: string;
  originalTargetDate: string;
  revisedTargetDate: string;
  aiPredictedDate: string;
  lastUpdated?: string; // e.g. "12 Sep 2026"
  
  // Progress
  targetPhysicalProgress: number; // %
  actualPhysicalProgress: number; // %
  physicalProgress?: number; // shortcut %
  financialDisbursementPercentage: number; // %
  
  // Status & Risk
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  primaryRisk: string; // e.g. "Schedule Delay", "Cost Overrun", "Land Acquisition"
  delayDays: number;
  costOverrunForecastCr: number;
  status: ProjectStatus;
  
  // PRAEVISIO Framework Fields (Maharashtra Multi-Sector Project Register)
  stage?: string; // e.g. "Construction", "Approved / pre-construction", "Tender stage", "Implementation"
  knownDetails?: string; // Recorded details from research register / PAIMANA
  likelyRiskCauses?: string; // Explain Cause (geology, utilities, land, port permissions, etc.)
  earlyWarning?: string; // Early Warning alert criteria
  recommendedAction?: string; // Dated recommended action with designated owner
  
  // Images, Milestones & Audit
  images?: ProjectImage[];
  riskFactors?: RiskFactorExplanation[];
  milestones: Milestone[];
  sCurveData?: { month: string; target: number; actual: number; predicted: number }[];
  auditTrail?: ProjectAuditLog[];

  // PREVISION Multi-Horizon ML Prediction & EVM Fields
  lengthKm?: number;
  commissionedLengthKm?: number;
  projectTypeCategory?: string;
  progressGap?: number; // Planned % - Actual %
  spi?: number; // Schedule Performance Index (EV / PV)
  schedulePerformanceIndex?: number;
  cpi?: number; // Cost Performance Index (EV / AC)
  scheduleVarianceCr?: number; // EV - PV in ₹ Cr
  costVarianceCr?: number; // EV - AC in ₹ Cr
  eacCr?: number; // Estimate at Completion in ₹ Cr
  costOverrunProb6m?: number; // %
  costOverrunProb12m?: number; // %
  delayProb3m?: number; // %
  delayProb6m?: number; // %
  delayProb12m?: number; // %
  forecastDelayDays3m?: number;
  forecastDelayDays6m?: number;
  forecastDelayDays12m?: number;
  milestoneAtRisk?: string;
  milestoneFailureProb?: number; // %
  criticalDependencyRisk?: string;
  shapDrivers?: {
    feature: string;
    impact: number; // e.g. +18 or -10 points
    explanation: string;
    direction: 'increase' | 'decrease';
  }[];
  earlyWarningRules?: {
    id: string;
    trigger: string;
    level: 'Amber' | 'Orange' | 'Red';
    action: string;
    status: 'Active' | 'Normal';
  }[];
  monthlyHistory?: {
    month: string;
    plannedProgress: number;
    actualProgress: number;
    progressGap: number;
    spi: number;
    cpi: number;
    landPendingPct?: number;
    criticalIssueAgeDays?: number;
    delayProb: number;
    alertLevel: 'Green' | 'Amber' | 'Orange' | 'Red';
  }[];
  actionOwner?: string;
  actionDeadline?: string;
  closureProofRequired?: string;

  // Road & Highway Specific Attributes
  roadClassification?: 'NH' | 'Expressway' | 'BOT' | 'HAM' | 'EPC' | 'PMGSY' | 'Bridge/Tunnel' | string;
  roadLengthKm?: number;
  lanes?: string | number;
  structuresCount?: string;
  structuresCompleted?: number;
  landPossessionPct?: number;
  forestClearanceStatus?: string;
  utilityClearanceStatus?: string;
  utilityShiftingPending?: number;
  modelConfidence?: string;
  isAwaitingMonthlyUpdate?: boolean;
  monthlyUpdateStatusText?: string;

  // Sector-Specific Metrics & Special Surveillance Attributes
  // Water Resources
  headworksProgressPct?: number;
  canalsProgressPct?: number;
  canalNetworkProgressPct?: number;
  commandAreaHectares?: number;
  subSchemesCount?: number | string;
  irrigationPotentialCreatedHa?: number;
  irrigationPotentialTargetHa?: number;

  // Airports / Commissioning Readiness
  runwayLengthMeters?: number;
  terminalCapacityMPPA?: number;
  dgcaLicensingStatus?: string;
  commissioningReadinessScore?: number;
  readinessChecklist?: {
    id?: string;
    item: string;
    category?: string;
    status: 'Ready' | 'In Progress' | 'Delayed' | 'Critical' | 'Completed' | 'Pending Inspection';
    agency?: string;
    responsibleAgency?: string;
    targetDate?: string;
    details?: string;
    notes?: string;
  }[];

  // Ports / Multimodal Programme Packages
  programmePackages?: {
    id?: string;
    packageId?: string;
    name?: string;
    packageName?: string;
    category?: string;
    contractType?: string;
    contractorOrConcessionaire?: string;
    contractor?: string;
    costCr?: number;
    status: 'Pre-construction' | 'Tendering' | 'Under Construction' | 'Operational' | 'Delayed' | 'Completed' | 'In Progress';
    progressPct?: number;
    progressPercentage?: number;
    completionTarget?: string;
  }[];

  // Power & Renewable Energy
  generationCapacityMW?: number;
  storageCapacityMWh?: number;
  evacuationReadinessStatus?: string;
  towersErectedCount?: number;
  towersTargetCount?: number;
  stringingKmCompleted?: number;
  stringingKmTarget?: number;

  // Urban Transport (Metro)
  undergroundRouteKm?: number;
  elevatedRouteKm?: number;
  depotLandStatus?: string;

  // Cross-Sector Dependencies (e.g. Ports -> Road/Rail evacuation, Airport -> Metro Line 8)
  crossSectorDependencies?: {
    id?: string;
    linkedProjectId?: string;
    linkedProjectName: string;
    linkedSector: ProjectSector | string;
    dependencyType: 'Rail Evacuation' | 'Road Evacuation' | 'Airport Metro Connector' | 'Power Evacuation' | 'Water Reservoir Access' | 'Last-Mile Canal' | 'Interchange' | 'Feedstock/Water' | 'Hinterland Connectivity' | 'Utility Relocation' | 'Drainage/Flood' | 'Environmental Buffer' | string;
    status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'Critical Bottleneck';
    criticality: 'High' | 'Medium' | 'Low';
    summary: string;
    responsibleDepartment?: string;
    targetResolutionDate?: string;
  }[];
}

export interface ProjectRisk {
  projectId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryDriver: string;
  contributingFactors: RiskFactorExplanation[];
  lastCalculatedAt: string;
}

export interface AlertNote {
  id: string;
  note: string;
  author: string;
  role?: string;
  timestamp: string;
}

export interface AlertTimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  user?: string;
}

export interface EarlyWarning {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  sector: ProjectSector;
  department: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  triggerCondition: string;
  timeAgo: string;
  timestamp: string;
  status: 'New' | 'Open' | 'Acknowledged' | 'In Review' | 'Escalated' | 'Resolved';
  assignedOfficer: string;
  recommendedAction: string;
  riskScore?: number;
  riskType?: 'Schedule Delay' | 'Cost Overrun' | 'Progress' | 'Milestone' | 'Other';
  location?: string;
  timeline?: AlertTimelineEvent[];
  notes?: AlertNote[];
}

export type Alert = EarlyWarning;

export interface ActionComment {
  id: string;
  comment: string;
  author: string;
  timestamp: string;
}

export interface ActionHistoryLog {
  id: string;
  changedBy: string;
  changedAt: string;
  previousStatus: string;
  newStatus: string;
}

export interface RecommendedAction {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  sector: ProjectSector;
  department: string;
  priority: 'Urgent' | 'High' | 'Normal';
  title: string;
  category: 'Inter-Ministerial' | 'Fast-track Funds' | 'Land Expedite' | 'Contractor Dispute' | 'Environmental Clearance';
  rationale: string;
  aiConfidenceScore: number;
  assignedTo: string;
  assignedRole: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Executed' | 'Cancelled';
  targetResolutionDate: string;
  expectedImpact: string;
  createdDate?: string;
  reason?: string;
  history?: ActionHistoryLog[];
  comments?: ActionComment[];
}

export type PrescriptiveAction = RecommendedAction;

export interface RiskHistory {
  month: string;
  avgRiskScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface SystemAuditLog {
  id: string;
  event: string;
  user: string;
  timestamp: string;
  relatedProjectId: string;
  relatedAlertId?: string;
  relatedActionId?: string;
  details: string;
}

export type ReportType = 
  | 'project_monitoring' 
  | 'risk_assessment' 
  | 'early_warning' 
  | 'executive_summary';

export interface ReportSectionConfig {
  includeOverview: boolean;
  includeProgress: boolean;
  includeCost: boolean;
  includeRiskAssessment: boolean;
  includeRiskExplanation: boolean;
  includeEarlyWarnings: boolean;
  includeRecommendedActions: boolean;
  includeRiskHistory: boolean;
  includeAuditSummary: boolean;
}

export interface ReportFilterOptions {
  reportType: ReportType;
  projectId?: string;
  department?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  riskLevel?: string;
  sections?: ReportSectionConfig;
}

export interface GeneratedReport {
  id: string;
  title: string;
  reportType: ReportType;
  project?: Project;
  allProjects?: Project[];
  generatedBy: string;
  generatedByRole?: string;
  generatedDate: string;
  dataPeriod: string;
  scope: string;
  status: 'Generating' | 'Generated' | 'Failed';
  sections: ReportSectionConfig;
  summaryText: string;
  executiveInsights?: string[];
  priorityProjects?: ExecutivePriorityItem[];
}

export interface ExecutivePriorityItem {
  priorityRank: number;
  project: Project;
  riskScore: number;
  primaryRisk: string;
  progressGap: number;
  activeWarningTitle: string;
  recommendedActionTitle: string;
  priorityScore: number; // Transparent calculated score
}

export interface ExecutiveInsight {
  id: string;
  text: string;
  category: 'Risk' | 'Schedule' | 'Warnings' | 'Progress' | 'Cost';
  impactLevel: 'High' | 'Medium' | 'Info';
}

export interface ReportHistoryItem {
  id: string;
  name: string;
  type: ReportType;
  projectId?: string;
  projectName?: string;
  generatedBy: string;
  generatedDate: string;
  status: 'Generating' | 'Generated' | 'Failed';
  fileSize?: string;
}


