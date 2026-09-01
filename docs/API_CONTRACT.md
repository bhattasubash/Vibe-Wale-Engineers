# API Contract

This document outlines all FastAPI endpoints exposed by the AYUSH-Care / MediKiosk backend.

## Patient Endpoints (/api/patients)

### `POST /api/patients/register`
Register a new patient.
- **Request Body**:
  ```typescript
  interface RegisterPatientRequest {
    full_name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone?: string;
    language_preference?: string; // e.g., 'hi', 'en'
    abha_id?: string;
  }
  ```
- **Response Body**:
  ```typescript
  interface RegisterPatientResponse {
    patient_id: string; // UUID
  }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

### `POST /api/patients/identify`
Identify an existing patient by ABHA ID or lookup.
- **Request Body**:
  ```typescript
  interface IdentifyPatientRequest {
    abha_id?: string;
    phone?: string;
  }
  ```
- **Response Body**:
  ```typescript
  interface IdentifyPatientResponse {
    patient_id: string; // UUID
    full_name: string;
    age: number;
    gender: string;
    language_preference: string;
  }
  ```
- **Status Codes**: 200 OK, 404 Not Found

### `GET /api/patients/{patient_id}`
Get a patient profile.
- **Response Body**: `IdentifyPatientResponse`
- **Status Codes**: 200 OK, 404 Not Found

---

## Session Endpoints (/api/sessions)

### `POST /api/sessions/start`
Start a new kiosk session for an identified or registered patient.
- **Request Body**:
  ```typescript
  interface StartSessionRequest {
    patient_id: string; // UUID
    language?: string; // e.g., 'hi', 'en' (default: 'hi')
  }
  ```
- **Response Body**:
  ```typescript
  interface StartSessionResponse {
    session_id: string; // UUID
    status: 'in_progress';
  }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

### `PATCH /api/sessions/{session_id}/consent`
Record consent grant with timestamp.
- **Request Body**:
  ```typescript
  interface ConsentRequest {
    consent_granted: boolean;
  }
  ```
- **Response Body**: `{ success: boolean, consent_timestamp: string }`
- **Status Codes**: 200 OK

### `PATCH /api/sessions/{session_id}/language`
Update session language.
- **Request Body**:
  ```typescript
  interface UpdateLanguageRequest {
    language: string;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `PATCH /api/sessions/{session_id}/complaint`
Submit chief complaint text.
- **Request Body**:
  ```typescript
  interface SubmitComplaintRequest {
    chief_complaint: string;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `GET /api/sessions/{session_id}`
Get full session state (useful for resume/reconnect).
- **Response Body**:
  ```typescript
  interface SessionStateResponse {
    session_id: string;
    patient_id: string;
    language: string;
    chief_complaint?: string;
    status: string;
    current_step: string;
    consent_granted: boolean;
  }
  ```
- **Status Codes**: 200 OK

### `PATCH /api/sessions/{session_id}/step`
Update the current step in the patient flow.
- **Request Body**:
  ```typescript
  interface UpdateStepRequest {
    current_step: string;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

---

## Conversation Endpoints (/api/conversation)

### `POST /api/conversation/{session_id}/turn`
Submit a patient message, receive AI follow-up question.
- **Request Body**:
  ```typescript
  interface TurnRequest {
    message: string;
    input_mode: 'voice' | 'touch' | 'text';
  }
  ```
- **Response Body**:
  ```typescript
  interface TurnResponse {
    ai_response: string;
    suggested_options: string[];
    is_complete: boolean;
    red_flag: {
      triggered: boolean;
      description?: string;
    };
  }
  ```
- **Status Codes**: 200 OK

### `GET /api/conversation/{session_id}/history`
Get all conversation turns for the session.
- **Response Body**:
  ```typescript
  interface ConversationHistoryResponse {
    turns: {
      speaker: 'system' | 'patient';
      message_text: string;
      input_mode: 'voice' | 'touch' | 'text';
      created_at: string;
    }[];
  }
  ```
- **Status Codes**: 200 OK

---

## Prakriti Endpoints (/api/prakriti)

### `GET /api/prakriti/questions`
Get the list of 15 Prakriti questions with options.
- **Response Body**:
  ```typescript
  interface PrakritiQuestionsResponse {
    questions: {
      question_id: string;
      question_text: string;
      options: {
        text: string;
        dosha_tag: 'vata' | 'pitta' | 'kapha';
      }[];
    }[];
  }
  ```
- **Status Codes**: 200 OK

### `POST /api/prakriti/{session_id}/answer`
Submit answer to a single Prakriti question.
- **Request Body**:
  ```typescript
  interface PrakritiAnswerRequest {
    question_id: string;
    selected_option: string;
    dosha_tag: 'vata' | 'pitta' | 'kapha';
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `POST /api/prakriti/{session_id}/calculate`
Trigger dosha score calculation after all 15 answered.
- **Response Body**: (returns `PrakritiResult`)
- **Status Codes**: 200 OK

### `GET /api/prakriti/{session_id}/result`
Get calculated Prakriti result.
- **Response Body**:
  ```typescript
  interface PrakritiResult {
    vata_score: number;
    pitta_score: number;
    kapha_score: number;
    dominant_prakriti: string;
    secondary_prakriti?: string;
    confidence: 'low' | 'medium' | 'high';
  }
  ```
- **Status Codes**: 200 OK

---

## Pariksha Endpoints (/api/pariksha)

### `POST /api/pariksha/{session_id}`
Submit all 9 remaining Dashavidha parameters in one request.
- **Request Body**:
  ```typescript
  interface ParikshaSubmitRequest {
    vikriti?: string;
    sara?: string;
    samhanana?: string;
    pramana?: string;
    satmya?: string;
    satva?: string;
    ahara_shakti?: string;
    vyayama_shakti?: string;
    vaya?: number;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `GET /api/pariksha/{session_id}`
Get Pariksha notes for the session.
- **Response Body**: `ParikshaSubmitRequest`
- **Status Codes**: 200 OK

---

## Document Endpoints (/api/documents)

### `POST /api/documents/{session_id}`
Upload document record with client-extracted OCR text and metadata.
- **Request Body**:
  ```typescript
  interface UploadDocumentRequest {
    file_name: string;
    file_url: string; // Supabase Storage URL or data URI
    file_type: 'prescription' | 'lab_report' | 'discharge_summary' | 'other';
    extracted_text?: string;
    structured_data?: Record<string, any>;
    confidence_score?: number;
    document_date?: string;
  }
  ```
- **Response Body**:
  ```typescript
  interface UploadDocumentResponse {
    document_id: string;
    processing_status: 'completed';
    created_at: string;
  }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

### `GET /api/documents/{session_id}`
List all documents attached to the session.
- **Response Body**:
  ```typescript
  interface DocumentListResponse {
    documents: {
      id: string;
      file_name: string;
      file_url: string;
      file_type: string;
      extracted_text: string;
      structured_data: any;
      confidence_score: number;
      created_at: string;
    }[];
  }
  ```
- **Status Codes**: 200 OK

### `DELETE /api/documents/{document_id}`
Remove an uploaded document.
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

---

## Summary Endpoints (/api/summary)

### `POST /api/summary/{session_id}/generate`
Trigger summary generation.
- **Response Body**:
  ```typescript
  interface GenerateSummaryResponse {
    generated_summary: {
      chief_complaint: string;
      hpi: string;
      past_history: string;
      medications: string[];
      allergies: string[];
      family_history: string;
      personal_history: string;
      ros: string;
      prakriti_summary: string;
      documents_summary: string;
    };
    raw_summary_text: string;
  }
  ```
- **Status Codes**: 200 OK

### `GET /api/summary/{session_id}`
Get generated summary.
- **Response Body**: `GenerateSummaryResponse`
- **Status Codes**: 200 OK

### `PATCH /api/summary/{session_id}/confirm`
Patient confirms summary accuracy.
- **Request Body**:
  ```typescript
  interface ConfirmSummaryRequest {
    patient_confirmed: boolean;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `POST /api/summary/{session_id}/submit`
Final submission: pushes to physician queue, triggers mock ABHA link.
- **Response Body**: `{ success: boolean, status: 'awaiting_review' }`
- **Status Codes**: 200 OK

---

## Physician Endpoints (/api/physician)

### `GET /api/physician/queue`
Get list of sessions awaiting review.
- **Response Body**:
  ```typescript
  interface PhysicianQueueResponse {
    sessions: {
      session_id: string;
      patient_name: string;
      age: number;
      gender: string;
      chief_complaint: string;
      red_flag_triggered: boolean;
      created_at: string;
    }[];
  }
  ```
- **Status Codes**: 200 OK

### `GET /api/physician/session/{session_id}`
Get complete session data for physician review.
- **Response Body**:
  ```typescript
  interface PhysicianSessionReviewResponse {
    summary: any;
    prakriti: any;
    documents: any[];
    red_flags: any[];
  }
  ```
- **Status Codes**: 200 OK

### `PATCH /api/physician/session/{session_id}/review`
Physician accepts/amends/rejects summary.
- **Request Body**:
  ```typescript
  interface PhysicianReviewRequest {
    status: 'accepted' | 'amended' | 'rejected';
    edited_summary?: any;
    notes?: string;
  }
  ```
- **Response Body**: `{ success: boolean }`
- **Status Codes**: 200 OK

### `GET /api/physician/stats`
Dashboard stats.
- **Response Body**:
  ```typescript
  interface PhysicianStatsResponse {
    patients_today: number;
    avg_time_minutes: number;
    red_flags_count: number;
  }
  ```
- **Status Codes**: 200 OK

---

## Health/Utility

### `GET /api/health`
Server health check.
- **Response Body**: `{ status: string, version: string }`
- **Status Codes**: 200 OK

### `GET /api/config/languages`
Get supported languages list.
- **Response Body**:
  ```typescript
  interface LanguagesResponse {
    languages: {
      code: string;
      name: string;
    }[];
  }
  ```
- **Status Codes**: 200 OK
