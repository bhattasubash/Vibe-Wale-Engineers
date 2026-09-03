"""
Pydantic v2 schemas for all AYUSH-Care FastAPI endpoints.
Strict typing ensures zero runtime deserialization failures.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


# --- PATIENT SCHEMAS ---
class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(male|female|other)$")
    phone: Optional[str] = Field(None, max_length=15)
    abha_id: Optional[str] = Field(None, max_length=50)
    abha_address: Optional[str] = Field(None, max_length=100)
    aadhaar_last_four: Optional[str] = Field(None, min_length=4, max_length=4)


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    is_returning: bool = False
    last_visit_date: Optional[str] = None


# --- PRAKRITI SCHEMAS ---
class PrakritiAnswerItem(BaseModel):
    question_id: str
    dosha_tag: str = Field(..., pattern="^(vata|pitta|kapha)$")
    points: int = Field(1, ge=1, le=2)


class PrakritiCalculateRequest(BaseModel):
    session_id: str
    answers: List[PrakritiAnswerItem] = Field(..., min_length=1, max_length=15)


class PrakritiResultResponse(BaseModel):
    session_id: str
    vata_score: int
    pitta_score: int
    kapha_score: int
    dominant_prakriti: str
    secondary_prakriti: Optional[str] = None
    confidence: str
    clinical_note: str


# --- SESSION & SOCRATES SCHEMAS ---
class SessionStartRequest(BaseModel):
    patient_id: Optional[str] = None
    patient_data: Optional[PatientCreate] = None
    language: str = Field("hi", max_length=10)


class SessionResponse(BaseModel):
    session_id: str
    status: str
    language: str
    created_at: datetime


class ChiefComplaintRequest(BaseModel):
    complaint_text: str = Field(..., min_length=2)
    category: Optional[str] = "general"


class SocratesTurnRequest(BaseModel):
    turn_index: int = Field(..., ge=1, le=5)
    key: str
    selected_value: str


# --- BATCH OFFLINE SYNC SCHEMA ---
class OfflineSessionItem(BaseModel):
    sessionId: str
    patientName: str
    age: Any
    gender: str
    phone: Optional[str] = None
    abhaId: Optional[str] = None
    abhaAddress: Optional[str] = None
    chiefComplaint: str
    complaintCategory: Optional[str] = "general"
    socrates: Optional[Dict[str, Any]] = None
    prakritiResult: Optional[Dict[str, Any]] = None
    consentGranted: bool = True
    consentTimestamp: Optional[str] = None
    createdAt: str


class SessionSyncBatchRequest(BaseModel):
    sessions: List[OfflineSessionItem]


class SessionSyncBatchResponse(BaseModel):
    synced_count: int
    failed_count: int
    message: str


# --- DOCTOR DASHBOARD SCHEMAS ---
class DoctorQueueItem(BaseModel):
    session_id: str
    patient_name: str
    age: int
    gender: str
    abha_id: Optional[str] = None
    token_number: str
    chief_complaint: str
    dominant_prakriti: str
    red_flag_triggered: bool
    priority: str  # 'critical' | 'high' | 'normal'
    assigned_doctor: str
    room_number: str
    created_at: str


class DoctorReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(accepted|amended|rejected)$")
    doctor_id: str
    doctor_notes: Optional[str] = None
    amended_summary: Optional[Dict[str, Any]] = None


# --- OCR & REPORT EXTRACTION SCHEMAS ---
class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    UNCLEAR = "unclear"
    MISMATCH = "mismatch"
    NOT_FOUND = "not_found"


class ValueVerification(BaseModel):
    test_name: str
    gemini_value: str
    tesseract_value: Optional[str] = None
    tesseract_confidence: Optional[float] = None
    verification_status: VerificationStatus
    final_value: str


class ReportFinding(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: Optional[str] = None
    verified_status: Optional[str] = None


class IndividualReportExtraction(BaseModel):
    report_type: str = "Prescription / Lab Report"
    medical_specialty: Optional[str] = "Kayachikitsa (Ayurveda)"
    report_date: Optional[str] = None
    facility_name: Optional[str] = None
    summary: str = ""
    findings: List[ReportFinding] = Field(default_factory=list)
    observations: List[str] = Field(default_factory=list)
    impression: Optional[str] = None
    doctor_remarks: Optional[str] = None
    diagnoses: List[str] = Field(default_factory=list)
    medications: List[Dict[str, Any]] = Field(default_factory=list)
    clinical_history: Optional[str] = None
    uncertain_information: List[str] = Field(default_factory=list)


class IndividualReportOutput(BaseModel):
    report_id: str
    report_type: str
    medical_specialty: str = "General Medicine"
    report_date: Optional[str] = None
    facility_name: Optional[str] = None
    source_pages: List[str] = Field(default_factory=list)
    summary: str
    findings: List[ReportFinding] = Field(default_factory=list)
    observations: List[str] = Field(default_factory=list)
    impression: Optional[str] = None
    doctor_remarks: Optional[str] = None
    diagnoses: List[str] = Field(default_factory=list)
    medications: List[Dict[str, Any]] = Field(default_factory=list)
    clinical_history: Optional[str] = None
    uncertain_information: List[str] = Field(default_factory=list)
    value_verification: List[ValueVerification] = Field(default_factory=list)


class OverallPatientHistory(BaseModel):
    past_medical_surgical_history: Optional[str] = "Not available."
    drug_allergy_history: Optional[str] = "No known drug allergies reported."
    family_history: Optional[str] = "Not reported."
    personal_history: Optional[str] = "Not reported."
    review_of_systems: Optional[str] = "Not reported."
    prior_investigations_summary: Optional[str] = "See extracted reports."


class ReportSummaryReference(BaseModel):
    report_id: str
    report_type: str
    medical_specialty: str
    report_summary_file: Optional[str] = None


class PatientSessionOutput(BaseModel):
    patient_session_id: str
    overall_summary: OverallPatientHistory
    reports: List[ReportSummaryReference] = Field(default_factory=list)
    reports_by_specialty: Dict[str, List[ReportSummaryReference]] = Field(default_factory=dict)
    uncertain_information: List[str] = Field(default_factory=list)


class ProcessReportsResponse(BaseModel):
    status: str
    patient_session_id: str
    reports_processed: int
    result_file: Optional[str] = None
    message: str
