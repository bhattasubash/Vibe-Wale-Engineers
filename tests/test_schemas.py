import pytest
from backend.models.schemas import (
    IndividualReportExtraction,
    IndividualReportOutput,
    OverallPatientHistory,
    PatientSessionOutput,
    ProcessReportsResponse,
    ReportFinding,
    ReportSummaryReference,
    ValueVerification,
    VerificationStatus,
)


def test_value_verification_statuses():
    v1 = ValueVerification(
        test_name="Hemoglobin",
        gemini_value="13.2",
        tesseract_value="13.2",
        tesseract_confidence=94.0,
        verification_status=VerificationStatus.VERIFIED,
        final_value="13.2",
    )
    assert v1.verification_status == "verified"
    assert v1.final_value == "13.2"

    v2 = ValueVerification(
        test_name="Hemoglobin",
        gemini_value="13.2",
        tesseract_value="18.2",
        tesseract_confidence=93.0,
        verification_status=VerificationStatus.MISMATCH,
        final_value="unclear",
    )
    assert v2.verification_status == "mismatch"
    assert v2.final_value == "unclear"


def test_individual_report_output_schema():
    rep = IndividualReportOutput(
        report_id="report_001",
        report_type="CBC",
        report_date="2026-08-20",
        source_pages=["report_001_page_01.jpg"],
        summary="Routine complete blood count.",
        findings=[
            ReportFinding(
                test_name="Hemoglobin",
                value="12.1",
                unit="g/dL",
                reference_range="13.0-17.0",
                status="LOW",
                explanation="Below reference range.",
            )
        ],
        observations=[],
        impression="Mild anemia",
        doctor_remarks="Follow up in 3 months",
        diagnoses=["Microcytic Anemia"],
        medications=["Iron Supplement"],
        clinical_history=["Fatigue"],
        uncertain_information=[],
        value_verification=[
            ValueVerification(
                test_name="Hemoglobin",
                gemini_value="12.1",
                tesseract_value="12.1",
                tesseract_confidence=88.5,
                verification_status=VerificationStatus.VERIFIED,
                final_value="12.1",
            )
        ],
    )
    dumped = rep.model_dump()
    assert dumped["report_id"] == "report_001"
    assert len(dumped["findings"]) == 1
    assert dumped["value_verification"][0]["verification_status"] == "verified"


def test_patient_session_output_schema():
    history = OverallPatientHistory(
        past_medical_surgical_history="Hypertension diagnosed 2020.",
        drug_allergy_history="Amlodipine 5mg; Penicillin allergy.",
        personal_history="Non-smoker.",
        review_of_systems="Mild fatigue reported.",
        prior_investigations_summary="Prior CBC and Lipid profile on file.",
    )
    session = PatientSessionOutput(
        patient_session_id="session_test123",
        overall_summary=history,
        reports=[
            ReportSummaryReference(
                report_id="report_001",
                report_type="CBC",
                report_summary_file="storage/results/reports/report_001.json",
            )
        ],
        uncertain_information=[],
    )
    dumped = session.model_dump()
    assert dumped["patient_session_id"] == "session_test123"
    assert "family_history" in dumped["overall_summary"]
    assert "reports_by_specialty" in dumped
    assert "disclaimer" in dumped
