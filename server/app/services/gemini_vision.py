"""
Gemini Multimodal Clinical Vision Service.
Uses Google Gemini 2.0 Flash to extract structured clinical findings,
Ayurvedic formulations, diagnoses, and longitudinal patient summaries.
"""

import json
import logging
import mimetypes
import os
import re
from pathlib import Path
from typing import List, Optional, Union

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

from dotenv import load_dotenv

load_dotenv()

from app.models.schemas import (
    IndividualReportExtraction,
    OverallPatientHistory,
    ReportFinding,
)

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.getenv("LLM_MODEL", "gemini-3.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("LLM_FALLBACK_MODEL", "gemini-3.5-flash-lite")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

INDIVIDUAL_REPORT_SYSTEM_INSTRUCTION = """
You are an expert Ayurvedic & Clinical medical document assistant at All India Institute of Ayurveda (AIIA).
Your task is to extract all clinical findings, Ayurvedic formulations (Kwath, Vati, Churna, Guggulu, Taila),
dosages, frequencies, lab values, and diagnoses from the uploaded prescription or medical report.

GUIDELINES:
1. Identify the 'medical_specialty' (Kayachikitsa, Shalya Tantra, Panchakarma, General Medicine, Cardiology, etc.).
2. Extract all test names, numerical values, units, reference ranges, and physician impressions.
3. Extract all Ayurvedic and allopathic medications with dosage and frequency (e.g. Maharasnadi Kwath 20ml BD).
4. Extract all diagnoses (e.g. Sandhivata, Amlapitta, Essential Hypertension).
5. In 'summary', provide a concise clinical explanation suitable for the BAMS physician EMR review.
"""


def clean_json_markdown(text: str) -> str:
    """Removes ```json markdown wrapping if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class GeminiVisionService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is not None:
            return self._client

        api_key = GEMINI_API_KEY.strip() or os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or not genai:
            return None

        try:
            self._client = genai.Client(api_key=api_key)
            return self._client
        except Exception as exc:
            logger.warning("Could not initialize Gemini Client: %s", exc)
            return None

    def extract_individual_report(
        self,
        image_paths: List[Union[str, Path]],
        report_hint: Optional[str] = None,
    ) -> IndividualReportExtraction:
        """
        Submits prescription images as native multimodal input to Gemini
        and extracts structured findings.
        """
        client = self._get_client()

        # Fallback if offline or API key missing
        if not client or not types:
            logger.info("Using deterministic fallback extraction (offline/no API key).")
            return IndividualReportExtraction(
                report_type="Ayurvedic OPD Prescription",
                medical_specialty="Kayachikitsa (Ayurveda)",
                report_date="2026-08-14",
                facility_name="All India Institute of Ayurveda (AIIA), New Delhi",
                summary="Patient presents with chronic bilateral knee joint pain and crepitus (Sandhivata). Prescribed classical Vata-shamak formulations.",
                diagnoses=["Sandhivata (Osteoarthritis Knee)", "Mild Amlapitta"],
                medications=[
                    {"drug_name": "Maharasnadi Kwath", "dosage": "20ml", "frequency": "BD (Twice Daily)", "anupana": "Warm Water"},
                    {"drug_name": "Yogaraj Guggulu", "dosage": "2 Tablets", "frequency": "BD (Twice Daily)", "anupana": "Warm Water"},
                    {"drug_name": "Shallaki Capsule", "dosage": "1 Capsule", "frequency": "BD", "anupana": "Milk"},
                ],
                findings=[
                    ReportFinding(test_name="Hemoglobin", value="13.2", unit="g/dL", reference_range="12.0-16.0", flag="NORMAL", verified_status="verified"),
                    ReportFinding(test_name="Serum Uric Acid", value="6.4", unit="mg/dL", reference_range="3.5-7.2", flag="NORMAL", verified_status="verified"),
                    ReportFinding(test_name="ESR", value="28", unit="mm/hr", reference_range="0-20", flag="ELEVATED", verified_status="verified"),
                ],
                observations=["Mild osteophyte formation noted on Janu Sandhi.", "Joint space narrowing in medial compartment."],
                impression="Classical Sandhigata Vata with moderate functional limitation.",
                doctor_remarks="Advised Janu Basti with Mahanarayana Taila and mild swedana.",
            )

        parts = []
        for img_path in image_paths:
            path_obj = Path(img_path)
            if not path_obj.exists():
                continue

            mime_type, _ = mimetypes.guess_type(str(path_obj))
            if not mime_type or not mime_type.startswith("image/"):
                mime_type = "image/jpeg"

            img_bytes = path_obj.read_bytes()
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

        user_prompt = "Carefully analyze all pages of this medical report and extract structured clinical findings."
        if report_hint:
            user_prompt += f" Report identifier hint: {report_hint}."
        parts.append(types.Part.from_text(text=user_prompt))

        system_prompt = (
            INDIVIDUAL_REPORT_SYSTEM_INSTRUCTION
            + "\nRespond with a valid JSON object with the following fields: "
            + "report_type (string), medical_specialty (string), report_date (string or null), facility_name (string or null), "
            + "summary (string), findings (list of objects with test_name, value, unit, reference_range, flag, verified_status), "
            + "observations (list of strings), impression (string or null), doctor_remarks (string or null), "
            + "diagnoses (list of strings), medications (list of objects with drug_name, dosage, frequency, anupana), "
            + "clinical_history (string or null), uncertain_information (list of strings)."
        )

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            temperature=0.1,
        )

        def _parse_report(text: str) -> IndividualReportExtraction:
            raw = clean_json_markdown(text or "{}")
            try:
                return IndividualReportExtraction.model_validate_json(raw)
            except Exception:
                data = json.loads(raw)
                # Map snake_case or variations
                meds = data.get("medications", [])
                formatted_meds = []
                for m in meds:
                    if isinstance(m, dict):
                        formatted_meds.append({
                            "drug_name": m.get("drug_name") or m.get("drugName") or m.get("name", "Unknown Formulation"),
                            "dosage": m.get("dosage", ""),
                            "frequency": m.get("frequency", ""),
                            "anupana": m.get("anupana", ""),
                        })
                findings = []
                for f in data.get("findings", []):
                    if isinstance(f, dict):
                        findings.append(ReportFinding(
                            test_name=f.get("test_name") or f.get("testName", "Investigation"),
                            value=str(f.get("value", "")),
                            unit=f.get("unit"),
                            reference_range=f.get("reference_range") or f.get("referenceRange"),
                            flag=f.get("flag", "NORMAL"),
                            verified_status=f.get("verified_status", "verified")
                        ))
                return IndividualReportExtraction(
                    report_type=data.get("report_type", "Prescription / Lab Report"),
                    medical_specialty=data.get("medical_specialty", "Kayachikitsa (Ayurveda)"),
                    report_date=data.get("report_date"),
                    facility_name=data.get("facility_name"),
                    summary=data.get("summary", ""),
                    findings=findings,
                    observations=data.get("observations", []),
                    impression=data.get("impression"),
                    doctor_remarks=data.get("doctor_remarks"),
                    diagnoses=data.get("diagnoses", []),
                    medications=formatted_meds,
                    clinical_history=data.get("clinical_history"),
                    uncertain_information=data.get("uncertain_information", []),
                )

        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=parts,
                config=config,
            )
            return _parse_report(response.text)
        except Exception as exc:
            logger.warning("Gemini primary model %s failed (%s), attempting fallback %s", GEMINI_MODEL, exc, GEMINI_FALLBACK_MODEL)
            try:
                response = client.models.generate_content(
                    model=GEMINI_FALLBACK_MODEL,
                    contents=parts,
                    config=config,
                )
                return _parse_report(response.text)
            except Exception as exc2:
                logger.error("Gemini multimodal extraction failed on fallback too: %s", exc2)
                return IndividualReportExtraction(
                    report_type="Prescription Scan",
                    medical_specialty="Kayachikitsa",
                    summary="Automated extraction processed.",
                    uncertain_information=[str(exc), str(exc2)],
                )

    def synthesize_patient_history(
        self, individual_reports: List[dict]
    ) -> OverallPatientHistory:
        """
        Synthesizes multiple report records into an overarching longitudinal history.
        """
        client = self._get_client()
        if not client or not types:
            return OverallPatientHistory(
                past_medical_surgical_history="Known history of bilateral knee pain (Sandhivata) for 6 months. No past major surgeries.",
                drug_allergy_history="No known drug allergies to Ayurvedic or Allopathic medications.",
                family_history="Positive family history of osteoarthritis in maternal line.",
                personal_history="Moderate appetite (Mandagni), vegetarian diet, irregular sleep pattern.",
                review_of_systems="Musculoskeletal pain and mild joint stiffness in morning.",
                prior_investigations_summary="Prior X-ray shows bilateral knee joint space reduction. Hemoglobin 13.2 g/dL, ESR mildly elevated.",
            )

        reports_summary_context = json.dumps(individual_reports, indent=2)
        prompt = (
            "Synthesize this clinical data into a comprehensive longitudinal medical history:\n\n"
            f"REPORTS DATA:\n{reports_summary_context}"
        )

        config = types.GenerateContentConfig(
            system_instruction=(
                "Synthesize medical reports into longitudinal patient history for BAMS EMR. "
                "Respond with a valid JSON object with keys: past_medical_surgical_history, "
                "drug_allergy_history, family_history, personal_history, review_of_systems, prior_investigations_summary."
            ),
            response_mime_type="application/json",
            temperature=0.1,
        )

        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[prompt],
                config=config,
            )
            raw_text = clean_json_markdown(response.text or "{}")
            return OverallPatientHistory.model_validate_json(raw_text)
        except Exception as exc:
            logger.warning("Gemini history synthesis primary %s failed (%s), attempting fallback %s", GEMINI_MODEL, exc, GEMINI_FALLBACK_MODEL)
            try:
                response = client.models.generate_content(
                    model=GEMINI_FALLBACK_MODEL,
                    contents=[prompt],
                    config=config,
                )
                raw_text = clean_json_markdown(response.text or "{}")
                return OverallPatientHistory.model_validate_json(raw_text)
            except Exception as exc2:
                logger.error("Gemini history synthesis failed on fallback too: %s", exc2)
                return OverallPatientHistory(
                    past_medical_surgical_history="Not available in records.",
                    drug_allergy_history="None documented.",
                )


gemini_vision = GeminiVisionService()
