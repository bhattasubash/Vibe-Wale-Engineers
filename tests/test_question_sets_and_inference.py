import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.complaint_inference_service import complaint_inference_service


@pytest.fixture
def client():
    return TestClient(app)


def test_question_sets_loaded():
    """Verify that backend question sets directory is scanned and loaded properly."""
    sets = complaint_inference_service.load_all_question_sets()
    assert len(sets) >= 4
    assert "joint_pain" in sets
    assert "digestive_acidity" in sets
    assert "respiratory_cough" in sets
    assert "skin_dermatology" in sets

    # Verify joint_pain schema
    jp = sets["joint_pain"]
    assert jp["id"] == "joint_pain"
    assert "title" in jp
    assert "questions" in jp
    assert len(jp["questions"]) > 0
    assert "options" in jp["questions"][0]


def test_infer_complaint_matching_question_set():
    """Verify Gemini matches a joint pain complaint to joint_pain question set."""
    complaint = "मुझे पिछले दो महीने से दोनों घुटनों और कमर में बहुत तेज दर्द है"
    res = complaint_inference_service.infer_complaint(complaint, language="hi")

    assert res.matched is True
    assert res.matched_set_id == "joint_pain"
    assert res.source == "question_set"
    assert len(res.questions) >= 4
    # Touch options exist on each question
    for q in res.questions:
        assert len(q.options) >= 2
        assert q.titleHindi != ""


def test_infer_complaint_unmatched_general_questions():
    """Verify Gemini generates general questions when complaint does not match registered sets."""
    # A completely unrelated symptom not in joint, digestive, cough, or skin
    complaint = "जब मैं तेज़ रोशनी देखता हूँ तो आँखों के सामने अजीब से तारे दिखाई देते हैं"
    res = complaint_inference_service.infer_complaint(complaint, language="hi")

    assert res.matched is False
    assert res.matched_set_id is None
    assert res.source == "gemini_general"
    assert len(res.questions) >= 3
    # Verify each general question has touch options
    for q in res.questions:
        assert len(q.options) >= 2


def test_api_infer_complaint_endpoint(client):
    """Test POST /api/sessions/infer-complaint FastAPI route."""
    payload = {
      "complaint_text": "Severe acidity, heartburn and sour belching after meals",
      "language": "en"
    }
    response = client.post("/api/sessions/infer-complaint", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["matched"] is True
    assert data["matched_set_id"] == "digestive_acidity"
    assert data["source"] == "question_set"
    assert len(data["questions"]) >= 3


def test_api_transcribe_endpoint(client):
    """Test POST /api/sessions/transcribe route handles unconfigured or mock audio gracefully."""
    payload = {
        "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        "properties": {}
    }
    response = client.post("/api/sessions/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "text" in data
