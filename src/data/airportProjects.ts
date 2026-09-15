import type { Project } from '../types';

/**
 * PREVISION Civil Aviation / Airports Project Register
 * Sector Officer: Arun Mehra (arun_airports)
 * Context: Navi Mumbai International Airport, Mumbai Metro Line 8 Airport Connector, Regional Multimodal Access
 * Commissioning Checklist Framework: Airside/AGL, ATC/CNS, Terminal/BHS, DGCA/BCAS certification, Landside Access
 */
export const MAHARASHTRA_AIRPORT_PROJECTS: Project[] = [
  {
    id: 'PRJ-AIR-01',
    code: 'CIDCO-AIR-NMIA',
    name: 'Navi Mumbai International Airport (NMIA) Phase 1',
    sector: 'Civil Aviation / Airports',
    department: 'Ministry of Civil Aviation / CIDCO / NMIAL',
    state: 'Maharashtra',
    district: 'Raigad',
    locationName: 'Ulwe & Panvel, Navi Mumbai',
    location_name: 'Ulwe & Panvel, Navi Mumbai',
    latitude: 18.9894,
    longitude: 73.0722,
    lat: 18.9894,
    lng: 73.0722,
    nodalAgency: 'CIDCO & Navi Mumbai International Airport Ltd (NMIAL)',
    contractorName: 'L&T Construction (EPC) / Adani Airport Holdings',
    originalBudgetCr: 16700,
    revisedBudgetCr: 19646,
    costCr: 19646,
    expenditureToDateCr: 16850,
    startDate: '2021-08-01',
    originalTargetDate: '2024-12-31',
    revisedTargetDate: '2025-12-31',
    aiPredictedDate: '2026-03-31',
    targetPhysicalProgress: 94,
    actualPhysicalProgress: 88,
    physicalProgress: 88,
    progressGap: 6,
    financialDisbursementPercentage: 85.8,
    riskScore: 68,
    riskLevel: 'Medium',
    primaryRisk: 'Commissioning Readiness Checklist & Statutory Aviation Clearances',
    delayDays: 365,
    costOverrunForecastCr: 1200,
    status: 'At Risk',
    lastUpdated: '14 Sep 2026',
    stage: 'Construction',
    knownDetails: 'Major greenfield international airport designed for 20 million passengers in Phase 1. Features 3,700m Code 4F runway, Terminal 1, dedicated cargo terminal, 47 MW captive solar generation, and Sustainable Aviation Fuel (SAF) storage infrastructure.',
    likelyRiskCauses: 'Airside/terminal integration; Instrument Landing System (ILS Cat III) calibration by AAI; DGCA aerodrome licensing; BCAS security clearance for inline baggage screening; landside multimodal road connectivity.',
    earlyWarning: 'Orange until commissioning: Track DGCA/BCAS/AAI approvals, runway lighting, terminal baggage systems, fire rescue category 9, access highways, and operational trial runs.',
    recommendedAction: 'Convene weekly Airport Commissioning Command Center chaired by Secretary (Civil Aviation); conduct integrated trial operations (ORAT) with CISF, customs, and airline operators.',
    actionOwner: 'CEO, NMIAL (Adani Airports) & Joint Secretary, Ministry of Civil Aviation',
    actionDeadline: '15 Nov 2026',
    closureProofRequired: 'DGCA Public Aerodrome License & BCAS Final Security Vetting Certificate',
    spi: 0.92,
    cpi: 0.94,
    milestoneAtRisk: 'AAI Flight Inspection Unit (FIU) Calibration of DVOR & Cat-III Instrument Landing System',
    commissioningReadinessScore: 78,
    readinessChecklist: [
      { item: 'Runway 08L/26R Pavement & Airfield Ground Lighting (AGL)', status: 'Ready', agency: 'L&T Airside Team', details: 'Full 3,700m friction test complete; LED inset lights energized' },
      { item: 'ATC Tower Structural Cabling & VHF Radios', status: 'Ready', agency: 'Airports Authority of India (AAI)', details: 'Tower cab outfitted with automated surface radar display' },
      { item: 'Cat-III ILS Localizer & Glide Path Calibration', status: 'In Progress', agency: 'AAI Flight Inspection Unit', details: 'Calibration flight checks scheduled with Beechcraft King Air aircraft' },
      { item: 'Terminal 1 Automated Baggage Handling (BHS) & CTX Scanners', status: 'In Progress', agency: 'Siemens Logistics / BCAS', details: 'Level 4 inline baggage screening integration trials underway' },
      { item: 'DGCA Aerodrome Licensing & Fire Rescue Category 9 Drill', status: 'Delayed', agency: 'DGCA Aerodrome Standards Directorate', details: 'Final audit on crash tender response time (< 3 minutes) pending' },
      { item: 'Landside Multimodal Access (Ulwe Coastal Road & Amra Marg Flyover)', status: 'In Progress', agency: 'CIDCO / MMRDA', details: 'Interchange ramps physically complete; signages and toll canopy underway' },
      { item: 'Full-Scale Operational Readiness & Airport Transfer (ORAT) Trials', status: 'Delayed', agency: 'NMIAL / MIAL / Airlines', details: 'Simulated passenger terminal trials with 2,500 volunteers scheduled' }
    ],
    shapDrivers: [
      { feature: 'Runway civil construction & apron surfacing complete (100%)', impact: -24, direction: 'decrease', explanation: 'Code 4F runway ready for wide-body Airbus A350 and Boeing 777 aircraft' },
      { feature: 'DGCA statutory aerodrome licensing checklist (78% achieved)', impact: 28, direction: 'increase', explanation: 'Aviation safety certification cannot be bypassed regardless of physical civil progress' },
      { feature: 'Inline baggage handling integration with BCAS protocols', impact: 18, direction: 'increase', explanation: 'Multi-tiered automated security screening requires zero-defect compliance' }
    ],
    earlyWarningRules: [
      { id: 'AV-01', trigger: 'Statutory DGCA aerodrome licensing pending within 90 days of target COD', level: 'Orange', action: 'Daily escalation meetings between Concessionaire and DGCA Flight Safety Wing', status: 'Active' },
      { id: 'AV-02', trigger: 'Landside arterial road access incomplete at 90% airport completion', level: 'Red', action: 'Direct CIDCO/MMRDA to issue emergency work orders for access expressway ramps', status: 'Active' }
    ],
    milestones: [
      { id: 'm-nmia-1', name: 'Runway 08L/26R Concrete Paving & Shoulder Grading', status: 'Completed', progressPercentage: 100 },
      { id: 'm-nmia-2', name: 'Passenger Terminal 1 Roof Trusses & Façade Glazing', status: 'Completed', progressPercentage: 96 },
      { id: 'm-nmia-3', name: '47 MW Captive Solar PV Plant & High-Voltage Grid Substation', status: 'Completed', progressPercentage: 92 },
      { id: 'm-nmia-4', name: 'Baggage Handling System (BHS) Integrated Testing', status: 'In Progress', progressPercentage: 80 },
      { id: 'm-nmia-5', name: 'AAI ILS Flight Calibration & DGCA Aerodrome License', status: 'In Progress', progressPercentage: 65 }
    ],
    sCurveData: [
      { month: 'Apr 26', target: 82, actual: 78, predicted: 78 },
      { month: 'Jun 26', target: 88, actual: 83, predicted: 83 },
      { month: 'Aug 26', target: 94, actual: 88, predicted: 88 },
      { month: 'Oct 26', target: 98, actual: 88, predicted: 92 }
    ],
    crossSectorDependencies: [
      {
        linkedProjectId: 'PRJ-METRO-03',
        linkedProjectName: 'Mumbai Metro Line 8 — Gold Line (CSMIA–NMIA)',
        linkedSector: 'Urban Transport (Metro)',
        dependencyType: 'Airport Metro Connector',
        status: 'At Risk',
        criticality: 'High',
        summary: 'Underground airport express terminal station beneath Terminal 1 forecourt.'
      },
      {
        linkedProjectName: 'MTHL (Atal Setu) to NMIA Airport Link Road',
        linkedSector: 'Roads & Highways',
        dependencyType: 'Road Evacuation',
        status: 'On Track',
        criticality: 'High',
        summary: 'Elevated highway connector transferring South Mumbai traffic in 20 minutes.'
      }
    ]
  },
  {
    id: 'PRJ-AIR-02',
    code: 'MMRDA-AIR-METRO8',
    name: 'Mumbai Metro Line 8 Airport Connector (CSMIA to NMIA)',
    sector: 'Civil Aviation / Airports',
    department: 'Ministry of Civil Aviation / MMRDA / CIDCO',
    state: 'Maharashtra',
    district: 'Mumbai Suburban & Raigad',
    locationName: 'Inter-Airport Express Corridor (35 km)',
    location_name: 'Inter-Airport Express Corridor (35 km)',
    latitude: 19.0400,
    longitude: 72.9600,
    lat: 19.0400,
    lng: 72.9600,
    nodalAgency: 'MMRDA in coordination with MIAL & NMIAL',
    contractorName: 'Detailed Design & Multilateral Funding Tie-Up',
    originalBudgetCr: 22862,
    revisedBudgetCr: 22862,
    costCr: 22862,
    expenditureToDateCr: 180,
    startDate: '2026-01-15',
    originalTargetDate: '2031-12-31',
    revisedTargetDate: '2031-12-31',
    aiPredictedDate: '2032-06-30',
    targetPhysicalProgress: 5,
    actualPhysicalProgress: 0,
    physicalProgress: 0,
    progressGap: 5,
    financialDisbursementPercentage: 0.8,
    riskScore: 78,
    riskLevel: 'High',
    primaryRisk: 'Inter-Airport Check-in Integration & Creek Crossing Alignment',
    delayDays: 0,
    costOverrunForecastCr: 1500,
    status: 'At Risk',
    lastUpdated: '14 Sep 2026',
    stage: 'Approved / pre-construction',
    knownDetails: 'Dedicated 35-km rapid transit connector linking CSMIA Mumbai and NMIA Navi Mumbai with designed speed of 120 km/h. Will allow baggage drop and boarding pass issuance at CSMIA for flights departing from NMIA.',
    likelyRiskCauses: 'City-side check-in protocols; integration of baggage scanning systems across two distinct airport operators (MIAL and NMIAL); Thane Creek bridge/tunnel crossing permissions; JICA funding approval.',
    earlyWarning: 'Joint Airport-Metro Interface: Flag any delay in station integration design, baggage conveyor interfacing, or airport security perimeter access planning.',
    recommendedAction: 'Form Joint Inter-Airport Working Group comprising BCAS, MIAL, NMIAL, and MMRDA to freeze baggage transfer specifications.',
    actionOwner: 'Metropolitan Commissioner, MMRDA & Regional Director, BCAS Western Region',
    actionDeadline: '15 Dec 2026',
    closureProofRequired: 'BCAS-Approved Remote Baggage Handling Protocol & Inter-Airport Interface MoU',
    spi: 0.70,
    cpi: 1.0,
    milestoneAtRisk: 'Inter-Terminal Baggage Conveyor Alignment at CSMIA Terminal 2',
    commissioningReadinessScore: 25,
    readinessChecklist: [
      { item: 'Inter-Airport Remote Baggage Check-in Security Protocol', status: 'In Progress', agency: 'BCAS / CISF', details: 'Formulation of tamper-proof high-speed transit baggage container specs' },
      { item: 'CSMIA Terminal 2 Underground Station Interchange Box', status: 'Delayed', agency: 'MMRDA / MIAL', details: 'Coordination on passenger flow transfer between Line 7A, Line 3, and Line 8' },
      { item: 'NMIA Terminal 1 Forecourt Station Integration', status: 'In Progress', agency: 'CIDCO / NMIAL', details: 'Structural integration with terminal arrival level road viaduct' }
    ],
    shapDrivers: [
      { feature: 'State Cabinet formal project sanction (₹22,862 Cr)', impact: -18, direction: 'decrease', explanation: 'Statutory mandate officially granted in January 2026' },
      { feature: 'Dual airport concessionaire alignment complexity', impact: 26, direction: 'increase', explanation: 'Aligning operational requirements of two private airport management companies' }
    ],
    earlyWarningRules: [
      { id: 'AV-03', trigger: 'Remote baggage check-in protocol approval slips > 90 days', level: 'Orange', action: 'Direct BCAS technical wing to formulate interim security clearance', status: 'Active' }
    ],
    milestones: [
      { id: 'm-am8-1', name: 'State Cabinet Approval & Funding Authorization', status: 'Completed', progressPercentage: 100 },
      { id: 'm-am8-2', name: 'Comprehensive DPR & Station Footprint Siting', status: 'In Progress', progressPercentage: 70 },
      { id: 'm-am8-3', name: 'Thane Creek Marine Geotechnical Drilling', status: 'In Progress', progressPercentage: 45 },
      { id: 'm-am8-4', name: 'Dual-Airport Baggage Protocol Sanction', status: 'Pending', progressPercentage: 20 },
      { id: 'm-am8-5', name: 'High-Speed Rolling Stock & Traction Tenders', status: 'Pending', progressPercentage: 0 }
    ],
    sCurveData: [
      { month: 'Apr 26', target: 2, actual: 0, predicted: 0 },
      { month: 'Jun 26', target: 3, actual: 0, predicted: 0 },
      { month: 'Aug 26', target: 5, actual: 0, predicted: 0 },
      { month: 'Oct 26', target: 8, actual: 0, predicted: 2 }
    ]
  },
  {
    id: 'PRJ-AIR-03',
    code: 'CIDCO-AIR-ACCESS',
    name: 'Airport-Region Access & Multimodal Integration Projects',
    sector: 'Civil Aviation / Airports',
    department: 'CIDCO / MMRDA / MSRDC',
    state: 'Maharashtra',
    district: 'Raigad & Thane',
    locationName: 'Ulwe Coastal Road, Amra Marg Elevated Corridor & NH-348 Links',
    location_name: 'Ulwe Coastal Road, Amra Marg Elevated Corridor & NH-348 Links',
    latitude: 18.9750,
    longitude: 73.0450,
    lat: 18.9750,
    lng: 73.0450,
    nodalAgency: 'CIDCO & Maharashtra State Road Development Corp (MSRDC)',
    contractorName: 'NCC / J. Kumar / Welspun Enterprises',
    originalBudgetCr: 3250,
    revisedBudgetCr: 3680,
    costCr: 3680,
    expenditureToDateCr: 2840,
    startDate: '2022-04-01',
    originalTargetDate: '2025-06-30',
    revisedTargetDate: '2025-12-31',
    aiPredictedDate: '2026-02-28',
    targetPhysicalProgress: 91,
    actualPhysicalProgress: 82,
    physicalProgress: 82,
    progressGap: 9,
    financialDisbursementPercentage: 77.2,
    riskScore: 61,
    riskLevel: 'Medium',
    primaryRisk: 'Airport Landside Access Operational Readiness & Traffic Dispersal',
    delayDays: 180,
    costOverrunForecastCr: 150,
    status: 'At Risk',
    lastUpdated: '14 Sep 2026',
    stage: 'Construction',
    knownDetails: 'Package of regional access infrastructure linking NMIA to Atal Setu (MTHL), Mumbai-Pune Expressway, and Panvel: 6-lane Ulwe Coastal Road (7.1 km), Amra Marg elevated highway flyover, and Targhar multimodal suburban transit hub.',
    likelyRiskCauses: 'Coastal mangrove clearances; coordinating traffic diversions around heavy container truck corridors of JNPA; curb management and automated toll plaza integration.',
    earlyWarning: 'Amber Alert: Track "Airport Operational Readiness" rather than only civil construction percentage; ensuring seamless passenger curb, parking, and public bus circulation.',
    recommendedAction: 'Deploy 24/7 dedicated resurfacing and signage gang on Amra Marg junction; conduct commercial taxi and bus flow simulations.',
    actionOwner: 'Chief Engineer (Transport Infrastructure), CIDCO',
    actionDeadline: '30 Oct 2026',
    closureProofRequired: 'Joint Traffic Police & Airport Operator Access Circulation Audit',
    spi: 0.90,
    cpi: 0.94,
    milestoneAtRisk: 'Amra Marg Highway Junction Overpass Deck Surfacing & Signalling',
    commissioningReadinessScore: 81,
    readinessChecklist: [
      { item: 'Ulwe Coastal Road 6-Lane Concrete Pavement', status: 'Ready', agency: 'CIDCO', details: 'Dual 3-lane expressway fully asphalted with LED street lights' },
      { item: 'Amra Marg Flyover Container Truck Bypass Interchange', status: 'In Progress', agency: 'MSRDC', details: 'Pier caps and pre-stressed girders launched; expansion joints pending' },
      { item: 'Targhar Railway Station Multimodal Pedestrian Connector', status: 'In Progress', agency: 'Central Railway / CIDCO', details: 'Suburban train interchange platform elevator and ticket counter works' },
      { item: 'Intelligent Traffic Management System (ITMS) & Fastag Parking', status: 'In Progress', agency: 'NMIAL Commercial Cell', details: 'Automated 5,000-vehicle multi-level parking guidance system testing' }
    ],
    shapDrivers: [
      { feature: 'Direct physical link to Atal Setu (MTHL) completed', impact: -22, direction: 'decrease', explanation: 'Atal Setu traffic ramps connected directly to airport northern perimeter' },
      { feature: 'JNPA container freight traffic congestion on NH-348', impact: 24, direction: 'increase', explanation: 'Port heavy trucks mixing with air passenger vehicles during evening peak hours' }
    ],
    earlyWarningRules: [
      { id: 'AV-04', trigger: 'Landside traffic circulation simulation indicates bottleneck > 15 mins delay', level: 'Orange', action: 'Implement dedicated express lane for airport bound passenger traffic', status: 'Active' }
    ],
    milestones: [
      { id: 'm-aac-1', name: 'Ulwe Coastal Road Main Carriageway Formation', status: 'Completed', progressPercentage: 100 },
      { id: 'm-aac-2', name: 'Mangrove Buffer Bridges along Creek Section', status: 'Completed', progressPercentage: 95 },
      { id: 'm-aac-3', name: 'Amra Marg Elevated Flyover Pier Superstructure', status: 'In Progress', progressPercentage: 80 },
      { id: 'm-aac-4', name: 'Targhar Suburban Rail Station Multi-Modal Skywalk', status: 'In Progress', progressPercentage: 68 },
      { id: 'm-aac-5', name: 'Automated Fastag Parking & Digital Traffic Direction Displays', status: 'In Progress', progressPercentage: 55 }
    ],
    sCurveData: [
      { month: 'Apr 26', target: 76, actual: 70, predicted: 70 },
      { month: 'Jun 26', target: 84, actual: 76, predicted: 76 },
      { month: 'Aug 26', target: 91, actual: 82, predicted: 82 },
      { month: 'Oct 26', target: 97, actual: 82, predicted: 88 }
    ]
  }
];
