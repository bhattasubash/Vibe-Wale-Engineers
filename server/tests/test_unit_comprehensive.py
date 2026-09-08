import pytest
import os
import sys
import time
from pathlib import Path

# Ensure server root is on path
server_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(server_root))

from app.services.auth import (
    authenticate_physician,
    create_access_token,
    verify_token,
    require_physician_auth,
    PHYSICIAN_REGISTRY,
)
from app.services.scoring import calculate_prakriti_scores
from app.services.red_flags import evaluate_red_flags, is_negated
from app.services.complaint_inference_service import complaint_inference_service
from app.services.ocr_verification import ocr_verifier, OCRVerificationService
from app.utils.file_validation import sanitize_filename
from app.utils.aliases import are_values_consistent, get_aliases_for_test, normalize_numeric_string
from app.models.schemas import VerificationStatus
from fastapi import HTTPException


# ====================================================================
# 1. AUTH SERVICE TESTS (Normal, Invalid, Malformed, Tampered)
# ====================================================================

def test_auth_valid_credentials():
    """Verify known doctor accounts authenticate successfully."""
    doc1 = authenticate_physician("DOC-AIIA-104", "1234")
    assert doc1 is not None
    assert doc1["doctor_id"] == "DOC-AIIA-104"
    assert doc1["role"] == "physician"

    doc2 = authenticate_physician("DOC-AIIA-205", "1234")
    assert doc2 is not None
    assert doc2["doctor_id"] == "DOC-AIIA-205"


def test_auth_invalid_and_malformed_credentials():
    """Verify wrong PIN, unknown doctor ID, empty strings, and injections return None."""
    # Wrong PIN
    assert authenticate_physician("DOC-AIIA-104", "wrong_pin") is None
    assert authenticate_physician("DOC-AIIA-104", "0000") is None
    assert authenticate_physician("DOC-AIIA-104", "") is None

    # Unknown doctor ID
    assert authenticate_physician("DOC-FAKE-999", "1234") is None
    assert authenticate_physician("", "1234") is None

    # Injection / malformed attempts
    assert authenticate_physician("' OR '1'='1", "1234") is None
    assert authenticate_physician("DOC-AIIA-104", "' OR '1'='1") is None
    assert authenticate_physician(None or "", None or "") is None


def test_jwt_lifecycle_tampering_and_expiry():
    """Verify JWT creation, valid verification, signature tampering, and expiration."""
    payload = {"sub": "DOC-AIIA-104", "role": "physician", "dept": "ayurveda"}
    token = create_access_token(payload, expires_in=3600)
    assert token is not None
    assert len(token.split(".")) == 3

    # Valid token verification
    claims = verify_token(token)
    assert claims["sub"] == "DOC-AIIA-104"
    assert claims["role"] == "physician"

    # Tampered signature
    parts = token.split(".")
    tampered_sig = parts[2][:-4] + "XXXX"
    tampered_token = f"{parts[0]}.{parts[1]}.{tampered_sig}"
    with pytest.raises(HTTPException) as exc:
        verify_token(tampered_token)
    assert exc.value.status_code == 401
    assert "signature" in exc.value.detail.lower()

    # Tampered payload (claims altered)
    fake_claims = parts[1][:-4] + "AAAA"
    tampered_body = f"{parts[0]}.{fake_claims}.{parts[2]}"
    with pytest.raises(HTTPException) as exc:
        verify_token(tampered_body)
    assert exc.value.status_code == 401

    # Malformed token structure (not 3 parts)
    with pytest.raises(HTTPException) as exc:
        verify_token("not-a-jwt-token")
    assert exc.value.status_code == 401

    with pytest.raises(HTTPException) as exc:
        verify_token("")
    assert exc.value.status_code == 401

    # Expired token (expires_in = -10 seconds)
    expired_token = create_access_token(payload, expires_in=-10)
    with pytest.raises(HTTPException) as exc:
        verify_token(expired_token)
    assert exc.value.status_code == 401
    assert "expired" in exc.value.detail.lower()


# ====================================================================
# 2. PRAKRITI SCORING TESTS (Normal, Boundary, Empty, Malformed)
# ====================================================================

def test_prakriti_all_pitta_and_all_kapha():
    """Test 100% Pitta and 100% Kapha single dosha extremes."""
    # 15 Pitta
    answers_pitta = [{"dosha_tag": "pitta", "points": 1} for _ in range(15)]
    res_p = calculate_prakriti_scores(answers_pitta)
    assert res_p.scores.pitta == 15
    assert res_p.percentages["pitta"] == 100
    assert "Predominantly Pitta" in res_p.dominant_prakriti
    assert res_p.confidence == "high"

    # 15 Kapha
    answers_kapha = [{"dosha_tag": "kapha", "points": 1} for _ in range(15)]
    res_k = calculate_prakriti_scores(answers_kapha)
    assert res_k.scores.kapha == 15
    assert res_k.percentages["kapha"] == 100
    assert "Predominantly Kapha" in res_k.dominant_prakriti
    assert res_k.confidence == "high"


def test_prakriti_boundary_gaps():
    """Test boundary gap values: gap=5 (high), gap=4 (medium), gap=3 (medium), gap=2 (low/Sama)."""
    # Gap = 5: Vata=9, Pitta=4, Kapha=2 -> gap=5 -> Predominantly Vata, High
    ans_gap5 = (
        [{"dosha_tag": "vata", "points": 1} for _ in range(9)]
        + [{"dosha_tag": "pitta", "points": 1} for _ in range(4)]
        + [{"dosha_tag": "kapha", "points": 1} for _ in range(2)]
    )
    r5 = calculate_prakriti_scores(ans_gap5)
    assert r5.dominance_gap == 5
    assert r5.confidence == "high"
    assert "Predominantly Vata" in r5.dominant_prakriti

    # Gap = 4: Vata=8, Pitta=4, Kapha=3 -> gap=4 -> Vata-Pitta, Medium
    ans_gap4 = (
        [{"dosha_tag": "vata", "points": 1} for _ in range(8)]
        + [{"dosha_tag": "pitta", "points": 1} for _ in range(4)]
        + [{"dosha_tag": "kapha", "points": 1} for _ in range(3)]
    )
    r4 = calculate_prakriti_scores(ans_gap4)
    assert r4.dominance_gap == 4
    assert r4.confidence == "medium"
    assert "Vata-Pitta" in r4.dominant_prakriti

    # Gap = 2: Vata=6, Pitta=5, Kapha=4 -> gap=1 -> SAMA, Low
    ans_gap2 = (
        [{"dosha_tag": "vata", "points": 1} for _ in range(6)]
        + [{"dosha_tag": "pitta", "points": 1} for _ in range(5)]
        + [{"dosha_tag": "kapha", "points": 1} for _ in range(4)]
    )
    r2 = calculate_prakriti_scores(ans_gap2)
    assert r2.dominance_gap == 1
    assert r2.confidence == "low"
    assert "SAMA" in r2.dominant_prakriti


def test_prakriti_empty_and_malformed_input():
    """Verify empty input, invalid dosha tags, and unexpected types do not crash."""
    # Empty answers list
    empty_res = calculate_prakriti_scores([])
    assert empty_res.scores.vata == 0
    assert empty_res.scores.pitta == 0
    assert empty_res.scores.kapha == 0
    assert empty_res.confidence == "low"
    assert "SAMA" in empty_res.dominant_prakriti

    # Invalid dosha tags
    garbage_ans = [
        {"dosha_tag": "unknown_dosha", "points": 1},
        {"dosha_tag": "", "points": 5},
        {"dosha_tag": "vata", "points": "2"},
    ]
    g_res = calculate_prakriti_scores(garbage_ans)
    assert g_res.scores.vata == 2
    assert g_res.scores.pitta == 0
    assert g_res.scores.kapha == 0


# ====================================================================
# 3. RED-FLAG DETECTOR TESTS (All 4 Rules, Both Languages, Negations)
# ====================================================================

def test_all_four_red_flag_rules_english():
    """Test English trigger for each of the 4 emergency rules."""
    # 1. Cardiac
    r1 = evaluate_red_flags("Patient reports severe chest pain and left arm pain")
    assert r1.triggered is True
    assert r1.rule_id == "RF-001-CARDIAC"
    assert r1.severity == "critical"

    # 2. Stroke
    r2 = evaluate_red_flags("Sudden slurred speech and facial weakness, suspected stroke")
    assert r2.triggered is True
    assert r2.rule_id == "RF-002-STROKE"
    assert r2.severity == "critical"

    # 3. Respiratory
    r3 = evaluate_red_flags("Acute shortness of breath and difficulty breathing")
    assert r3.triggered is True
    assert r3.rule_id == "RF-003-RESPIRATORY"
    assert r3.severity == "critical"

    # 4. GI Bleed
    r4 = evaluate_red_flags("Observation of blood in vomit and black stool")
    assert r4.triggered is True
    assert r4.rule_id == "RF-004-GI-BLEED"
    assert r4.severity == "high"


def test_all_four_red_flag_rules_hindi():
    """Test Hindi trigger for each of the 4 emergency rules."""
    # 1. Cardiac
    r1 = evaluate_red_flags("सीने में तेज दर्द और घबराहट के साथ पसीना आ रहा है")
    assert r1.triggered is True
    assert r1.rule_id == "RF-001-CARDIAC"

    # 2. Stroke
    r2 = evaluate_red_flags("मरीज को अचानक लकवा और बोलने में कठिनाई हो रही है")
    assert r2.triggered is True
    assert r2.rule_id == "RF-002-STROKE"

    # 3. Respiratory
    r3 = evaluate_red_flags("अचानक सांस फूलना शुरू हो गया है, सांस नहीं आ रही")
    assert r3.triggered is True
    assert r3.rule_id == "RF-003-RESPIRATORY"

    # 4. GI Bleed
    r4 = evaluate_red_flags("उल्टी में खून आया है और चक्कर आ रहे हैं")
    assert r4.triggered is True
    assert r4.rule_id == "RF-004-GI-BLEED"


def test_red_flag_negation_handling():
    """Verify negation patterns prevent false positive emergency triggers."""
    # English negations
    neg_en1 = evaluate_red_flags("Patient has knee pain, denies chest pain")
    assert neg_en1.triggered is False

    neg_en2 = evaluate_red_flags("Normal checkup, no shortness of breath")
    assert neg_en2.triggered is False

    neg_en3 = evaluate_red_flags("Patient without blood in vomit")
    assert neg_en3.triggered is False

    # Hindi negations
    neg_hi1 = evaluate_red_flags("सीने में दर्द नहीं है, केवल घुटने में दर्द है")
    assert neg_hi1.triggered is False

    neg_hi2 = evaluate_red_flags("उल्टी में खून नहीं आ रहा")
    assert neg_hi2.triggered is False


def test_red_flag_edge_and_malformed_inputs():
    """Verify empty string, whitespace, special characters, and non-emergency inputs."""
    assert evaluate_red_flags("").triggered is False
    assert evaluate_red_flags("    ").triggered is False
    assert evaluate_red_flags("!@#$%^&*()").triggered is False
    assert evaluate_red_flags("mild knee swelling for 2 weeks").triggered is False


# ====================================================================
# 4. COMPLAINT INFERENCE SERVICE TESTS (All 4 Registered Question Sets)
# ====================================================================

def test_all_four_question_sets_offline_matching():
    """Verify deterministic matching for all 4 clinical domain question sets."""
    # 1. Joint Pain
    res1 = complaint_inference_service.infer_complaint("घुटने का दर्द और कमर में तेज जकड़न")
    assert res1.matched is True
    assert res1.matched_set_id == "joint_pain"

    # 2. Digestive / Acidity
    res2 = complaint_inference_service.infer_complaint("पेट में जलन, गैस और खट्टी डकार")
    assert res2.matched is True
    assert res2.matched_set_id == "digestive_acidity"

    # 3. Respiratory / Cough
    res3 = complaint_inference_service.infer_complaint("पुरानी खांसी और बलगम की समस्या")
    assert res3.matched is True
    assert res3.matched_set_id == "respiratory_cough"

    # 4. Skin / Dermatology
    res4 = complaint_inference_service.infer_complaint("त्वचा में खुजली और लाल चकत्ते (दाद)")
    assert res4.matched is True
    assert res4.matched_set_id == "skin_dermatology"


def test_complaint_inference_gibberish_and_empty():
    """Verify unmatchable or empty complaints fall back gracefully to general questions."""
    # Gibberish input
    res_gib = complaint_inference_service.infer_complaint("xyzqwerty12345 unclassified")
    assert res_gib.matched is False
    assert res_gib.matched_set_id is None
    assert len(res_gib.questions) >= 3

    # Empty complaint
    res_empty = complaint_inference_service.infer_complaint("")
    assert res_empty.matched is False
    assert len(res_empty.questions) >= 3


# ====================================================================
# 5. FILE VALIDATION & SANITIZATION TESTS
# ====================================================================

def test_sanitize_filename_security():
    """Verify path traversal vectors and illegal characters are stripped."""
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("prescription #1 (test).jpg") == "prescription__1__test_.jpg"
    assert sanitize_filename("") == "unnamed_file.jpg"
    assert sanitize_filename("normal_file.png") == "normal_file.png"


# ====================================================================
# 6. OCR VERIFICATION LOGIC WITH EDGE CASES
# ====================================================================

def test_ocr_verification_edge_cases():
    """Test OCR verification with empty tokens, missing values, and normalization edge cases."""
    ocr = OCRVerificationService()

    # Empty tokens list -> NOT_FOUND
    res_empty = ocr.verify_finding("Hemoglobin", "13.2", [])
    assert res_empty.verification_status == VerificationStatus.NOT_FOUND

    # Empty gemini_value -> NOT_FOUND
    res_no_val = ocr.verify_finding("Hemoglobin", "", [{"text": "Hb", "conf": 90.0}])
    assert res_no_val.verification_status == VerificationStatus.NOT_FOUND

    # Test normalization of blood pressure and percent strings
    assert normalize_numeric_string("120/80") == "120/80"
    assert normalize_numeric_string(" 120 / 80 ") == "120/80"
    assert normalize_numeric_string("5.5%") == "5.5%"
    assert normalize_numeric_string("invalid_non_numeric") == "invalid_non_numeric"
    assert normalize_numeric_string(None) is None
