"""
Tesseract OCR Verification Service.
Provides independent token extraction and numerical spatial cross-verification.
"""

import logging
import math
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

from PIL import Image

try:
    import pytesseract
except ImportError:
    pytesseract = None

from app.models.schemas import ValueVerification, VerificationStatus
from app.utils.aliases import are_values_consistent, get_aliases_for_test

logger = logging.getLogger(__name__)

NUMERIC_PATTERN = re.compile(r"[-+]?\d[\d,]*\.?\d*(?:\s*%)?(?:\s*/\s*\d+)?")
TESSERACT_CONFIDENCE_THRESHOLD = 50.0


class OCRVerificationService:
    """
    Independent OCR verification using Tesseract bounding box spatial tokens.
    """

    def __init__(self, tesseract_cmd: Optional[str] = None):
        if pytesseract and tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        elif pytesseract and os.name == "nt":
            # Check default Windows install paths for Tesseract
            default_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                r"C:\Users\SUBASH\AppData\Local\Tesseract-OCR\tesseract.exe",
            ]
            for p in default_paths:
                if os.path.exists(p):
                    pytesseract.pytesseract.tesseract_cmd = p
                    break

    def get_image_ocr_tokens(self, image_input: Union[str, Path, Image.Image]) -> List[Dict]:
        """
        Extracts word-level bounding box tokens and confidence scores.
        Returns list of dicts: [{text, left, top, width, height, conf}].
        """
        if not pytesseract:
            logger.warning("pytesseract is not installed; skipping spatial token extraction.")
            return []

        try:
            if isinstance(image_input, (str, Path)):
                img = Image.open(image_input)
            else:
                img = image_input

            # Convert to RGB if needed
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            # Extract full token dictionary
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            tokens = []
            n_boxes = len(data.get("text", []))

            for i in range(n_boxes):
                text = str(data["text"][i]).strip()
                if not text:
                    continue

                try:
                    conf = float(data["conf"][i])
                except (ValueError, TypeError):
                    conf = -1.0

                tokens.append({
                    "text": text,
                    "clean_text": text.lower().strip(":,.-_"),
                    "left": int(data["left"][i]),
                    "top": int(data["top"][i]),
                    "width": int(data["width"][i]),
                    "height": int(data["height"][i]),
                    "conf": conf,
                })

            return tokens

        except Exception as exc:
            logger.warning("Tesseract image_to_data failed: %s", exc)
            return []

    def find_label_token(self, tokens: List[Dict], test_name: str) -> Optional[Dict]:
        """
        Locates the label token for a given medical test name or its aliases.
        """
        aliases = get_aliases_for_test(test_name)

        # 1. Exact match on clean token text
        for alias in aliases:
            for t in tokens:
                if t["clean_text"] == alias:
                    return t

        # 2. Multi-word phrase matching
        for alias in aliases:
            parts = alias.split()
            if len(parts) > 1:
                first_word = parts[0]
                for i, t in enumerate(tokens):
                    if t["clean_text"] == first_word and i + len(parts) <= len(tokens):
                        match = True
                        for j, p in enumerate(parts[1:], start=1):
                            if tokens[i + j]["clean_text"] != p:
                                match = False
                                break
                        if match:
                            return t

        # 3. Substring match
        for alias in aliases:
            if len(alias) >= 3:
                for t in tokens:
                    if alias in t["clean_text"]:
                        return t

        return None

    def search_numeric_value_near_label(
        self, tokens: List[Dict], label_token: Dict
    ) -> Optional[Tuple[str, float]]:
        """
        Searches spatially for a numeric value to the right of or immediately below the label.
        Returns (extracted_value_string, token_confidence) or None.
        """
        label_left = label_token["left"]
        label_top = label_token["top"]
        label_width = label_token["width"]
        label_height = label_token["height"]
        label_right = label_left + label_width

        # 1. Same row window
        vert_min = label_top - 1.5 * label_height
        vert_max = label_top + 2.5 * label_height
        horiz_min = label_right - 10
        horiz_max = label_right + 400

        candidates = []
        for t in tokens:
            if t == label_token:
                continue

            if vert_min <= t["top"] <= vert_max and horiz_min <= t["left"] <= horiz_max:
                match = NUMERIC_PATTERN.search(t["text"])
                if match:
                    dist = math.hypot(t["left"] - label_right, t["top"] - label_top)
                    candidates.append((dist, match.group(0), t["conf"]))

        if candidates:
            candidates.sort(key=lambda x: x[0])
            _, best_val, best_conf = candidates[0]
            return best_val, best_conf

        # 2. Fallback: Search next row
        fallback_vert_min = label_top + label_height
        fallback_vert_max = label_top + 3.5 * label_height
        fallback_horiz_min = label_left - 20
        fallback_horiz_max = label_right + 400

        fallback_candidates = []
        for t in tokens:
            if t == label_token:
                continue

            if fallback_vert_min <= t["top"] <= fallback_vert_max and fallback_horiz_min <= t["left"] <= fallback_horiz_max:
                match = NUMERIC_PATTERN.search(t["text"])
                if match:
                    dist = math.hypot(t["left"] - label_left, t["top"] - (label_top + label_height))
                    fallback_candidates.append((dist, match.group(0), t["conf"]))

        if fallback_candidates:
            fallback_candidates.sort(key=lambda x: x[0])
            _, best_val, best_conf = fallback_candidates[0]
            return best_val, best_conf

        return None

    def verify_finding(
        self, test_name: str, gemini_value: str, image_tokens: List[Dict]
    ) -> ValueVerification:
        """
        Performs independent Tesseract verification of a single finding.
        """
        if not gemini_value or not NUMERIC_PATTERN.search(gemini_value) or not image_tokens:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value=gemini_value or "unclear",
            )

        label_token = self.find_label_token(image_tokens, test_name)
        if not label_token:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value=gemini_value,
            )

        result = self.search_numeric_value_near_label(image_tokens, label_token)
        if not result:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value=gemini_value,
            )

        tess_value, tess_conf = result
        if tess_conf < TESSERACT_CONFIDENCE_THRESHOLD:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=tess_value,
                tesseract_confidence=tess_conf,
                verification_status=VerificationStatus.UNCLEAR,
                final_value=gemini_value,
            )

        if are_values_consistent(gemini_value, tess_value):
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=tess_value,
                tesseract_confidence=tess_conf,
                verification_status=VerificationStatus.VERIFIED,
                final_value=gemini_value,
            )
        else:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=tess_value,
                tesseract_confidence=tess_conf,
                verification_status=VerificationStatus.MISMATCH,
                final_value="unclear",
            )

    def verify_report_findings(
        self, findings: List[Dict], image_paths: List[Union[str, Path]]
    ) -> Tuple[List[ValueVerification], List[Dict]]:
        """
        Runs verification for all findings across report images.
        """
        all_page_tokens: List[List[Dict]] = []
        for img_path in image_paths:
            tokens = self.get_image_ocr_tokens(img_path)
            all_page_tokens.append(tokens)

        verifications: List[ValueVerification] = []
        updated_findings: List[Dict] = []

        for finding in findings:
            test_name = finding.get("test_name", "")
            raw_value = finding.get("value", "")

            best_verif: Optional[ValueVerification] = None
            for tokens in all_page_tokens:
                verif = self.verify_finding(test_name, raw_value, tokens)
                if verif.verification_status == VerificationStatus.VERIFIED:
                    best_verif = verif
                    break
                if best_verif is None or (
                    verif.tesseract_confidence is not None
                    and (best_verif.tesseract_confidence or 0) < verif.tesseract_confidence
                ):
                    best_verif = verif

            if best_verif is None:
                best_verif = ValueVerification(
                    test_name=test_name,
                    gemini_value=raw_value,
                    tesseract_value=None,
                    tesseract_confidence=None,
                    verification_status=VerificationStatus.NOT_FOUND,
                    final_value=raw_value or "unclear",
                )

            verifications.append(best_verif)

            updated_f = dict(finding)
            if best_verif.verification_status == VerificationStatus.MISMATCH:
                updated_f["value"] = "unclear"
            else:
                updated_f["value"] = raw_value
            updated_findings.append(updated_f)

        return verifications, updated_findings


ocr_verifier = OCRVerificationService()
