-- ====================================================================
-- AYUSH-Care (MediKiosk) Database Schema for Supabase / PostgreSQL 15
-- Grounded in Charaka Samhita Dashavidha Pariksha & ABDM Standards
-- ====================================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abha_id VARCHAR(50) UNIQUE,
  abha_address VARCHAR(100),
  aadhaar_last_four CHAR(4),
  full_name VARCHAR(200) NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone VARCHAR(15),
  language_preference VARCHAR(10) DEFAULT 'hi',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Physicians Table
CREATE TABLE IF NOT EXISTS physicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Kayachikitsa (Ayurveda)',
  designation VARCHAR(100) DEFAULT 'BAMS, MD',
  room_number VARCHAR(50) DEFAULT 'Room 104',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Active Kiosk Intake Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  physician_id UUID REFERENCES physicians(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'hi',
  chief_complaint TEXT,
  complaint_category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'awaiting_review', 'reviewed', 'completed')),
  red_flag_triggered BOOLEAN DEFAULT FALSE,
  red_flag_severity VARCHAR(20),
  consent_granted BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  token_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 4. Prakriti Classical Results
CREATE TABLE IF NOT EXISTS prakriti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  vata_score INTEGER NOT NULL,
  pitta_score INTEGER NOT NULL,
  kapha_score INTEGER NOT NULL,
  dominant_prakriti VARCHAR(100) NOT NULL,
  secondary_prakriti VARCHAR(50),
  confidence VARCHAR(20) CHECK (confidence IN ('high', 'medium', 'low')),
  dominance_gap INTEGER NOT NULL,
  clinical_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Uploaded Medical Documents & OCR
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  structured_entities JSONB,
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Sub-Millisecond Query Performance
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_red_flag ON sessions(red_flag_triggered);
CREATE INDEX IF NOT EXISTS idx_prakriti_session_id ON prakriti_results(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);
