"""
Complaint Inference Service.
Analyzes patient chief complaints using Google Gemini 2.5 Flash with structured outputs.
Matches complaints against registered question sets or generates dynamic general questions.
Includes 100% offline deterministic keyword matching fallback.
"""

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

logger = logging.getLogger("complaint_inference_service")

# Resolve directory of question sets relative to this file
DEFAULT_QUESTION_SETS_DIR = Path(__file__).resolve().parent.parent / "data" / "question_sets"


class QuestionOption(BaseModel):
    hindi: str
    english: str
    value: str


class DynamicQuestion(BaseModel):
    id: str
    key: str
    category: str
    titleHindi: str
    titleEnglish: str
    options: List[QuestionOption]


class GeminiInferenceOutput(BaseModel):
    matched: bool = Field(
        ...,
        description="True if the patient's complaint matches one of the provided question sets, False otherwise."
    )
    matched_set_id: Optional[str] = Field(
        None,
        description="The exact ID of the matching question set if matched=True, else null."
    )
    confidence: str = Field(
        "high",
        description="Confidence level: high, medium, or low."
    )
    reasoning: str = Field(
        "",
        description="Brief clinical reasoning for the match decision."
    )
    general_questions: Optional[List[DynamicQuestion]] = Field(
        None,
        description="Only populated when matched=False. 3-4 general questions in bilingual Hindi/English with touch options."
    )


class ComplaintInferenceResult(BaseModel):
    matched: bool
    matched_set_id: Optional[str]
    matched_set_title: str
    source: str  # "question_set" | "gemini_general" | "fallback"
    reasoning: Optional[str] = None
    questions: List[DynamicQuestion]


def clean_json_markdown(text: str) -> str:
    """Removes ```json markdown wrapping if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class ComplaintInferenceService:
    def __init__(self, question_sets_dir: Optional[Path] = None):
        self._client: Optional[Any] = None
        self.question_sets_dir = question_sets_dir or DEFAULT_QUESTION_SETS_DIR

    @property
    def model_name(self) -> str:
        # Configurable model; defaults to gemini-2.5-flash
        return os.getenv("GEMINI_MODEL", os.getenv("LLM_MODEL", "gemini-2.5-flash"))

    def _get_client(self) -> Optional[Any]:
        if self._client is not None:
            return self._client

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.info("GEMINI_API_KEY is not configured; using offline deterministic inference.")
            return None

        if genai is None:
            logger.warning("google-genai library is not installed; using offline deterministic inference.")
            return None

        try:
            self._client = genai.Client(api_key=api_key)
            return self._client
        except Exception as exc:
            logger.exception("Failed to initialize Google GenAI Client: %s", exc)
            return None

    def load_all_question_sets(self) -> Dict[str, Dict[str, Any]]:
        """
        Dynamically scans data/question_sets/ directory and loads all .json question sets.
        """
        q_dir = self.question_sets_dir
        question_sets: Dict[str, Dict[str, Any]] = {}

        if not q_dir.exists():
            # Try fallback search in parent directories
            fallback_dir = Path.cwd() / "server" / "app" / "data" / "question_sets"
            if fallback_dir.exists():
                q_dir = fallback_dir
            else:
                logger.warning("Question sets directory not found at %s", q_dir)
                return question_sets

        for json_path in q_dir.glob("*.json"):
            try:
                content = json_path.read_text(encoding="utf-8")
                data = json.loads(content)
                set_id = data.get("id") or json_path.stem
                question_sets[set_id] = data
            except Exception as exc:
                logger.warning("Failed to load question set from %s: %s", json_path, exc)

        return question_sets

    def infer_complaint(
        self,
        complaint_text: str,
        language: str = "hi",
    ) -> ComplaintInferenceResult:
        """
        Uses Gemini to analyze patient complaint:
        1. Compares complaint against all loaded question sets.
        2. If matched: selects that question set and loads its questions.
        3. If not matched: uses Gemini to generate bilingual general health questions.
        4. If Gemini is unavailable or errors out: uses deterministic keyword fallback.
        """
        question_sets = self.load_all_question_sets()
        clean_complaint = complaint_text.strip()

        # Build summary of available question sets for Gemini context
        sets_summary = []
        for q_id, q_data in question_sets.items():
            sets_summary.append({
                "id": q_id,
                "title": q_data.get("title", q_id),
                "titleHindi": q_data.get("titleHindi", ""),
                "description": q_data.get("description", ""),
                "keywords": q_data.get("keywords", []),
            })

        client = self._get_client()

        if client and clean_complaint and types is not None:
            try:
                system_instruction = (
                    "You are a clinical triage AI assistant for an Indian public healthcare kiosk (AYUSH-Care). "
                    "The patient has provided their chief health complaint (in Hindi, English, or Hinglish). "
                    "You are given a list of existing clinical question sets currently registered in the hospital system.\n\n"
                    "RULES:\n"
                    "1. Evaluate if the patient's complaint matches one of the registered question sets based on its clinical "
                    "nature, body systems, symptoms, and keywords.\n"
                    "2. If it MATCHES a question set:\n"
                    "   - Set matched = true\n"
                    "   - Set matched_set_id to the exact ID of that question set\n"
                    "   - Set reasoning with a concise clinical rationale\n"
                    "   - Leave general_questions empty or null\n"
                    "3. If it DOES NOT match any of the registered question sets:\n"
                    "   - Set matched = false\n"
                    "   - Set matched_set_id = null\n"
                    "   - Generate 3 to 4 general information questions in 'general_questions' to ask the patient basic health information.\n"
                    "   - Each general question must have: id ('gen-01', 'gen-02', etc.), key ('site', 'onset', 'severity', 'history'), "
                    "category, bilingual titleHindi, bilingual titleEnglish, and 3 to 4 touch options with hindi, english, and value.\n"
                    "   - Ensure the options are easy for a patient to touch-select on a kiosk screen.\n"
                )

                prompt = (
                    f"PATIENT CHIEF COMPLAINT:\n\"{clean_complaint}\"\n\n"
                    f"REGISTERED QUESTION SETS:\n{json.dumps(sets_summary, ensure_ascii=False, indent=2)}\n\n"
                    f"Selected Language Code: {language}\n"
                    "Analyze the complaint against the registered question sets and return structured inference."
                )

                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=GeminiInferenceOutput,
                    temperature=0.1,
                )

                logger.info("Calling Gemini model %s to infer complaint and select question set", self.model_name)
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=[prompt],
                    config=config,
                )

                raw_text = clean_json_markdown(response.text or "{}")
                parsed_output = GeminiInferenceOutput.model_validate_json(raw_text)

                # Case 1: Matched existing question set
                if parsed_output.matched and parsed_output.matched_set_id and parsed_output.matched_set_id in question_sets:
                    matched_id = parsed_output.matched_set_id
                    matched_data = question_sets[matched_id]
                    raw_questions = matched_data.get("questions", [])

                    formatted_questions = [
                        DynamicQuestion(**q) for q in raw_questions
                    ]

                    logger.info("Gemini matched complaint to question set '%s' (%d questions)", matched_id, len(formatted_questions))
                    return ComplaintInferenceResult(
                        matched=True,
                        matched_set_id=matched_id,
                        matched_set_title=matched_data.get("title", matched_id),
                        source="question_set",
                        reasoning=parsed_output.reasoning,
                        questions=formatted_questions,
                    )

                # Case 2: No match -> Gemini generated general information questions
                elif not parsed_output.matched and parsed_output.general_questions:
                    logger.info("Gemini found no matching question set. Returning %d general questions", len(parsed_output.general_questions))
                    return ComplaintInferenceResult(
                        matched=False,
                        matched_set_id=None,
                        matched_set_title="General Health Assessment",
                        source="gemini_general",
                        reasoning=parsed_output.reasoning,
                        questions=parsed_output.general_questions,
                    )

            except Exception as exc:
                logger.warning("Error during Gemini complaint inference: %s. Using local deterministic fallback.", exc)

        # Fallback if Gemini failed, not installed, or unconfigured
        return self._local_fallback_inference(clean_complaint, question_sets)

    def _local_fallback_inference(
        self,
        complaint_text: str,
        question_sets: Dict[str, Dict[str, Any]],
    ) -> ComplaintInferenceResult:
        """
        Deterministic local keyword matching fallback if Gemini is offline.
        Checks both English and Hindi keywords using phrase and token matching.
        """
        lower_complaint = complaint_text.lower()
        tokens = set(re.findall(r"\w+", lower_complaint))

        best_match_id = None
        highest_hits = 0

        for q_id, q_data in question_sets.items():
            keywords = q_data.get("keywords", [])
            hits = 0
            for kw in keywords:
                kw_lower = kw.lower()
                # Direct phrase match gives 2 points
                if kw_lower in lower_complaint:
                    hits += 2
                # Single token match gives 1 point
                elif kw_lower in tokens:
                    hits += 1

            if hits > highest_hits:
                highest_hits = hits
                best_match_id = q_id

        if best_match_id and highest_hits > 0:
            matched_data = question_sets[best_match_id]
            raw_questions = matched_data.get("questions", [])
            return ComplaintInferenceResult(
                matched=True,
                matched_set_id=best_match_id,
                matched_set_title=matched_data.get("title", best_match_id),
                source="question_set",
                reasoning=f"Matched {highest_hits} clinical keywords in offline mode.",
                questions=[DynamicQuestion(**q) for q in raw_questions],
            )

        # Default general health questions fallback with clean UTF-8 Devanagari Hindi
        default_general_questions = [
            DynamicQuestion(
                id="gen-01",
                key="site",
                category="स्थान (Location)",
                titleHindi="यह तकलीफ शरीर के किस हिस्से में सबसे ज्यादा महसूस हो रही है?",
                titleEnglish="Where in your body is this discomfort primarily located?",
                options=[
                    QuestionOption(hindi="सिर या गर्दन (Head / Neck)", english="Head or Neck", value="head_neck"),
                    QuestionOption(hindi="छाती या सांस नली (Chest / Breathing)", english="Chest or Breathing passage", value="chest"),
                    QuestionOption(hindi="पेट या पाचन तंत्र (Abdomen / Digestion)", english="Abdomen / Digestive area", value="abdomen"),
                    QuestionOption(hindi="हाथ-पैर या पूरे शरीर में (Limbs / Body)", english="Limbs or General body", value="limbs_body"),
                ]
            ),
            DynamicQuestion(
                id="gen-02",
                key="onset",
                category="अवधि (Duration)",
                titleHindi="यह स्वास्थ्य समस्या कितने समय से चल रही है?",
                titleEnglish="How long have you had this health concern?",
                options=[
                    QuestionOption(hindi="हाल ही में (पिछले 1 से 3 दिन से)", english="Recent (1-3 days)", value="acute_days"),
                    QuestionOption(hindi="1 से 4 सप्ताह से", english="1 to 4 weeks", value="subacute_weeks"),
                    QuestionOption(hindi="1 से 6 महीने से", english="1 to 6 months", value="chronic_months"),
                    QuestionOption(hindi="सालों से पुरानी समस्या है", english="Long standing / Years", value="chronic_years"),
                ]
            ),
            DynamicQuestion(
                id="gen-03",
                key="severity",
                category="तीव्रता (Discomfort Level)",
                titleHindi="इस परेशानी से आपकी दैनिक दिनचर्या कितनी प्रभावित हो रही है?",
                titleEnglish="How much does this trouble affect your daily routine?",
                options=[
                    QuestionOption(hindi="हल्की तकलीफ - रोजमर्रा के काम में रुकावट नहीं", english="Mild - Routine unaffected", value="mild"),
                    QuestionOption(hindi="मध्यम तकलीफ - काम करने में परेशानी होती है", english="Moderate - Somewhat hinders tasks", value="moderate"),
                    QuestionOption(hindi="गंभीर तकलीफ - बिस्तर पर आराम जरूरी है", english="Severe - Requires rest / Hard to function", value="severe"),
                ]
            ),
            DynamicQuestion(
                id="gen-04",
                key="history",
                category="पूर्व इतिहास (Prior History)",
                titleHindi="क्या आपको पहले से कोई पुरानी बीमारी या नियमित दवा चल रही है?",
                titleEnglish="Do you have any existing chronic condition or ongoing medications?",
                options=[
                    QuestionOption(hindi="हाँ, शुगर (Diabetes) या बीपी (Blood Pressure)", english="Yes, Diabetes or Hypertension", value="htn_dm"),
                    QuestionOption(hindi="हाँ, अन्य कोई पुरानी बीमारी है", english="Yes, other chronic condition", value="other_chronic"),
                    QuestionOption(hindi="नहीं, कोई पुरानी बीमारी नहीं है", english="No existing conditions", value="none"),
                ]
            ),
        ]

        return ComplaintInferenceResult(
            matched=False,
            matched_set_id=None,
            matched_set_title="General Health Assessment",
            source="fallback",
            reasoning="Default general triage fallback.",
            questions=default_general_questions,
        )


complaint_inference_service = ComplaintInferenceService()
