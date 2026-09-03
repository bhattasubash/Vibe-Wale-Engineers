import io
import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.main import app
from backend.models.schemas import (
    IndividualReportExtraction,
    OverallPatientHistory,
    ReportFinding,
    VerificationStatus,
)

client = TestClient(app)


def create_dummy_image_bytes(text="test") -> bytes:
    img = Image.new("RGB", (200, 100), color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "tesseract_ocr_available" in data
    assert "gemini_api_configured" in data


def test_process_reports_pipeline(tmp_path, monkeypatch):
    monkeypatch.setattr("backend.config.settings.STORAGE_DIR", str(tmp_path))

    mock_extraction = IndividualReportExtraction(
        report_type="CBC",
        report_date="2026-08-20",
        facility_name="Metropolis Lab",
        summary="Complete blood count examination.",
        findings=[
            ReportFinding(
                test_name="Hemoglobin",
                value="13.2",
                unit="g/dL",
                reference_range="13.0-17.0",
                status="NORMAL",
                explanation="Normal adult level.",
            )
        ],
        observations=["Specimen adequate"],
        impression="Normal CBC",
        doctor_remarks="Routine checkup",
        diagnoses=[],
        medications=[],
        clinical_history=[],
        uncertain_information=[],
    )

    mock_history = OverallPatientHistory(
        past_medical_surgical_history="No prior surgical history.",
        drug_allergy_history="No known drug allergies.",
        personal_history="Not available in provided records.",
        review_of_systems="No acute symptoms reported.",
        prior_investigations_summary="Single CBC on 2026-08-20 with normal hemoglobin.",
    )

    with patch("backend.services.gemini_service.gemini_service.extract_individual_report", return_value=mock_extraction):
        with patch("backend.services.gemini_service.gemini_service.synthesize_patient_history", return_value=mock_history):
            img1 = create_dummy_image_bytes()
            img2 = create_dummy_image_bytes()

            files = [
                ("files", ("report_001_page_01.jpg", io.BytesIO(img1), "image/jpeg")),
                ("files", ("report_001_page_02.jpg", io.BytesIO(img2), "image/jpeg")),
            ]

            response = client.post("/api/process-reports", files=files)

            assert response.status_code == 200, response.text
            data = response.json()
            assert data["status"] == "queued"
            assert "patient_session_id" in data

            # Starlette TestClient runs BackgroundTasks before returning.
            # Verify saved session file on disk
            result_file = Path(tmp_path) / "results" / f"patient_session_{data['patient_session_id']}.json"
            assert result_file.exists()

            with open(result_file, "r", encoding="utf-8") as f:
                saved_session = json.load(f)

            assert saved_session["patient_session_id"] == data["patient_session_id"]
            assert len(saved_session["reports"]) == 1

            rep_file = Path(saved_session["reports"][0]["report_summary_file"])
            assert rep_file.exists()

            with open(rep_file, "r", encoding="utf-8") as f:
                saved_report = json.load(f)

            assert saved_report["report_id"] == "report_001"
            assert len(saved_report["source_pages"]) == 2
            assert len(saved_report["findings"]) == 1
            assert "value_verification" in saved_report


def test_process_reports_with_explicit_grouping(tmp_path, monkeypatch):
    monkeypatch.setattr("backend.config.settings.STORAGE_DIR", str(tmp_path))

    cbc_mock = IndividualReportExtraction(
        report_type="CBC",
        report_date="2026-08-20",
        summary="CBC report.",
        findings=[ReportFinding(test_name="Hemoglobin", value="13.2")],
    )
    lipid_mock = IndividualReportExtraction(
        report_type="Lipid Profile",
        report_date="2026-08-21",
        summary="Lipid report.",
        findings=[ReportFinding(test_name="Total Cholesterol", value="210")],
    )

    def mock_extract(image_paths, report_hint=None):
        if "cbc" in (report_hint or "").lower():
            return cbc_mock
        return lipid_mock

    mock_history = OverallPatientHistory(
        past_medical_surgical_history="Not available in provided records.",
        drug_allergy_history="Not available in provided records.",
        personal_history="Not available in provided records.",
        review_of_systems="Not available in provided records.",
        prior_investigations_summary="CBC and Lipid panels reviewed.",
    )

    with patch("backend.services.gemini_service.gemini_service.extract_individual_report", side_effect=mock_extract):
        with patch("backend.services.gemini_service.gemini_service.synthesize_patient_history", return_value=mock_history):
            img_bytes = create_dummy_image_bytes()

            files = [
                ("files", ("pageA.jpg", io.BytesIO(img_bytes), "image/jpeg")),
                ("files", ("pageB.jpg", io.BytesIO(img_bytes), "image/jpeg")),
                ("files", ("pageC.jpg", io.BytesIO(img_bytes), "image/jpeg")),
            ]

            # Explicit grouping: pageA and pageB -> report_cbc; pageC -> report_lipid
            grouping_json = json.dumps({
                "report_cbc": ["pageA.jpg", "pageB.jpg"],
                "report_lipid": ["pageC.jpg"],
            })

            # Test synchronous mode via sync=true
            response = client.post(
                "/api/process-reports",
                files=files,
                data={"report_grouping": grouping_json, "sync": "true"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "completed"
            assert data["reports_processed"] == 2

            # Check individual report files
            session_data = json.loads(Path(data["result_file"]).read_text(encoding="utf-8"))
            report_ids = [r["report_id"] for r in session_data["reports"]]
            assert "report_cbc" in report_ids
            assert "report_lipid" in report_ids


def test_tesseract_mismatch_sets_unclear_value(tmp_path, monkeypatch):
    monkeypatch.setattr("backend.config.settings.STORAGE_DIR", str(tmp_path))

    mock_extraction = IndividualReportExtraction(
        report_type="CBC",
        summary="CBC report.",
        findings=[ReportFinding(test_name="Hemoglobin", value="13.2")],
    )
    mock_history = OverallPatientHistory(
        past_medical_surgical_history="Not available in provided records.",
        drug_allergy_history="Not available in provided records.",
        personal_history="Not available in provided records.",
        review_of_systems="Not available in provided records.",
        prior_investigations_summary="Investigations recorded.",
    )

    # Simulate OCR finding Hb with value 18.2 (mismatch!) and conf 95.0
    mock_tokens = [
        {"text": "Hb", "left": 50, "top": 100, "width": 30, "height": 15, "conf": 95.0},
        {"text": "18.2", "left": 120, "top": 102, "width": 35, "height": 14, "conf": 95.0},
    ]

    with patch("backend.services.gemini_service.gemini_service.extract_individual_report", return_value=mock_extraction):
        with patch("backend.services.gemini_service.gemini_service.synthesize_patient_history", return_value=mock_history):
            with patch("backend.services.ocr_service.ocr_service.get_image_ocr_tokens", return_value=mock_tokens):
                files = [
                    ("files", ("report_001_page_01.jpg", io.BytesIO(create_dummy_image_bytes()), "image/jpeg")),
                ]

                response = client.post("/api/process-reports", files=files)
                assert response.status_code == 200

                report_path = Path(tmp_path) / "results" / "reports" / "report_001.json"
                report_json = json.loads(report_path.read_text(encoding="utf-8"))

                # Finding value should be marked 'unclear' due to mismatch
                assert report_json["findings"][0]["value"] == "unclear"
                verif = report_json["value_verification"][0]
                assert verif["verification_status"] == "mismatch"
                assert verif["final_value"] == "unclear"
                assert verif["gemini_value"] == "13.2"
                assert verif["tesseract_value"] == "18.2"


def test_empty_files_rejected():
    response = client.post("/api/process-reports", files=[])
    # FastAPI returns 422 for missing required file field
    assert response.status_code in (400, 422)


def test_ephemeral_image_cleanup(tmp_path, monkeypatch):
    """Verifies that ephemeral image files and temporary directories are 100% removed after processing."""
    from backend.services.report_service import report_service

    captured_temp_dirs = []
    original_save = report_service.save_uploaded_files_ephemeral

    async def mock_save_ephemeral(*args, **kwargs):
        temp_dir, metas = await original_save(*args, **kwargs)
        captured_temp_dirs.append(temp_dir)
        return temp_dir, metas

    monkeypatch.setattr(report_service, "save_uploaded_files_ephemeral", mock_save_ephemeral)
    monkeypatch.setattr("backend.config.settings.STORAGE_DIR", str(tmp_path))

    mock_extraction = IndividualReportExtraction(
        report_type="CBC",
        summary="CBC report.",
        findings=[],
    )
    mock_history = OverallPatientHistory(
        past_medical_surgical_history="None",
        drug_allergy_history="None",
        personal_history="None",
        review_of_systems="None",
        prior_investigations_summary="None",
    )

    with patch("backend.services.gemini_service.gemini_service.extract_individual_report", return_value=mock_extraction):
        with patch("backend.services.gemini_service.gemini_service.synthesize_patient_history", return_value=mock_history):
            files = [
                ("files", ("test_page.jpg", io.BytesIO(create_dummy_image_bytes()), "image/jpeg")),
            ]

            response = client.post("/api/process-reports", files=files)
            assert response.status_code == 200
            assert len(captured_temp_dirs) == 1
            temp_dir = captured_temp_dirs[0]

            # The temporary directory must NOT exist on disk anymore (ephemeral auto-purge guarantee)
            assert not temp_dir.exists(), f"Ephemeral directory {temp_dir} was not cleaned up!"
