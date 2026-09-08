import os
import pytest
from app.services.whisprflow_service import WhisprFlowService
from app.models.schemas import DoctorQueueItem

def test_whisprflow_service_urls_and_keys(monkeypatch):
    service = WhisprFlowService()
    
    # 1. Unconfigured state
    monkeypatch.delenv("WISPRFLOW_API_KEY", raising=False)
    monkeypatch.delenv("WISPRFLOW_CLIENT_KEY", raising=False)
    assert not service.is_configured()
    assert service.get_ws_url() == ""

    # 2. Configured with WISPRFLOW_CLIENT_KEY
    monkeypatch.setenv("WISPRFLOW_CLIENT_KEY", "test_client_key_123")
    assert service.is_configured()
    assert service.get_api_key() == "test_client_key_123"
    assert service.get_ws_url() == "wss://platform-api.wisprflow.ai/api/v1/dash/client_ws?client_key=Bearer%20test_client_key_123"

    # 3. Configured with Bearer prefix in key
    monkeypatch.setenv("WISPRFLOW_CLIENT_KEY", "Bearer secret_bearer_token")
    assert service.get_api_key() == "secret_bearer_token"
    assert service.get_ws_url() == "wss://platform-api.wisprflow.ai/api/v1/dash/client_ws?client_key=Bearer%20secret_bearer_token"

def test_doctor_queue_item_allopathy_fields():
    item = DoctorQueueItem(
        session_id="SES-TEST-ALLO",
        patient_name="John Doe",
        age=30,
        gender="male",
        phone="9876543210",
        token_number="#AIIA-G101",
        chief_complaint="Chest congestion and mild fever",
        complaint_category="allopathy",
        dominant_prakriti="Allopathy",
        treatment_mode="allopathy",
        red_flag_triggered=False,
        priority="normal",
        assigned_doctor="Dr. Ananya Sharma",
        room_number="Room 205",
        created_at="10:00 AM",
        general_vitals={
            "bloodPressureHistory": "normal-bp",
            "diabetesStatus": "non-diabetic",
            "knownAllergies": "allergy-none",
            "pastSurgeries": "no-surgery",
        },
        socrates={
            "site": "Chest",
            "onset": "2 days",
            "severity": "5/10",
        },
        documents=[
            {
                "id": "DOC-1",
                "name": "Prescription #1",
                "url": "data:image/jpeg;base64,sampledata",
                "type": "Prescription",
            }
        ],
    )
    assert item.treatment_mode == "allopathy"
    assert item.general_vitals["bloodPressureHistory"] == "normal-bp"
    assert len(item.documents) == 1
    assert item.documents[0]["url"].startswith("data:image/jpeg;base64")


def test_fhir_r4_bundle_serializer():
    from app.services.fhir_serializer import generate_fhir_r4_bundle

    bundle = generate_fhir_r4_bundle(
        session_id="SES-FHIR-TEST-001",
        patient_data={
            "id": "PAT-101",
            "full_name": "Ramesh Chandra",
            "age": 52,
            "gender": "male",
            "phone": "9810012345",
            "abha_id": "14-1234-5678-9012",
            "abha_address": "ramesh@abdm",
        },
        session_data={
            "session_id": "SES-FHIR-TEST-001",
            "chief_complaint": "Severe joint pain and morning stiffness",
            "complaint_category": "joint_pain",
            "department": "ayurveda",
            "created_at": "2026-09-08T10:00:00Z",
        },
        socrates_data={
            "site": "Both knee joints",
            "onset": "6 months",
            "character": "Aching and burning sensation",
            "severity": "7/10",
        },
        vitals_data={
            "blood_pressure_history": "hypertensive-meds",
            "diabetes_status": "diabetic-meds",
            "known_allergies": "allergy-none",
            "past_surgeries": "no-surgery",
        },
        prakriti_data={
            "dominant_prakriti": "Vata-Pitta",
            "secondary_prakriti": "Pitta",
            "vata_score": 55,
            "pitta_score": 30,
            "kapha_score": 15,
            "confidence": "high",
        },
        ocr_reports=[
            {
                "report_id": "DOC-101",
                "report_type": "Prescription",
                "facility_name": "AIIMS OPD",
                "medications": [
                    {"drugName": "Yograj Guggulu", "dosage": "2 tablets", "frequency": "BD"},
                    {"drugName": "Ashwagandha Churna", "dosage": "3g", "frequency": "OD"},
                ],
            }
        ],
    )

    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "document"
    assert bundle["id"] == "bundle-SES-FHIR-TEST-001"
    assert len(bundle["entry"]) >= 5

    # Check composition
    comp = bundle["entry"][0]["resource"]
    assert comp["resourceType"] == "Composition"
    assert "AIIA" in comp["title"]

    # Check Patient
    pat = bundle["entry"][1]["resource"]
    assert pat["resourceType"] == "Patient"
    assert pat["name"][0]["text"] == "Ramesh Chandra"
    assert any(ident.get("value") == "14-1234-5678-9012" for ident in pat.get("identifier", []))

    # Check Encounter
    enc = bundle["entry"][2]["resource"]
    assert enc["resourceType"] == "Encounter"
    assert enc["status"] == "finished"

    # Check Condition
    cond = bundle["entry"][3]["resource"]
    assert cond["resourceType"] == "Condition"
    assert cond["clinicalStatus"]["coding"][0]["code"] == "active"

    # Verify Prakriti Observation exists
    prakriti_obs = next((e["resource"] for e in bundle["entry"] if e["resource"]["resourceType"] == "Observation" and "PRAKRITI" in str(e["resource"].get("code", {}))), None)
    assert prakriti_obs is not None
    assert any(c["valueQuantity"]["value"] == 55 for c in prakriti_obs.get("component", []))

    # Verify MedicationStatement exists
    meds = [e["resource"] for e in bundle["entry"] if e["resource"]["resourceType"] == "MedicationStatement"]
    assert len(meds) == 2
    assert meds[0]["medicationCodeableConcept"]["text"] == "Yograj Guggulu"


def test_fhir_and_his_endpoints_client():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.db import repository as db

    client = TestClient(app)

    # 1. Seed test session and queue
    test_sid = "SES-FHIR-E2E-TEST"
    db.create_session({
        "session_id": test_sid,
        "chief_complaint": "Chronic indigestion and acidity",
        "complaint_category": "acidity",
        "department": "ayurveda",
        "status": "completed",
    })
    db.save_socrates(test_sid, {"onset": "2 months", "severity": "6/10"})
    db.save_prakriti(test_sid, {
        "dominant_prakriti": "Pitta-Vata",
        "vata_score": 35,
        "pitta_score": 50,
        "kapha_score": 15,
        "confidence": "high",
    })

    # 2. Test GET /api/sessions/{session_id}/fhir-bundle
    res = client.get(f"/api/sessions/{test_sid}/fhir-bundle")
    assert res.status_code == 200
    bundle = res.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "document"
    assert bundle["id"] == f"bundle-{test_sid}"

    # 3. Test POST /api/sessions/{session_id}/push-his
    push_res = client.post(f"/api/sessions/{test_sid}/push-his")
    assert push_res.status_code == 200
    ack = push_res.json()
    assert ack["status"] == "success"
    assert ack["fhir_bundle_id"] == f"bundle-{test_sid}"
    assert ack["gateway_response"]["ack_code"] == "AA"

