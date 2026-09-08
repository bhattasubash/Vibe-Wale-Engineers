import pytest
import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure server root is in sys.path
server_root = Path(__file__).resolve().parent.parent
if str(server_root) not in sys.path:
    sys.path.insert(0, str(server_root))

from app.main import app
from app.db import repository as db

client = TestClient(app)


def test_end_to_end_cross_router_flow():
    """
    Validates complete lifecycle from Patient Registration -> Kiosk Flow ->
    Token Generation -> Doctor Queue -> Doctor EMR Review -> Database State.
    """
    # 1. Register Patient
    reg_res = client.post("/api/patients/register", json={
        "full_name": "Devi Prasad Sharma",
        "age": 62,
        "gender": "male",
        "phone": "9811223344",
        "abha_id": "91-4455-6677-8899"
    })
    assert reg_res.status_code == 201
    patient = reg_res.json()
    patient_id = patient["id"]
    assert patient["full_name"] == "Devi Prasad Sharma"

    # 2. Start Kiosk Session
    start_res = client.post("/api/sessions/start", json={
        "patient_id": patient_id,
        "language": "hi",
        "department": "ayurveda"
    })
    assert start_res.status_code == 201
    session_data = start_res.json()
    session_id = session_data["session_id"]
    assert session_data["status"] == "in_progress"

    # 3. Infer & Record Chief Complaint
    infer_res = client.post("/api/sessions/infer-complaint", json={
        "session_id": session_id,
        "complaint_text": "घुटनों में तेज दर्द और सुबह अकड़न होती है",
        "language": "hi"
    })
    assert infer_res.status_code == 200
    infer_json = infer_res.json()
    assert infer_json["matched"] is True
    assert infer_json["matched_set_id"] == "joint_pain"
    assert len(infer_json["questions"]) > 0

    # Also test PATCH complaint
    complaint_res = client.patch(f"/api/sessions/{session_id}/complaint", json={
        "complaint_text": "घुटनों में तेज दर्द और सुबह अकड़न होती है",
        "category": "musculoskeletal"
    })
    assert complaint_res.status_code == 200
    assert complaint_res.json()["recorded_complaint"] == "घुटनों में तेज दर्द और सुबह अकड़न होती है"

    # 4. Submit SOCRATES Timeline
    socrates_payload = {
        "site": "Both knee joints",
        "onset": "6 months, gradual worsening in cold weather",
        "character": "Dull aching pain with cracking sounds",
        "radiation": "None, localized to joints",
        "timing": "Severe stiffness upon waking in morning",
        "exacerbating": "Aggravated by stairs, relieved slightly by warmth",
        "severity": "7",
        "familyHistory": "Mother had severe osteoarthritis"
    }
    db.save_socrates(session_id, socrates_payload)
    db_soc = db.get_socrates(session_id)
    assert db_soc is not None
    assert db_soc["site"] == "Both knee joints"

    # 5. Submit Prakriti Assessment (Vata dominance)
    prakriti_answers = [
        {"question_id": f"q_{i}", "dosha_tag": "vata", "points": 1}
        for i in range(12)
    ] + [
        {"question_id": f"q_{i}", "dosha_tag": "pitta", "points": 1}
        for i in range(12, 15)
    ]
    prakriti_data = {
        "answers": prakriti_answers,
        "vata_score": 75,
        "pitta_score": 25,
        "kapha_score": 0,
        "dominant_prakriti": "Vata",
        "secondary_prakriti": "Pitta",
        "confidence": "high",
        "clinical_note": "High Vata predominance with Sandhigata Vata symptoms"
    }
    db.save_prakriti(session_id, prakriti_data)
    db_prak = db.get_prakriti(session_id)
    assert db_prak["dominant_prakriti"] == "Vata"

    # 6. Complete Session Intake via POST /{session_id}/complete
    comp_session_res = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": "Devi Prasad Sharma",
        "age": 62,
        "gender": "male",
        "phone": "9811223344",
        "abha_id": "91-4455-6677-8899",
        "token_number": "#AIIA-101",
        "chief_complaint": "घुटनों में तेज दर्द और सुबह अकड़न होती है",
        "complaint_category": "musculoskeletal",
        "treatment_mode": "ayurveda",
        "prakriti_result": prakriti_data,
        "socrates": socrates_payload,
        "red_flag_triggered": False
    })
    assert comp_session_res.status_code == 200
    complete_json = comp_session_res.json()
    assert complete_json["token_number"] == "#AIIA-101"
    assert complete_json["status"] == "completed"

    # 7. Doctor Login -> Obtain JWT Token
    login_res = client.post("/api/physician/login", json={
        "doctor_id": "DOC-AIIA-104",
        "pin": "1234"
    })
    assert login_res.status_code == 200
    auth_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}

    # 8. Doctor Queue -> Verify Patient Enqueued
    queue_res = client.get("/api/physician/queue", headers=headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()
    enqueued_item = next((q for q in queue if q["session_id"] == session_id), None)
    assert enqueued_item is not None, f"Session {session_id} not found in doctor queue!"
    assert enqueued_item["patient_name"] == "Devi Prasad Sharma"
    assert enqueued_item["token_number"] == "#AIIA-101"
    assert enqueued_item["dominant_prakriti"] == "Vata"

    # 9. Doctor Session Detailed Inspection
    doc_session_res = client.get(f"/api/physician/session/{session_id}", headers=headers)
    assert doc_session_res.status_code == 200
    doc_session_data = doc_session_res.json()
    assert "queue_entry" in doc_session_data
    q_entry = doc_session_data["queue_entry"]
    assert q_entry["chief_complaint"] == "घुटनों में तेज दर्द और सुबह अकड़न होती है"
    assert q_entry["vata_score"] == 75

    # 10. Doctor Review Action (Accept with Clinical Notes)
    review_notes = "Diagnosed as Sandhigata Vata. Prescribed Maharasnadi Kwath 20ml BD with warm water, Janu Basti planned."
    review_res = client.patch(
        f"/api/physician/session/{session_id}/review",
        headers=headers,
        json={
            "status": "accepted",
            "doctor_notes": review_notes,
            "doctor_id": "DOC-AIIA-104"
        }
    )
    assert review_res.status_code == 200
    review_json = review_res.json()
    assert review_json["review_status"] == "accepted"

    # 11. Verify Database State matches the updated record
    q_updated = db.get_queue_entry(session_id)
    assert q_updated is not None
    assert q_updated["status"] == "accepted"
    assert q_updated["doctor_notes"] == review_notes


def test_parallel_session_isolation():
    """
    Validates that two distinct concurrent sessions remain strictly isolated:
    No cross-contamination of chief complaints, vitals, or Prakriti scores.
    """
    # Patient 1: Ayurveda Joint Pain
    res_a = client.post("/api/patients/register", json={
        "full_name": "Session A Ayurveda",
        "age": 55,
        "gender": "female",
        "phone": "9000000001",
        "abha_id": "91-1111-0000-0001"
    })
    pat_a_id = res_a.json()["id"]

    # Patient 2: Allopathy General Medicine
    res_b = client.post("/api/patients/register", json={
        "full_name": "Session B Allopathy",
        "age": 32,
        "gender": "male",
        "phone": "9000000002",
        "abha_id": "91-2222-0000-0002"
    })
    pat_b_id = res_b.json()["id"]

    # Interleaved Start
    sess_a_res = client.post("/api/sessions/start", json={"patient_id": pat_a_id, "language": "hi", "department": "ayurveda"})
    sess_b_res = client.post("/api/sessions/start", json={"patient_id": pat_b_id, "language": "en", "department": "allopathy"})
    sess_a_id = sess_a_res.json()["session_id"]
    sess_b_id = sess_b_res.json()["session_id"]
    assert sess_a_id != sess_b_id

    # Submit Complaints
    client.patch(f"/api/sessions/{sess_a_id}/complaint", json={"complaint_text": "Knee pain", "category": "musculoskeletal"})
    client.patch(f"/api/sessions/{sess_b_id}/complaint", json={"complaint_text": "Mild fever and cough", "category": "respiratory"})

    # Submit Socrates
    db.save_socrates(sess_a_id, {"site": "Knee", "severity": "6"})
    db.save_socrates(sess_b_id, {"site": "Throat", "severity": "3"})

    # Session A submits Prakriti (Ayurveda)
    prak_a_data = {
        "answers": [{"question_id": "q1", "dosha_tag": "pitta", "points": 15}],
        "vata_score": 10,
        "pitta_score": 80,
        "kapha_score": 10,
        "dominant_prakriti": "Pitta",
    }
    db.save_prakriti(sess_a_id, prak_a_data)

    # Session B saves general vitals (Allopathy)
    vitals_b_data = {
        "bloodPressureHistory": "normal-bp",
        "diabetesStatus": "non-diabetic",
        "knownAllergies": "allergy-none",
        "pastSurgeries": "surgery-none"
    }
    db.save_vitals(sess_b_id, vitals_b_data)

    # Complete both
    res_comp_a = client.post(f"/api/sessions/{sess_a_id}/complete", json={
        "patient_name": "Session A Ayurveda",
        "age": 55,
        "gender": "female",
        "chief_complaint": "Knee pain",
        "token_number": "#AIIA-A01",
        "treatment_mode": "ayurveda",
        "prakriti_result": prak_a_data,
    })
    res_comp_b = client.post(f"/api/sessions/{sess_b_id}/complete", json={
        "patient_name": "Session B Allopathy",
        "age": 32,
        "gender": "male",
        "chief_complaint": "Mild fever and cough",
        "token_number": "#AIIA-B02",
        "treatment_mode": "allopathy",
        "general_vitals": vitals_b_data,
    })
    assert res_comp_a.status_code == 200
    assert res_comp_b.status_code == 200

    token_a = res_comp_a.json()["token_number"]
    token_b = res_comp_b.json()["token_number"]
    assert token_a != token_b

    # Verify Isolation in DB
    db_a = db.get_session(sess_a_id)
    db_b = db.get_session(sess_b_id)
    assert db_a["chief_complaint"] == "Knee pain"
    assert db_b["chief_complaint"] == "Mild fever and cough"

    soc_a = db.get_socrates(sess_a_id)
    soc_b = db.get_socrates(sess_b_id)
    assert soc_a["site"] == "Knee"
    assert soc_b["site"] == "Throat"

    prak_a = db.get_prakriti(sess_a_id)
    prak_b = db.get_prakriti(sess_b_id)
    assert prak_a is not None and prak_a["dominant_prakriti"] == "Pitta"
    assert prak_b is None  # Session B has NO Prakriti record!

    vitals_a = db.get_vitals(sess_a_id)
    vitals_b = db.get_vitals(sess_b_id)
    assert vitals_a is None  # Session A has NO Vitals record!
    assert vitals_b is not None
    assert vitals_b["blood_pressure_history"] == "normal-bp"


def test_invalid_and_stale_session_transitions():
    """
    Validates system security and error handling when invalid or malformed
    session identifiers and unauthorized doctor requests are attempted.
    """
    non_existent = "SES-DOES-NOT-EXIST-9999"

    # Fetching non-existent session from doctor API -> 404
    login_res = client.post("/api/physician/login", json={
        "doctor_id": "DOC-AIIA-104",
        "pin": "1234"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_get = client.get(f"/api/physician/session/{non_existent}", headers=headers)
    assert res_get.status_code == 404

    # Patching review for non-existent session -> 404
    res_rev = client.patch(
        f"/api/physician/session/{non_existent}/review",
        headers=headers,
        json={"status": "accepted", "doctor_id": "DOC-AIIA-104", "doctor_notes": "Fake session notes"}
    )
    assert res_rev.status_code == 404

    # Unauthorized Doctor Review (no token) -> 401
    res_unauth = client.patch(f"/api/physician/session/{non_existent}/review", json={
        "status": "accepted",
        "doctor_id": "DOC-AIIA-104",
        "doctor_notes": "Attempting unauthorized note update"
    })
    assert res_unauth.status_code in (401, 403)

    # Unauthorized Doctor Review (tampered token) -> 401
    res_tampered = client.patch(
        f"/api/physician/session/{non_existent}/review",
        headers={"Authorization": "Bearer fake.jwt.token"},
        json={"status": "accepted", "doctor_id": "DOC-AIIA-104", "doctor_notes": "Fake token note"}
    )
    assert res_tampered.status_code in (401, 403)
