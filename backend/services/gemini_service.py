import json
import logging
import mimetypes
import re
from pathlib import Path
from typing import List, Optional, Union
from google import genai
from google.genai import types

from backend.config import settings
from backend.models.schemas import (
    IndividualReportExtraction,
    OverallPatientHistory,
)

logger = logging.getLogger("gemini_service")

INDIVIDUAL_REPORT_SYSTEM_INSTRUCTION = """
You are a helpful, thorough, and highly capable clinical document analysis assistant for a hackathon project.
Your mission is to be lenient, comprehensive, and proactive in extracting and summarizing medical reports.

HELPFUL GUIDELINES:
1. Identify the 'medical_specialty' to categorize this report (e.g., Dental, Cardiology, Pathology, Radiology, Hematology, Orthopedics, General Medicine).
2. Extract all visible test names, numerical values, units, reference ranges, dates, clinic/hospital names, observations, impressions, and physician remarks.
3. Be lenient with low-resolution images, varied lighting, table formatting, or handwriting. Do your best to interpret and transcribe whatever is legible.
4. In 'summary', provide a clear, easy-to-read plain-language explanation of what the report shows and what the findings mean.
5. In 'findings', list every biomarker and test found, noting whether each is within normal limits or elevated/low.
6. In 'diagnoses', 'medications', and 'clinical_history', extract any relevant items mentioned in the document.
7. Only mark something as "unclear" if the text or number is truly cut off, completely obscured, or impossible to decipher.
8. Provide rich, accessible explanations to help patients and caregivers understand their records.
"""

OVERALL_HISTORY_SYSTEM_INSTRUCTION = """
You are a helpful clinical documentation specialist synthesizing medical records into a clear patient history for a hackathon project.
Synthesize the structured data from all provided medical reports into a comprehensive, cohesive longitudinal patient summary.

HELPFUL GUIDELINES:
1. Provide a well-rounded synthesis covering:
   - Past medical and surgical history (past conditions, surgeries, procedures)
   - Drug and allergy history (known medications, adverse reactions, allergies)
   - Family history (familial diseases, genetic risks if documented)
   - Personal history (lifestyle, habits, social background)
   - Review of systems (symptoms, complaints noted across records)
   - Prior investigations summary (chronological overview of tests, biomarkers, and diagnostic findings)
2. Be comprehensive, informative, and accessible in your explanations.
3. If a section has no information in the records, simply note: "Not documented in the provided records."
4. Highlight notable trends or abnormal test findings across the patient's records in an easy-to-understand way.
"""


def clean_json_markdown(text: str) -> str:
    """Removes ```json markdown wrapping if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class GeminiService:
    def __init__(self):
        self._client: Optional[genai.Client] = None

    def _get_client(self) -> genai.Client:
        """Lazily initialize Google GenAI Client with validation."""
        if self._client is not None:
            return self._client

        api_key = settings.GEMINI_API_KEY.strip()
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in .env or environment variables."
            )

        self._client = genai.Client(api_key=api_key)
        return self._client

    def extract_individual_report(
        self,
        image_paths: List[Union[str, Path]],
        report_hint: Optional[str] = None,
    ) -> IndividualReportExtraction:
        """
        Submits medical report images as native multimodal input to Gemini
        and extracts structured clinical findings adhering to IndividualReportExtraction schema.
        """
        client = self._get_client()

        parts = []
        for img_path in image_paths:
            path_obj = Path(img_path)
            if not path_obj.exists():
                raise FileNotFoundError(f"Image not found at: {img_path}")

            mime_type, _ = mimetypes.guess_type(str(path_obj))
            if not mime_type or not mime_type.startswith("image/"):
                mime_type = "image/jpeg"

            img_bytes = path_obj.read_bytes()
            parts.append(
                types.Part.from_bytes(
                    data=img_bytes,
                    mime_type=mime_type,
                )
            )

        user_prompt = "Carefully analyze all pages of this medical report and extract structured clinical findings."
        if report_hint:
            user_prompt += f" Report identifier hint: {report_hint}."
        parts.append(types.Part.from_text(text=user_prompt))

        config = types.GenerateContentConfig(
            system_instruction=INDIVIDUAL_REPORT_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=IndividualReportExtraction,
            temperature=0.1,  # Low temperature for strict adherence to facts
        )

        logger.info(
            "Calling Gemini model %s with %d image page(s)",
            settings.GEMINI_MODEL,
            len(image_paths),
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=parts,
            config=config,
        )

        raw_text = clean_json_markdown(response.text or "{}")
        try:
            return IndividualReportExtraction.model_validate_json(raw_text)
        except Exception as exc:
            logger.error("Failed to parse Gemini output as schema: %s. Raw text: %s", exc, raw_text)
            # Fallback parsing attempt
            try:
                data = json.loads(raw_text)
                return IndividualReportExtraction(**data)
            except Exception:
                raise ValueError(f"Gemini returned invalid structured output: {raw_text[:200]}") from exc

    def synthesize_patient_history(
        self,
        individual_reports: List[dict],
    ) -> OverallPatientHistory:
        """
        Synthesizes multiple processed report records into an overarching longitudinal history.
        """
        client = self._get_client()

        reports_summary_context = json.dumps(individual_reports, indent=2)
        prompt = (
            "Below is structured data extracted from all available medical reports for this patient.\n"
            "Synthesize this data into a comprehensive longitudinal medical history adhering to the instructions.\n\n"
            f"REPORTS DATA:\n{reports_summary_context}"
        )

        config = types.GenerateContentConfig(
            system_instruction=OVERALL_HISTORY_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=OverallPatientHistory,
            temperature=0.1,
        )

        logger.info("Calling Gemini model %s for longitudinal history synthesis", settings.GEMINI_MODEL)

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=config,
        )

        raw_text = clean_json_markdown(response.text or "{}")
        try:
            return OverallPatientHistory.model_validate_json(raw_text)
        except Exception as exc:
            logger.error("Failed to parse synthesized history: %s. Raw text: %s", exc, raw_text)
            data = json.loads(raw_text)
            return OverallPatientHistory(**data)


gemini_service = GeminiService()
