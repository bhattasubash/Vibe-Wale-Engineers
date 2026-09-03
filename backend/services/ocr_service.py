import logging
import math
import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
from PIL import Image
import pytesseract
from pytesseract import Output
from rapidfuzz import fuzz

from backend.config import settings
from backend.models.schemas import ValueVerification, VerificationStatus
from backend.utils.aliases import are_values_consistent, get_aliases_for_test

logger = logging.getLogger("ocr_service")

# Regex pattern supporting medical values: 13.2, 13, 0.87, 1,234, 12.5%, 120/80, +1, -0.5
NUMERIC_PATTERN = re.compile(
    r"[-+]?\d[\d,]*\.?\d*(?:\s*%|\s*/\s*\d+)?|[-+]?\d*\.?\d+"
)


class OCRService:
    def __init__(self):
        self._setup_tesseract_cmd()

    def _setup_tesseract_cmd(self) -> None:
        """Finds and sets the Tesseract executable path if not already in system PATH."""
        if settings.TESSERACT_CMD and os.path.isfile(settings.TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            logger.info("Using configured Tesseract path: %s", settings.TESSERACT_CMD)
            return

        # Check standard Windows paths
        common_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for p in common_paths:
            if os.path.isfile(p):
                pytesseract.pytesseract.tesseract_cmd = p
                logger.info("Discovered Tesseract at: %s", p)
                return

        # Check PATH
        if shutil.which("tesseract"):
            logger.info("Tesseract found in system PATH.")
            return

        logger.warning(
            "Tesseract executable not found in PATH or standard paths. "
            "OCR verification will return 'not_found' / 'unclear' safely."
        )

    def is_tesseract_available(self) -> bool:
        """Checks if Tesseract binary is executable."""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def get_image_ocr_tokens(self, image_input: Union[str, Path, Image.Image]) -> List[Dict]:
        """
        Runs pytesseract.image_to_data to extract structured token data.
        Returns list of cleaned token dicts with bounding boxes and confidence.
        """
        if isinstance(image_input, (str, Path)):
            img = Image.open(str(image_input))
        else:
            img = image_input

        try:
            ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)
        except Exception as exc:
            logger.warning("Pytesseract execution failed: %s", exc)
            return []

        tokens: List[Dict] = []
        n_boxes = len(ocr_data["text"])
        for i in range(n_boxes):
            raw_text = ocr_data["text"][i].strip()
            if not raw_text:
                continue

            try:
                conf = float(ocr_data["conf"][i])
            except (ValueError, TypeError):
                conf = -1.0

            if conf < 0:
                continue

            tokens.append({
                "text": raw_text,
                "left": int(ocr_data["left"][i]),
                "top": int(ocr_data["top"][i]),
                "width": int(ocr_data["width"][i]),
                "height": int(ocr_data["height"][i]),
                "conf": conf,
                "line_num": int(ocr_data.get("line_num", [0])[i]),
                "block_num": int(ocr_data.get("block_num", [0])[i]),
            })

        return tokens

    def find_label_token(
        self, tokens: List[Dict], test_name: str
    ) -> Optional[Dict]:
        """
        Finds the OCR token or token group matching the test name or its aliases
        using rapidfuzz.fuzz.partial_ratio.
        """
        aliases = get_aliases_for_test(test_name)
        threshold = settings.RAPIDFUZZ_SIMILARITY_THRESHOLD

        best_token: Optional[Dict] = None
        best_score = 0.0

        for token in tokens:
            token_text = token["text"].lower()
            if len(token_text) < 2 and not token_text.isalpha():
                continue

            for alias in aliases:
                # Fast exact match or partial ratio
                if alias == token_text:
                    return token
                
                score = fuzz.partial_ratio(alias, token_text)
                if score > best_score and score >= threshold:
                    best_score = score
                    best_token = token

        return best_token

    def search_numeric_value_near_label(
        self, tokens: List[Dict], label_token: Dict
    ) -> Optional[Tuple[str, float]]:
        """
        Searches for a numeric token relative to the label token:
        1. Same row window:
           - vertical range: label_top - 1.5 * label_height to label_top + 2.5 * label_height
           - horizontal range: label_right to label_right + 400 px
        2. Fallback to immediately following row:
           - vertical range: label_top + label_height to label_top + 3.0 * label_height
           - horizontal range: label_left to label_right + 400 px

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
        horiz_min = label_right - 10  # allow slight overlap
        horiz_max = label_right + 400

        candidates = []
        for t in tokens:
            if t == label_token:
                continue

            # Check if within same row bounds
            if vert_min <= t["top"] <= vert_max and horiz_min <= t["left"] <= horiz_max:
                match = NUMERIC_PATTERN.search(t["text"])
                if match:
                    dist = math.hypot(t["left"] - label_right, t["top"] - label_top)
                    candidates.append((dist, match.group(0), t["conf"]))

        if candidates:
            # Sort by spatial proximity to the label
            candidates.sort(key=lambda x: x[0])
            _, best_val, best_conf = candidates[0]
            return best_val, best_conf

        # 2. Fallback: Search immediately following row
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
        self,
        test_name: str,
        gemini_value: str,
        image_tokens: List[Dict],
    ) -> ValueVerification:
        """
        Performs independent Tesseract verification of a single Gemini-extracted finding.
        Follows rules:
        - If label not found or no numeric token found -> status='not_found', final_value='unclear'
        - If OCR confidence < threshold -> status='unclear', final_value='unclear'
        - If confidence >= threshold:
          - If values consistent -> status='verified', final_value=gemini_value
          - If values mismatch -> status='mismatch', final_value='unclear'
        """
        # If Gemini value is non-numeric or empty
        if not gemini_value or not NUMERIC_PATTERN.search(gemini_value):
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value="unclear",
            )

        if not image_tokens:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value="unclear",
            )

        label_token = self.find_label_token(image_tokens, test_name)
        if not label_token:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value="unclear",
            )

        result = self.search_numeric_value_near_label(image_tokens, label_token)
        if not result:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=None,
                tesseract_confidence=None,
                verification_status=VerificationStatus.NOT_FOUND,
                final_value="unclear",
            )

        tess_value, tess_conf = result
        threshold = settings.TESSERACT_CONFIDENCE_THRESHOLD

        if tess_conf < threshold:
            return ValueVerification(
                test_name=test_name,
                gemini_value=gemini_value,
                tesseract_value=tess_value,
                tesseract_confidence=tess_conf,
                verification_status=VerificationStatus.UNCLEAR,
                final_value="unclear",
            )

        # Confidence >= threshold: Compare OCR value against Gemini value
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
        self,
        findings: List[Dict],
        image_paths: List[Union[str, Path]],
    ) -> Tuple[List[ValueVerification], List[Dict]]:
        """
        Runs verification for all findings across the report's source image pages.
        Updates finding values with verified final_value.
        """
        # Extract tokens from all pages of the report
        all_page_tokens: List[List[Dict]] = []
        for img_path in image_paths:
            tokens = self.get_image_ocr_tokens(img_path)
            all_page_tokens.append(tokens)

        verifications: List[ValueVerification] = []
        updated_findings: List[Dict] = []

        for finding in findings:
            test_name = finding.get("test_name", "")
            raw_value = finding.get("value", "")

            # Attempt verification on each page until verified or best candidate found
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
                    final_value="unclear",
                )

            verifications.append(best_verif)

            # Update finding's value: if explicit mismatch, mark unclear; otherwise keep extracted value
            updated_f = dict(finding)
            if best_verif.verification_status == VerificationStatus.MISMATCH:
                updated_f["value"] = "unclear"
            else:
                updated_f["value"] = raw_value
            updated_findings.append(updated_f)

        return verifications, updated_findings


ocr_service = OCRService()
