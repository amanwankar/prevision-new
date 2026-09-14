-- ====================================================
-- PRAEVISIO PostgreSQL Database Schema (MoSPI / SIH 2026)
-- Problem ID: SIH26103
-- ====================================================

-- 1. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Users / Profiles Table
CREATE TABLE IF NOT EXISTS users_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'field_inspector' NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    avatar_url TEXT,
    assigned_sectors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    department VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    location_name VARCHAR(255),
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    nodal_agency VARCHAR(255) NOT NULL,
    contractor_name VARCHAR(255),
    
    -- Financials (in ₹ Crores)
    original_budget_cr NUMERIC(12,2) NOT NULL,
    revised_budget_cr NUMERIC(12,2) NOT NULL,
    expenditure_to_date_cr NUMERIC(12,2) DEFAULT 0.00,
    
    -- Schedule
    start_date DATE NOT NULL,
    original_target_date DATE NOT NULL,
    revised_target_date DATE NOT NULL,
    ai_predicted_date DATE,
    
    -- Progress
    target_physical_progress NUMERIC(5,2) NOT NULL,
    actual_physical_progress NUMERIC(5,2) NOT NULL,
    financial_disbursement_percentage NUMERIC(5,2) DEFAULT 0.00,
    
    -- AI Risk Assessment
    risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) DEFAULT 'Low',
    primary_risk VARCHAR(100),
    delay_days INT DEFAULT 0,
    cost_overrun_forecast_cr NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'On Track',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Project Risks (XAI Feature Attribution) Table
CREATE TABLE IF NOT EXISTS project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    factor VARCHAR(255) NOT NULL,
    impact_score INT NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'increase' | 'decrease'
    category VARCHAR(100) NOT NULL,
    detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Early Warnings Table
CREATE TABLE IF NOT EXISTS early_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- 'High' | 'Medium' | 'Low'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    trigger_condition VARCHAR(255),
    time_ago VARCHAR(50),
    status VARCHAR(50) DEFAULT 'New', -- 'New' | 'Acknowledged' | 'Escalated' | 'Resolved'
    assigned_officer VARCHAR(255),
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Recommended Actions Table
CREATE TABLE IF NOT EXISTS recommended_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    priority VARCHAR(20) NOT NULL, -- 'Urgent' | 'High' | 'Normal'
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rationale TEXT NOT NULL,
    ai_confidence_score INT DEFAULT 85,
    assigned_to VARCHAR(255),
    assigned_role VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' | 'In Progress' | 'Executed'
    expected_impact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Risk History Trend Table
CREATE TABLE IF NOT EXISTS risk_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(20) NOT NULL,
    avg_risk_score INT NOT NULL,
    high_risk_count INT DEFAULT 0,
    medium_risk_count INT DEFAULT 0,
    low_risk_count INT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS Security Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommended_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON early_warnings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON recommended_actions FOR SELECT USING (true);
