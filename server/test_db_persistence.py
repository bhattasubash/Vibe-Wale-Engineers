import os
import sys
from pathlib import Path

# Ensure server root is on path
server_root = Path(__file__).resolve().parent
sys.path.insert(0, str(server_root))

from app.db.connection import get_db_connection, init_database, get_db_status
from app.db import repository as db
from app.main import app
from fastapi.testclient import TestClient

def test_persistence():
    print("Testing DB status...")
    status = get_db_status()
    print("DB Status:", status)
    assert status["active_ping"] is True, "Database active ping failed!"

    # 1. Test Direct Repository CRUD
    test_patient = {
        "id": "PAT-TEST-001",
        "full_name": "Test Patient Persistent",
        "age": 45,
        "gender": "female",
        "phone": "9998887776",
        "abha_id": "91-9999-8888-7777",
        "abha_address": "test.patient@abdm",
        "aadhaar_hash": "testhash123",
        "is_returning": False,
        "last_visit_date": None,
    }
    saved_patient = db.save_patient(test_patient)
    print("Saved patient:", saved_patient["id"])

    # Simulate restart by reading from clean connection
    retrieved_patient = db.find_patient_by_abha("91-9999-8888-7777")
    assert retrieved_patient is not None, "Patient not found by ABHA!"
    assert retrieved_patient["full_name"] == "Test Patient Persistent"
    print("Retrieved patient from DB successfully:", retrieved_patient["full_name"])

    # 2. Test Session creation & update
    session_data = {
        "session_id": "SES-TEST-001",
        "patient_id": retrieved_patient["id"],
        "language": "hi",
        "department": "ayurveda",
        "chief_complaint": "Joint stiffness in morning",
        "complaint_category": "musculoskeletal",
        "red_flag_triggered": False,
    }
    db.create_session(session_data)
    
    # Save Socrates responses
    db.save_socrates("SES-TEST-001", {
        "site": "Both knees",
        "onset": "3 months",
        "severity": "6",
        "timing": "Morning",
    })

    # Save Prakriti
    db.save_prakriti("SES-TEST-001", {
        "answers": [{"dosha_tag": "vata", "points": 1}],
        "vata_score": 60,
        "pitta_score": 25,
        "kapha_score": 15,
        "dominant_prakriti": "Vata",
        "confidence": "high",
        "clinical_note": "High Vata predominance"
    })

    # Save OCR Result
    db.save_ocr_result("SES-TEST-001", {
        "report_id": "rep_01",
        "report_type": "Prescription",
        "medical_specialty": "Kayachikitsa",
        "summary": "Sandhigata Vata prescription",
        "findings": [{"test_name": "ESR", "value": "24", "unit": "mm/hr"}],
        "medications": [{"drugName": "Yogaraj Guggulu", "dosage": "2 Tab"}],
    })

    # Save Queue Entry
    db.save_queue_entry({
        "session_id": "SES-TEST-001",
        "patient_name": "Test Patient Persistent",
        "age": 45,
        "gender": "female",
        "token_number": "#AIIA-TEST",
        "chief_complaint": "Joint stiffness in morning",
        "dominant_prakriti": "Vata",
        "priority": "normal",
        "assigned_doctor": "Dr. Sharma",
        "room_number": "104",
    })

    # Check that reading again returns all persisted records
    ret_session = db.get_session("SES-TEST-001")
    assert ret_session is not None
    assert ret_session["chief_complaint"] == "Joint stiffness in morning"

    ret_socrates = db.get_socrates("SES-TEST-001")
    assert ret_socrates is not None
    assert ret_socrates["site"] == "Both knees"

    ret_prakriti = db.get_prakriti("SES-TEST-001")
    assert ret_prakriti is not None
    assert ret_prakriti["vata_score"] == 60

    ret_ocr = db.get_ocr_results("SES-TEST-001")
    assert len(ret_ocr) >= 1
    assert ret_ocr[0]["findings"][0]["test_name"] == "ESR"

    queue = db.get_queue_entries()
    assert any(q["session_id"] == "SES-TEST-001" for q in queue)
    print("Direct repository persistence tests passed!")

    # 3. Test End-to-End API via TestClient
    client = TestClient(app)
    
    # Check health endpoint
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    print("Health check response:", health_res.json())

    # Check register patient endpoint
    reg_res = client.post("/api/patients/register", json={
        "full_name": "API Patient Persistence",
        "age": 50,
        "gender": "male",
        "phone": "9123456780",
        "abha_id": "91-1111-2222-3333"
    })
    assert reg_res.status_code == 201
    api_patient = reg_res.json()
    print("API Register successful:", api_patient["id"])

    # Identify by ABHA
    ident_res = client.post("/api/patients/identify?abha_id=91-1111-2222-3333")
    assert ident_res.status_code == 200
    assert ident_res.json()["full_name"] == "API Patient Persistence"
    print("API Identify successful:", ident_res.json()["id"])

    # Start session
    sess_res = client.post("/api/sessions/start", json={
        "patient_id": api_patient["id"],
        "language": "hi"
    })
    assert sess_res.status_code == 201
    session_id = sess_res.json()["session_id"]
    print("API Session created:", session_id)

    # Patch complaint
    comp_res = client.patch(f"/api/sessions/{session_id}/complaint", json={
        "complaint_text": "Severe acidity and burning sensation in stomach",
        "category": "digestive"
    })
    assert comp_res.status_code == 200
    print("API Complaint patched")

    # Doctor login
    login_res = client.post("/api/physician/login", json={
        "doctor_id": "DOC-AIIA-104",
        "pin": "1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch queue
    queue_res = client.get("/api/physician/queue", headers=headers)
    assert queue_res.status_code == 200
    print("Doctor queue fetched, count:", len(queue_res.json()))

    # Fetch stats
    stats_res = client.get("/api/physician/stats", headers=headers)
    assert stats_res.status_code == 200
    print("Doctor stats:", stats_res.json())

    # Get OCR results endpoint
    ocr_get_res = client.get(f"/api/documents/SES-TEST-001/results")
    assert ocr_get_res.status_code == 200
    assert ocr_get_res.json()["reports_count"] >= 1
    print("OCR Results endpoint verified successfully:", ocr_get_res.json()["reports_count"])

    print("\nALL PERSISTENCE AND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_persistence()
