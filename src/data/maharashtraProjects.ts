import type { Project } from '../types';
import { MAHARASHTRA_RAILWAY_PROJECTS } from './railwayProjects';
import { MAHARASHTRA_ROAD_PROJECTS } from './roadProjects';
import { MAHARASHTRA_METRO_PROJECTS } from './metroProjects';
import { MAHARASHTRA_WATER_PROJECTS } from './waterProjects';
import { MAHARASHTRA_AIRPORT_PROJECTS } from './airportProjects';
import { MAHARASHTRA_PORT_PROJECTS } from './portProjects';
import { MAHARASHTRA_POWER_PROJECTS } from './powerProjects';

/**
 * PREVISION Maharashtra Multi-Sector Project Register
 * Real projects identified from public, official, and government-linked sources
 * Source Basis: MMRDA status disclosures, Maha-Metro disclosures, PIB / Cabinet releases,
 * NHSRCL disclosures, Water Resources Dept (WRD), Energy Utilities.
 * 
 * PREVISION Framework:
 * Predict Risk → Explain Cause → Early Warning → Recommended Action
 */
export const MAHARASHTRA_REAL_PROJECTS: Project[] = [
  // Spread all Maharashtra railway works (31 unique projects)
  ...MAHARASHTRA_RAILWAY_PROJECTS,
  // Spread all ongoing Maharashtra national highways, BOT corridors, and PMGSY balance works (24 projects)
  ...MAHARASHTRA_ROAD_PROJECTS,
  // Spread all Maharashtra Urban Transport (Metro) projects (9 projects)
  ...MAHARASHTRA_METRO_PROJECTS,
  // Spread all Maharashtra Water Resources & Bulk Water Supply projects (6 major programmes & portfolios)
  ...MAHARASHTRA_WATER_PROJECTS,
  // Spread all Maharashtra Civil Aviation / Airport projects (3 projects)
  ...MAHARASHTRA_AIRPORT_PROJECTS,
  // Spread all Maharashtra Shipping & Ports projects (5 projects)
  ...MAHARASHTRA_PORT_PROJECTS,
  // Spread all Maharashtra Power & Renewable Energy projects (5 projects)
  ...MAHARASHTRA_POWER_PROJECTS,

  // -------------------------------------------------------------
  // 1. RAILWAYS (High-Speed Rail)
  // -------------------------------------------------------------
  {
    id: 'PRJ-MAH-HSR-01',
    code: 'MAH-RAIL-01',
    name: 'Mumbai–Ahmedabad High-Speed Rail (Maharashtra Section)',
    sector: 'Railways',
    department: 'Ministry of Railways / NHSRCL',
    state: 'Maharashtra',
    district: 'Mumbai Suburban, Thane & Palghar',
    locationName: 'Mumbai BKC–Thane–Palghar–Gujarat border',
    location_name: 'Mumbai BKC–Thane–Palghar–Gujarat border',
    latitude: 19.0657,
    longitude: 72.8687,
    lat: 19.0657,
    lng: 72.8687,
    nodalAgency: 'NHSRCL (National High Speed Rail Corporation Limited)',
    contractorName: 'L&T Infrastructure / Afcons - KPTL JV',
    originalBudgetCr: 38200,
    revisedBudgetCr: 41500,
    costCr: 41500,
    expenditureToDateCr: 18450,
    startDate: '2019-01-15',
    originalTargetDate: '2026-12-31',
    revisedTargetDate: '2028-06-30',
    aiPredictedDate: '2028-08-15',
    targetPhysicalProgress: 60,
    actualPhysicalProgress: 44,
    physicalProgress: 44,
    financialDisbursementPercentage: 44.5,
    riskScore: 74,
    riskLevel: 'High',
    primaryRisk: 'Undersea/Underground Tunnelling & Urban Interface',
    delayDays: 548,
    costOverrunForecastCr: 3300,
    status: 'At Risk',
    lastUpdated: '14 Sep 2026',
    stage: 'Construction',
    knownDetails: '508-km corridor; Maharashtra stretch reported as 135.45 km. Public reports show major civil works continuing, including BKC underground terminus shaft and undersea tunnel between BKC and Shilphata.',
    likelyRiskCauses: 'Urban land/interface constraints; underground/undersea works; utilities; schedule coordination',
    earlyWarning: 'Monitor milestone slippage, package productivity, utilities, land/approval dependencies',
    recommendedAction: 'Weekly critical-path review; joint utility task force; verified progress evidence',
    riskFactors: [
      {
        id: 'rf-hsr-1',
        factor: 'Undersea Tunnel TBM Drive (BKC to Shilphata, 21 km)',
        impactScore: 38,
        direction: 'increase',
        category: 'Environmental / Geotechnical',
        detail: 'Deep subterranean and undersea basalt rock geology requires twin TBM drives with specialized pressure management.'
      },
      {
        id: 'rf-hsr-2',
        factor: 'BKC Underground Terminal Station Utility Shifting',
        impactScore: 26,
        direction: 'increase',
        category: 'Technical',
        detail: 'Dense urban financial hub interface with multiple high-tension telecom and power lines requires staged weekend diversions.'
      }
    ],
    milestones: [
      { id: 'm-hsr-1', name: 'Land Acquisition & Palghar Forest Clearances', plannedStartDate: '2019-01-15', plannedEndDate: '2023-06-30', actualEndDate: '2023-11-20', status: 'Completed', progressPercentage: 100 },
      { id: 'm-hsr-2', name: 'BKC Terminus Shaft Excavation & Diaphragm Wall', plannedStartDate: '2023-03-01', plannedEndDate: '2025-08-31', status: 'In Progress', progressPercentage: 62 },
      { id: 'm-hsr-3', name: 'Thane Creek Undersea Tunnel TBM Assembly & Drive', plannedStartDate: '2024-01-01', plannedEndDate: '2027-03-31', status: 'In Progress', progressPercentage: 28 },
      { id: 'm-hsr-4', name: 'Elevated Viaduct Package C-3 (Thane to Palghar)', plannedStartDate: '2023-06-01', plannedEndDate: '2027-12-31', status: 'In Progress', progressPercentage: 45 },
      { id: 'm-hsr-5', name: 'Track Laying (J-Slab) & Shinkansen Power Systems', plannedStartDate: '2027-01-01', plannedEndDate: '2028-06-30', status: 'Pending', progressPercentage: 0 }
    ],
    images: [
      {
        id: 'img-hsr-1',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&q=80&w=1000',
        caption: 'BKC Underground High-Speed Terminal Shaft Excavation & Piling',
        date: '10 Sep 2026',
        dateCaptured: '10 Sep 2026',
        source: 'Field Verified',
        stage: 'Underground Terminus Foundation',
        uploadedBy: 'NHSRCL Lead Inspection Engineer',
        lat: 19.0657,
        lng: 72.8687,
        isGeotagVerified: true,
        verificationStatus: 'Verified',
        notes: 'Basalt excavation at 32m depth proceeding with rock anchors.'
      },
      {
        id: 'img-hsr-2',
        url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=1000',
        caption: 'Palghar Stretch Elevated Viaduct Pier Casting & Box Girder Launch',
        date: '05 Sep 2026',
        dateCaptured: '05 Sep 2026',
        source: 'Geo-tagged Drone',
        stage: 'Viaduct Superstructure',
        uploadedBy: 'Field Monitoring Cell',
        lat: 19.6967,
        lng: 72.7699,
        isGeotagVerified: true,
        verificationStatus: 'Verified',
        notes: 'Full-span launching gantry (FSLM) in continuous 24/7 cycle.'
      }
    ],
    sCurveData: [
      { month: 'Apr 26', target: 48, actual: 38, predicted: 38 },
      { month: 'Jun 26', target: 54, actual: 41, predicted: 41 },
      { month: 'Aug 26', target: 60, actual: 44, predicted: 44 },
      { month: 'Oct 26', target: 65, actual: 44, predicted: 47 }
    ],
    auditTrail: [
      {
        id: 'aud-hsr-01',
        date: '12 Sep 2026',
        author: 'Joint Secy (Infrastructure)',
        role: 'Central Project Monitor',
        actionTaken: 'Risk flag recorded: Undersea TBM supply chain',
        note: 'Coordinated with customs for heavy cutter-head clearance at Nhava Sheva port.',
        previousRiskScore: 70,
        newRiskScore: 74
      }
    ]
  }
];
