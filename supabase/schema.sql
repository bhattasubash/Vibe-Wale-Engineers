-- ====================================================================
-- AYUSH-Care (MediKiosk) Production Database Schema for Supabase
-- Grounded in Charaka Samhita Dashavidha Pariksha & ABDM Standards
-- Ready for direct execution in Supabase SQL Editor (100% Idempotent)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PATIENTS TABLE
-- ====================================================================
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

-- ====================================================================
-- 2. PHYSICIANS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS physicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_code VARCHAR(50) UNIQUE,
  pin_hash VARCHAR(255),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Kayachikitsa (Ayurveda)',
  designation VARCHAR(100) DEFAULT 'BAMS, MD',
  room_number VARCHAR(50) DEFAULT 'Room 104',
  role VARCHAR(50) DEFAULT 'physician',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. SESSIONS TABLE (Kiosk OPD Interactions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  physician_id UUID REFERENCES physicians(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'hi',
  chief_complaint TEXT,
  complaint_category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'awaiting_review', 'reviewed', 'completed')),
  red_flag_triggered BOOLEAN DEFAULT false,
  red_flag_severity VARCHAR(20),
  red_flag_details JSONB,
  consent_granted BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  token_number VARCHAR(50),
  current_step VARCHAR(50) DEFAULT 'welcome',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ====================================================================
-- 4. CONVERSATION TURNS TABLE (Adaptive Follow-up Dialogue)
-- ====================================================================
CREATE TABLE IF NOT EXISTS conversation_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  turn_index INTEGER NOT NULL,
  speaker VARCHAR(20) NOT NULL CHECK (speaker IN ('system', 'patient')),
  message_text TEXT NOT NULL,
  input_mode VARCHAR(20) CHECK (input_mode IN ('voice', 'touch', 'text')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 5. PRAKRITI RESPONSES TABLE (Individual Questions PK-01 to PK-15)
-- ====================================================================
CREATE TABLE IF NOT EXISTS prakriti_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  dosha_tag VARCHAR(20) NOT NULL CHECK (dosha_tag IN ('vata', 'pitta', 'kapha')),
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 6. PRAKRITI RESULTS TABLE (Calculated Deterministic Scores)
-- ====================================================================
CREATE TABLE IF NOT EXISTS prakriti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  vata_score INTEGER NOT NULL,
  pitta_score INTEGER NOT NULL,
  kapha_score INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 15,
  dominant_prakriti VARCHAR(100) NOT NULL,
  secondary_prakriti VARCHAR(50),
  confidence VARCHAR(20) NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  dominance_gap INTEGER DEFAULT 0,
  clinical_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 7. PARIKSHA NOTES TABLE (Remaining 9 Dashavidha Parameters)
-- ====================================================================
CREATE TABLE IF NOT EXISTS pariksha_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  vikriti TEXT,
  sara TEXT,
  samhanana TEXT,
  pramana TEXT,
  satmya TEXT,
  satva TEXT,
  ahara_shakti TEXT,
  vyayama_shakti TEXT,
  vaya INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 8. DOCUMENTS TABLE (Uploaded Prescriptions & Reports with OCR)
-- ====================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) DEFAULT 'prescription' CHECK (file_type IN ('prescription', 'lab_report', 'discharge_summary', 'other')),
  extracted_text TEXT,
  structured_entities JSONB,
  document_date DATE,
  confidence_score FLOAT,
  processing_status VARCHAR(50) DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 9. RED FLAGS TABLE (Emergency Symptom Triage Interceptions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS red_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  rule_id VARCHAR(50) NOT NULL,
  flag_description TEXT NOT NULL,
  triggered_symptoms TEXT[] NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'moderate')),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES physicians(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 10. SUMMARIES TABLE (Clinical Synthesized Physician EMR Summaries)
-- ====================================================================
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  generated_summary JSONB NOT NULL,
  raw_summary_text TEXT NOT NULL,
  patient_confirmed BOOLEAN DEFAULT false,
  patient_confirmed_at TIMESTAMPTZ,
  physician_edited_summary JSONB,
  physician_status VARCHAR(50) DEFAULT 'pending' CHECK (physician_status IN ('pending', 'accepted', 'amended', 'rejected')),
  physician_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_physician_id ON sessions(physician_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_red_flag ON sessions(red_flag_triggered);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_res_session ON prakriti_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_results_session ON prakriti_results(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_session ON red_flags(session_id);
CREATE INDEX IF NOT EXISTS idx_summaries_session ON summaries(session_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE physicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pariksha_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Kiosk Public Read/Write Policies (Allows anonymous kiosk terminal intake)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk intake access' AND tablename = 'patients') THEN
    CREATE POLICY "Public kiosk intake access" ON patients FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk sessions access' AND tablename = 'sessions') THEN
    CREATE POLICY "Public kiosk sessions access" ON sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk turns access' AND tablename = 'conversation_turns') THEN
    CREATE POLICY "Public kiosk turns access" ON conversation_turns FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk prakriti responses access' AND tablename = 'prakriti_responses') THEN
    CREATE POLICY "Public kiosk prakriti responses access" ON prakriti_responses FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk prakriti results access' AND tablename = 'prakriti_results') THEN
    CREATE POLICY "Public kiosk prakriti results access" ON prakriti_results FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk pariksha access' AND tablename = 'pariksha_notes') THEN
    CREATE POLICY "Public kiosk pariksha access" ON pariksha_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk documents access' AND tablename = 'documents') THEN
    CREATE POLICY "Public kiosk documents access" ON documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk red flags access' AND tablename = 'red_flags') THEN
    CREATE POLICY "Public kiosk red flags access" ON red_flags FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public kiosk summaries access' AND tablename = 'summaries') THEN
    CREATE POLICY "Public kiosk summaries access" ON summaries FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Physicians view access' AND tablename = 'physicians') THEN
    CREATE POLICY "Physicians view access" ON physicians FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ====================================================================
-- SEED DEFAULT HOSPITAL DOCTOR (For OPD Demo & Login)
-- ====================================================================
INSERT INTO physicians (doctor_code, full_name, email, department, designation, room_number, role)
VALUES
  ('DOC-AIIA-104', 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)', 'ananya.sharma@aiia.gov.in', 'कायचिकित्सा विभाग (Internal Medicine)', 'BAMS, MD (Ayu)', 'Room #104 (Block A)', 'Senior Ayurvedic Physician')
ON CONFLICT (email) DO UPDATE
SET
  doctor_code = EXCLUDED.doctor_code,
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  room_number = EXCLUDED.room_number;

-- ====================================================================
-- STORAGE BUCKET SETUP (For Patient Prescriptions & Lab Reports)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-documents', 'patient-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Public Access Policy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public document uploads' AND tablename = 'objects') THEN
    CREATE POLICY "Public document uploads" ON storage.objects
    FOR ALL USING (bucket_id = 'patient-documents')
    WITH CHECK (bucket_id = 'patient-documents');
  END IF;
END $$;
