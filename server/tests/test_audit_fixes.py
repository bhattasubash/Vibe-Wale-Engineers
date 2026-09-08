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
