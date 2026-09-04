# -*- coding: utf-8 -*-
"""
Tests for AYUSH-Care Adaptive Question Sets & Voice Inference Service.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.complaint_inference_service import complaint_inference_service


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
    assert len(jp["questions"]) >= 4
    assert "options" in jp["questions"][0]
    assert len(jp["questions"][0]["options"]) >= 3


def test_infer_complaint_matching_joint_pain():
    """Verify inference matches a Hindi joint pain complaint to joint_pain set."""
    complaint = "मुझे पिछले दो महीने से दोनों घुटनों में बहुत तेज दर्द और जकड़न है"
    res = complaint_inference_service.infer_complaint(complaint, language="hi")

    assert res.matched is True
    assert res.matched_set_id == "joint_pain"
    assert res.source in ("question_set", "gemini_general")
    assert len(res.questions) >= 4
    for q in res.questions:
        assert len(q.options) >= 2
        assert q.titleHindi != ""
        assert q.titleEnglish != ""


def test_infer_complaint_matching_digestive_acidity():
    """Verify inference matches an English acidity complaint to digestive_acidity set."""
    complaint = "Severe acidity, heartburn and gas bloating after meals"
    res = complaint_inference_service.infer_complaint(complaint, language="en")

    assert res.matched is True
    assert res.matched_set_id == "digestive_acidity"
    assert len(res.questions) >= 4


def test_infer_complaint_unmatched_general_questions():
    """Verify fallback general questions are returned when complaint does not match registered sets."""
    complaint = "मुझे बहुत अजीब सी घबराहट और उलझन महसूस हो रही है"
    res = complaint_inference_service.infer_complaint(complaint, language="hi")

    assert len(res.questions) >= 3
    for q in res.questions:
        assert len(q.options) >= 2
        assert q.titleHindi != ""


def test_api_infer_complaint_endpoint(client):
    """Test POST /api/sessions/infer-complaint FastAPI route."""
    payload = {
        "complaint_text": "Severe acidity, heartburn and sour belching after eating spicy food",
        "language": "en"
    }
    response = client.post("/api/sessions/infer-complaint", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["matched"] is True
    assert data["matched_set_id"] == "digestive_acidity"
    assert len(data["questions"]) >= 4
    assert "session_id" in data


def test_api_transcribe_endpoint_graceful_handling(client):
    """Test POST /api/sessions/transcribe handles unconfigured API key or dummy audio gracefully."""
    # 1-second 16kHz mono WAV base64 header
    dummy_wav_base64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
    payload = {
        "audio_base64": dummy_wav_base64,
        "properties": {}
    }
    response = client.post("/api/sessions/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "text" in data
