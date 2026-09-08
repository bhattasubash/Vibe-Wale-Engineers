import os
import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

server_root = Path(__file__).resolve().parent
sys.path.insert(0, str(server_root))

from app.main import app
from app.db import repository as db

def test_ocr_to_doctor_pipeline():
    client = TestClient(app)
    session_id = "SES-OCR-TEST-LIVE"

    # Step 1: Create intake session
    sess_res = client.post("/api/sessions/start", json={
        "patient_id": "PAT-TEST-OCR",
        "language": "hi"
    })
    assert sess_res.status_code == 201

    # Step 2: Upload a sample medical report using the real documents endpoint
    # Locate one of the sample reports in sample_reports directory
    sample_report_path = server_root.parent / "sample_reports" / "CamScanner 09-03-2026 01.07 (2)_page-0001.jpg"
    assert sample_report_path.exists(), f"Sample report not found at {sample_report_path}"

    with open(sample_report_path, "rb") as img_file:
        files = [("files", (sample_report_path.name, img_file, "image/jpeg"))]
        data = {
            "session_id": session_id,
            "sync": "true"  # Synchronous processing so OCR completes immediately
        }
        upload_res = client.post("/api/documents/process-reports", data=data, files=files)
        assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
        upload_data = upload_res.json()
        print("Upload Result:", upload_data)
        assert upload_data["status"] == "completed"
        assert upload_data["reports_processed"] >= 1

    # Step 3: Call complete session endpoint (what TokenScreen does)
    complete_res = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": "कमला देवी (Kamla Devi Test)",
        "age": 68,
        "gender": "female",
        "phone": "9811223344",
        "abha_id": "91-8821-4432-1109",
        "token_number": "#AIIA-041",
        "chief_complaint": "सीने में भारीपन व बेचैनी (Chest Discomfort)",
        "treatment_mode": "ayurveda",
        "assigned_doctor": "डॉ. अनन्या शर्मा",
        "room_number": "Room 104",
    })
    assert complete_res.status_code == 200, f"Complete failed: {complete_res.text}"
    complete_data = complete_res.json()
    print("Complete Session Result:", complete_data)
    assert complete_data["reports_attached"] >= 1

    # Step 4: Verify the OCR results endpoint called by DoctorSessionReview
    ocr_res = client.get(f"/api/documents/{session_id}/results")
    assert ocr_res.status_code == 200
    ocr_data = ocr_res.json()
    print("OCR Results Endpoint Data:", json.dumps(ocr_data, indent=2, ensure_ascii=False))

    assert ocr_data["reports_count"] >= 1
    assert "all_medications" in ocr_data
    assert len(ocr_data["all_medications"]) >= 1
    assert "all_findings" in ocr_data
    assert ocr_data["combined_summary"] is not None

    print(f"Extracted Medications Count: {len(ocr_data['all_medications'])}")
    print(f"Extracted Lab Findings Count: {len(ocr_data['all_findings'])}")

    # Step 5: Verify Physician Station Review Session endpoint
    login_res = client.post("/api/physician/login", json={
        "doctor_id": "DOC-AIIA-104",
        "pin": "1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    doc_session_res = client.get(
        f"/api/physician/session/{session_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert doc_session_res.status_code == 200
    doc_session_data = doc_session_res.json()
    assert len(doc_session_data["ocr_results"]) >= 1
    print("Doctor session review endpoint confirmed matching OCR results:", len(doc_session_data["ocr_results"]))

    print("\n*** END-TO-END OCR -> DOCTOR VIEW PIPELINE VERIFIED 100%! ***\n")

if __name__ == "__main__":
    test_ocr_to_doctor_pipeline()
