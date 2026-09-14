# PRAEVISIO — Predictive Infrastructure Intelligence Platform
> **Smart India Hackathon 2026 | Problem ID: SIH26103**  
> **Ministry of Statistics and Programme Implementation (MoSPI)**  
> Developed by **TEAM-CONNECT**

---

## 🌟 Vision & Operational Philosophy

PRAEVISIO transforms infrastructure project monitoring from reactive reporting into proactive, AI-driven predictive intelligence. Built around the core operational workflow:

$$\text{PREDICT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{WARN} \longrightarrow \text{ACT} \longrightarrow \text{TRACK} \longrightarrow \text{DECIDE}$$

PRAEVISIO provides monitoring authorities with early visibility into schedule drifts, cost overrun pressures, contractor velocity bottlenecks, and inter-ministerial clearance delays long before they impact project completion.

---

## 🏛️ Core Platform Architecture

### 1. Portfolio Intelligence Center (`/#/portfolio`)
- **2D Priority Radar**: Maps projects across Risk Score vs Execution Progress to instantly pinpoint high-risk, low-progress outliers.
- **Cross-Project Comparison**: Side-by-side comparative analysis of up to 3 projects across S-curves, milestone velocity, and financial disbursements.
- **Departmental Intelligence**: Aggregated risk profiles for MoRTH, Railways, MoPNG, Coal, and Power sectors.
- **Executive Attention Queue**: Prioritized list of projects requiring urgent ministerial intervention.

### 2. Execution Control Center (`/#/projects/:id/execution`)
- **Plan vs. Reality S-Curve**: Interactive physical progress baseline vs actual trajectory comparison with forecast projection.
- **Project Control Loop**: Animated 8-stage operational state indicator (`PLAN → EXECUTE → MEASURE → DEVIATION → RISK → WARNING → ACTION → REASSESS`).
- **Milestone Control Table**: Granular milestone tracking with progress sliders, weightage, and delay flags.

### 3. Predictive Risk Engine & XAI
- **Unified 0–100 Risk Index**: Mathematical weighting combining Schedule Drift, Cost Overrun Ratio, Milestone Velocity, and Data Quality.
- **Explainable AI (XAI)**: SHAP-inspired human-readable risk factor breakdowns explaining *why* a project received its score.

### 4. Data Intelligence & Quality System (`/#/data-management`)
- Real-time data freshness, field completeness, and timeline continuity evaluation.
- Intake & edit forms with client-side validation to prevent invalid dates, negative budgets, or impossible progress values.

### 5. AI Copilot (`Ctrl + I` or Navbar)
- Interactive command interface providing instant answers, deep links, and actionable summaries based on live project telemetry.

### 6. Role-Based Access Control (RBAC) & Audit Logs (`/#/admin`)
- Role permissions matrix (`System Administrator`, `Senior Officer`, `Project Officer`, `Viewer`).
- Project-level authorization scoping and immutable audit logging.

### 7. SIH 2026 Presentation & Demo Mode (`Ctrl + Shift + D`)
- Guided step-by-step presentation scenario for hackathon judges with presenter guides, auto-play control, and reset capability.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript 5, Vite 8
- **Styling**: TailwindCSS 4, Vanilla Glassmorphism CSS design system
- **Data Visualization**: Recharts, Custom Canvas & SVG particle fields
- **Icons**: Lucide React
- **Backend / Database**: Supabase JS Client (with automatic local storage demo mode fallback)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/team-connect/praevisio.git
cd praevisio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build & Typecheck

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run linter
npm run lint

# Build production bundle with optimized Rollup chunking
npm run build

# Preview production build locally
npm run preview
```

---

## 🎮 Global Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` or `/` | Open Command Palette |
| `Ctrl + I` | Open AI Copilot Drawer |
| `Ctrl + Shift + D` | Toggle SIH Demo Mode |

---

## 🔒 Security & Data Disclaimer

PRAEVISIO operates in **Rule-Based & Predictive Simulation Mode** when external AI/Supabase endpoints are not configured. Demo telemetry and project parameters are simulated to showcase the platform's user experience and architectural capabilities for SIH 2026. No live government database credentials are stored or exposed in client-side code.
