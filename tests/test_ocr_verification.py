import pytest
from backend.models.schemas import VerificationStatus
from backend.services.ocr_service import OCRService
from backend.utils.aliases import are_values_consistent, get_aliases_for_test, normalize_numeric_string


def test_alias_retrieval():
    hb_aliases = get_aliases_for_test("Hemoglobin")
    assert "hb" in hb_aliases
    assert "hgb" in hb_aliases
    assert "hemoglobin" in hb_aliases

    wbc_aliases = get_aliases_for_test("White Blood Cell Count")
    assert "wbc" in wbc_aliases
    assert "leukocytes" in wbc_aliases


def test_numeric_normalization_and_consistency():
    assert normalize_numeric_string("13.20") == "13.2"
    assert normalize_numeric_string("1,234") == "1234"
    assert normalize_numeric_string("12.5%") == "12.5%"
    assert normalize_numeric_string("120 / 80") == "120/80"

    assert are_values_consistent("13.2", "13.20") is True
    assert are_values_consistent("13.2", "13.2") is True
    assert are_values_consistent("1,234", "1234") is True
    assert are_values_consistent("120/80", "120 / 80") is True
    assert are_values_consistent("13.2", "18.2") is False


def test_ocr_verification_logic_with_synthetic_tokens():
    ocr = OCRService()

    tokens = [
        {"text": "Hb", "left": 50, "top": 100, "width": 30, "height": 15, "conf": 95.0},
        {"text": "13.2", "left": 120, "top": 102, "width": 35, "height": 14, "conf": 94.0},
        {"text": "g/dL", "left": 165, "top": 102, "width": 30, "height": 14, "conf": 92.0},
    ]

    # 1. Exact match with high confidence -> VERIFIED
    res1 = ocr.verify_finding("Hemoglobin", "13.2", tokens)
    assert res1.verification_status == VerificationStatus.VERIFIED
    assert res1.final_value == "13.2"
    assert res1.tesseract_value == "13.2"
    assert res1.tesseract_confidence == 94.0

    # 2. Value mismatch with high confidence -> MISMATCH, final_value='unclear'
    res2 = ocr.verify_finding("Hemoglobin", "18.2", tokens)
    assert res2.verification_status == VerificationStatus.MISMATCH
    assert res2.final_value == "unclear"
    assert res2.tesseract_value == "13.2"

    # 3. Label not present -> NOT_FOUND, final_value='unclear'
    res3 = ocr.verify_finding("Creatinine", "1.1", tokens)
    assert res3.verification_status == VerificationStatus.NOT_FOUND
    assert res3.final_value == "unclear"

    # 4. Low confidence token -> UNCLEAR, final_value='unclear'
    low_conf_tokens = [
        {"text": "Hb", "left": 50, "top": 100, "width": 30, "height": 15, "conf": 95.0},
        {"text": "13.2", "left": 120, "top": 102, "width": 35, "height": 14, "conf": 55.0},  # < 80
    ]
    res4 = ocr.verify_finding("Hemoglobin", "13.2", low_conf_tokens)
    assert res4.verification_status == VerificationStatus.UNCLEAR
    assert res4.final_value == "unclear"


def test_ocr_search_multiline_fallback():
    ocr = OCRService()
    label_token = {"text": "Platelets", "left": 50, "top": 100, "width": 60, "height": 20, "conf": 90.0}

    # Number is located on the wrapped row immediately below the label
    tokens = [
        label_token,
        {"text": "150,000", "left": 55, "top": 130, "width": 50, "height": 18, "conf": 89.0},
    ]
    val, conf = ocr.search_numeric_value_near_label(tokens, label_token)
    assert val == "150,000"
    assert conf == 89.0
