from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


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
    final_value: str = "unclear"


class ReportFinding(BaseModel):
    test_name: str = Field(description="Name of the test or biomarker, e.g., Hemoglobin, Fasting Blood Sugar")
    value: str = Field(description="Numerical or qualitative value extracted directly from the report")
    unit: Optional[str] = Field(default=None, description="Measurement unit, e.g. g/dL, mg/dL, mm/hr")
    reference_range: Optional[str] = Field(default=None, description="Normal reference range if printed, e.g. 13.0-17.0")
    status: Optional[str] = Field(default=None, description="Indicator e.g. NORMAL, HIGH, LOW, ABNORMAL, or unclear")
    explanation: Optional[str] = Field(default=None, description="Plain-language explanation of this finding without diagnosis")


class IndividualReportExtraction(BaseModel):
    report_type: str = Field(description="Type of report e.g., CBC, Lipid Profile, Chest X-Ray, Dental Examination, ECG")
    medical_specialty: str = Field(
        default="General Medicine",
        description="Medical domain or specialty, e.g., Dental, Cardiology, Pathology, Radiology, Orthopedics, General Medicine"
    )
    report_date: Optional[str] = Field(default=None, description="Date of the report, or 'unclear' if not visible")
    facility_name: Optional[str] = Field(default=None, description="Hospital, laboratory, or clinic name")
    summary: str = Field(description="Plain-language summary of what is reported in this document")
    findings: List[ReportFinding] = Field(default_factory=list, description="List of lab/test findings")
    observations: List[str] = Field(default_factory=list, description="General observations explicitly noted")
    impression: Optional[str] = Field(default=None, description="Impression explicitly written in the report")
    doctor_remarks: Optional[str] = Field(default=None, description="Remarks or comments from the physician")
    diagnoses: List[str] = Field(default_factory=list, description="Diagnoses explicitly written on the report only")
    medications: List[str] = Field(default_factory=list, description="Medications explicitly mentioned")
    clinical_history: List[str] = Field(default_factory=list, description="Clinical history explicitly noted")
    uncertain_information: List[str] = Field(default_factory=list, description="Items that are unreadable, blurred, or ambiguous")


class IndividualReportOutput(BaseModel):
    report_id: str
    report_type: str
    medical_specialty: str = "General Medicine"
    report_date: Optional[str] = None
    facility_name: Optional[str] = None
    source_pages: List[str]
    summary: str
    findings: List[ReportFinding] = []
    observations: List[str] = []
    impression: Optional[str] = None
    doctor_remarks: Optional[str] = None
    diagnoses: List[str] = []
    medications: List[str] = []
    clinical_history: List[str] = []
    uncertain_information: List[str] = []
    value_verification: List[ValueVerification] = []


class OverallPatientHistory(BaseModel):
    past_medical_surgical_history: str = Field(
        description="Summary of past medical and surgical conditions documented across reports. 'Not available in provided records' if absent."
    )
    drug_allergy_history: str = Field(
        description="Documented medications and known allergies. 'Not available in provided records' if absent."
    )
    family_history: str = Field(
        default="Not documented in the provided records.",
        description="Family history documented across reports. 'Not available in provided records' if absent."
    )
    personal_history: str = Field(
        description="Relevant personal, social, or lifestyle history explicitly documented. 'Not available in provided records' if absent."
    )
    review_of_systems: str = Field(
        default="Not documented in the provided records.",
        description="Documented symptoms or systemic reviews across the reports. 'Not available in provided records' if absent."
    )
    prior_investigations_summary: str = Field(
        description="Synthesized longitudinal overview of lab tests, imaging, and diagnostic investigations."
    )


class ReportSummaryReference(BaseModel):
    report_id: str
    report_type: str
    medical_specialty: str = "General Medicine"
    report_summary_file: str


class PatientSessionOutput(BaseModel):
    patient_session_id: str
    overall_summary: OverallPatientHistory
    reports: List[ReportSummaryReference]
    reports_by_specialty: dict[str, List[ReportSummaryReference]] = Field(
        default_factory=dict,
        description="Detailed reports bundled and categorized by medical specialty (e.g. Dental, Cardiology)"
    )
    uncertain_information: List[str] = []
    disclaimer: str = (
        "This system summarizes information contained in uploaded medical records "
        "and does not provide a medical diagnosis or treatment recommendation."
    )


class ProcessReportsResponse(BaseModel):
    status: str
    patient_session_id: str
    reports_processed: int
    result_file: str
    message: Optional[str] = None
