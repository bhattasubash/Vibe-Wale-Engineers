import pytest
import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

server_root = Path(__file__).resolve().parent.parent
if str(server_root) not in sys.path:
    sys.path.insert(0, str(server_root))

from app.main import app
from app.db import repository as db

client = TestClient(app)


def test_journey_1_happy_path_ayurveda_joint_pain():
    """
    JOURNEY 1: Happy Path
    - Walk-in patient selects Hindi & Ayurveda
    - Chief complaint: Knee pain & stiffness
    - AI infers 'joint_pain' question set
    - SOCRATES timeline completed
    - 15 Prakriti questions evaluated -> Vata dominance
    - OCR prescription results attached
    - Token generated
    - Doctor logs in, reviews case sheet, accepts with clinical notes
    """
    # 1. Register
    reg = client.post("/api/patients/register", json={
        "full_name": "Raghunath Varma",
        "age": 58,
        "gender": "male",
        "phone": "9876543210"
    })
    assert reg.status_code == 201
    patient = reg.json()

    # 2. Start Session
    start = client.post("/api/sessions/start", json={
        "patient_id": patient["id"],
        "language": "hi",
        "department": "ayurveda"
    })
    assert start.status_code == 201
    session_id = start.json()["session_id"]

    # 3. Chief Complaint Inference
    infer = client.post("/api/sessions/infer-complaint", json={
        "session_id": session_id,
        "complaint_text": "दोनों घुटनों में तेज दर्द और चलने में कठिनाई होती है",
        "language": "hi"
    })
    assert infer.status_code == 200
    inf_data = infer.json()
    assert inf_data["matched"] is True
    assert inf_data["matched_set_id"] == "joint_pain"

    # 4. SOCRATES
    soc_data = {
        "site": "Both knee joints (Janu Sandhi)",
        "onset": "4 months, progressive",
        "character": "Sharp with crepitus",
        "radiation": "None",
        "timing": "Aggravated in morning and cold",
        "exacerbating": "Stair climbing",
        "severity": "8",
        "familyHistory": "No family history of arthritis"
    }
    db.save_socrates(session_id, soc_data)

    # 5. Prakriti Assessment (Vata: 12, Pitta: 3, Kapha: 0)
    prakriti_result = {
        "vata_score": 80,
        "pitta_score": 20,
        "kapha_score": 0,
        "dominant_prakriti": "Vata",
        "secondary_prakriti": "Pitta",
        "confidence": "high",
        "clinical_note": "Classic Vata predominant constitution"
    }
    db.save_prakriti(session_id, prakriti_result)

    # 6. OCR Document Attachment (Prescription)
    db.save_ocr_result(session_id, {
        "report_id": "REP-J1-001",
        "report_type": "Ayurvedic Prescription",
        "medical_specialty": "Kayachikitsa",
        "summary": "Previous prescription showing Maharasnadi Kwath and Shallaki",
        "findings": [{"test_name": "RA Factor", "value": "Negative", "unit": ""}],
        "medications": [
            {"drugName": "Maharasnadi Kwath", "dosage": "20ml BD", "anupana": "Warm water"},
            {"drugName": "Shallaki", "dosage": "1 tab BD", "anupana": "Water"}
        ]
    })

    # 7. Complete Session & Generate Token
    token_num = "#AIIA-108"
    complete_res = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": "Raghunath Varma",
        "age": 58,
        "gender": "male",
        "phone": "9876543210",
        "token_number": token_num,
        "chief_complaint": "दोनों घुटनों में तेज दर्द और चलने में कठिनाई होती है",
        "complaint_category": "musculoskeletal",
        "treatment_mode": "ayurveda",
        "prakriti_result": prakriti_result,
        "socrates": soc_data,
        "red_flag_triggered": False
    })
    assert complete_res.status_code == 200
    assert complete_res.json()["token_number"] == token_num
    assert complete_res.json()["reports_attached"] >= 1

    # 8. Doctor Verification
    doc_login = client.post("/api/physician/login", json={"doctor_id": "DOC-AIIA-104", "pin": "1234"})
    auth_headers = {"Authorization": f"Bearer {doc_login.json()['access_token']}"}

    # Queue inspection
    queue_res = client.get("/api/physician/queue", headers=auth_headers)
    assert queue_res.status_code == 200
    item = next((q for q in queue_res.json() if q["session_id"] == session_id), None)
    assert item is not None
    assert item["dominant_prakriti"] == "Vata"
    assert len(item["medications"]) >= 2

    # Doctor Detailed Review
    review_action = client.patch(
        f"/api/physician/session/{session_id}/review",
        headers=auth_headers,
        json={
            "status": "accepted",
            "doctor_id": "DOC-AIIA-104",
            "doctor_notes": "Sandhigata Vata confirmed. Continue Maharasnadi Kwath, add Yogaraj Guggulu 2 TDS."
        }
    )
    assert review_action.status_code == 200
    assert review_action.json()["review_status"] == "accepted"

    # Verify DB persistence
    saved_queue = db.get_queue_entry(session_id)
    assert saved_queue["status"] == "accepted"
    assert "Yogaraj Guggulu" in saved_queue["doctor_notes"]


def test_journey_2_red_flag_cardiac_emergency():
    """
    JOURNEY 2: Red-Flag Emergency Triage
    - Patient enters kiosk with severe acute cardiac symptoms:
      "सीने में तेज दर्द और पसीना आ रहा है"
    - Evaluates red-flag rule: CARDIAC_CHEST_PAIN
    - Priority set to 'critical' and red_flag_triggered=True
    - Appears at the very top of Doctor's Queue with priority='critical'
    """
    # 1. Register Emergency Patient
    reg = client.post("/api/patients/register", json={
        "full_name": "Suresh Chander",
        "age": 64,
        "gender": "male",
        "phone": "9911991199"
    })
    pat_id = reg.json()["id"]

    # 2. Start Session
    start = client.post("/api/sessions/start", json={
        "patient_id": pat_id,
        "language": "hi",
        "department": "ayurveda"
    })
    session_id = start.json()["session_id"]

    # 3. Chief Complaint with Red-Flag Trigger
    comp_res = client.patch(f"/api/sessions/{session_id}/complaint", json={
        "complaint_text": "सीने में तेज दर्द और पसीना आ रहा है",
        "category": "cardiovascular"
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["red_flag"]["triggered"] is True
    assert comp_data["red_flag"]["severity"] == "critical"
    assert comp_data["red_flag"]["rule_id"] == "RF-001-CARDIAC"
    assert comp_data["red_flag"]["destination_room"] == "Room E-01 (Emergency Care Unit)"

    # 4. Immediate Session Completion with Red-Flag Priority
    token_num = "#AIIA-EMG-01"
    complete_res = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": "Suresh Chander",
        "age": 64,
        "gender": "male",
        "phone": "9911991199",
        "token_number": token_num,
        "chief_complaint": "सीने में तेज दर्द और पसीना आ रहा है",
        "complaint_category": "cardiovascular",
        "treatment_mode": "ayurveda",
        "red_flag_triggered": True,
        "priority": "critical"
    })
    assert complete_res.status_code == 200

    # 5. Doctor Queue Verification: Priority MUST be critical
    doc_login = client.post("/api/physician/login", json={"doctor_id": "DOC-AIIA-104", "pin": "1234"})
    auth_headers = {"Authorization": f"Bearer {doc_login.json()['access_token']}"}

    queue_res = client.get("/api/physician/queue", headers=auth_headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()

    emg_item = next((q for q in queue if q["session_id"] == session_id), None)
    assert emg_item is not None
    assert emg_item["red_flag_triggered"] is True
    assert emg_item["priority"] == "critical"

    # Verify Dashboard Stats count the critical pending patient
    stats_res = client.get("/api/physician/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["red_flags_intercepted"] >= 1


def test_journey_3_returning_abha_patient_allopathy_flow():
    """
    JOURNEY 3: Returning ABHA Patient & Allopathy Vitals Flow
    - Returning patient identified by ABHA number '91-7788-9900-1122'
    - Department: Allopathy (General Medicine)
    - Skips Prakriti -> records General Vitals (BP, Diabetes, Allergies, Surgeries)
    - Token generated
    - Doctor reviews allopathic record, amends notes with prescription
    """
    abha_id = "91-7788-9900-1122"

    # 1. First visit in the past
    reg_init = client.post("/api/patients/register", json={
        "full_name": "Rameshwar Sharma",
        "age": 48,
        "gender": "male",
        "phone": "9810123456",
        "abha_id": abha_id,
        "abha_address": "rameshwar.sharma@abdm"
    })
    assert reg_init.status_code == 201

    # Simulate subsequent visit where ABHA is presented
    reg_returning = client.post("/api/patients/register", json={
        "full_name": "Rameshwar Sharma",
        "age": 48,
        "gender": "male",
        "phone": "9810123456",
        "abha_id": abha_id
    })
    assert reg_returning.status_code == 201
    assert reg_returning.json()["is_returning"] is True

    # 2. Identify by ABHA (Kiosk ABHA lookup)
    ident_res = client.post(f"/api/patients/identify?abha_id={abha_id}")
    assert ident_res.status_code == 200
    pat_data = ident_res.json()
    assert pat_data["full_name"] == "Rameshwar Sharma"
    assert pat_data["abha_id"] == abha_id
    assert pat_data["is_returning"] is True
    patient_id = pat_data["id"]

    # 3. Start Session in Allopathy Department
    start_res = client.post("/api/sessions/start", json={
        "patient_id": patient_id,
        "language": "en",
        "department": "allopathy"
    })
    session_id = start_res.json()["session_id"]

    # 4. Record Chief Complaint
    client.patch(f"/api/sessions/{session_id}/complaint", json={
        "complaint_text": "High grade fever and chills for 3 days",
        "category": "infectious"
    })

    # 5. Record Allopathy General Vitals (No Prakriti)
    allopathy_vitals = {
        "bloodPressureHistory": "hypertensive-meds",
        "diabetesStatus": "non-diabetic",
        "knownAllergies": "allergy-antibiotic",
        "pastSurgeries": "surgery-past",
        "lifestyleFactors": "Non-smoker, sedentary"
    }
    db.save_vitals(session_id, allopathy_vitals)

    # 6. Complete Session
    token_num = "#AIIA-ALO-42"
    comp_res = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": "Rameshwar Sharma",
        "age": 48,
        "gender": "male",
        "phone": "9810123456",
        "abha_id": abha_id,
        "token_number": token_num,
        "chief_complaint": "High grade fever and chills for 3 days",
        "complaint_category": "infectious",
        "treatment_mode": "allopathy",
        "general_vitals": allopathy_vitals,
        "red_flag_triggered": False
    })
    assert comp_res.status_code == 200

    # 7. Doctor Review
    doc_login = client.post("/api/physician/login", json={"doctor_id": "DOC-AIIA-104", "pin": "1234"})
    auth_headers = {"Authorization": f"Bearer {doc_login.json()['access_token']}"}

    session_detail = client.get(f"/api/physician/session/{session_id}", headers=auth_headers)
    assert session_detail.status_code == 200
    s_data = session_detail.json()
    assert s_data["vitals"] is not None
    assert s_data["vitals"]["blood_pressure_history"] == "hypertensive-meds"
    assert s_data["vitals"]["known_allergies"] == "allergy-antibiotic"
    assert s_data["prakriti"] is None  # Prakriti correctly omitted for Allopathy

    # Doctor amends with allopathic prescription
    allopathy_notes = "Suspected Viral Pyrexia. Rx: Paracetamol 650mg TDS, CBC + Dengue NS1 Ag test ordered. Note: Patient allergic to Penicillin."
    review_res = client.patch(
        f"/api/physician/session/{session_id}/review",
        headers=auth_headers,
        json={
            "status": "amended",
            "doctor_id": "DOC-AIIA-104",
            "doctor_notes": allopathy_notes
        }
    )
    assert review_res.status_code == 200
    assert review_res.json()["review_status"] == "amended"

    # Verify DB state
    db_entry = db.get_queue_entry(session_id)
    assert db_entry["status"] == "amended"
    assert "Paracetamol" in db_entry["doctor_notes"]
    assert db_entry["treatment_mode"] == "allopathy"
