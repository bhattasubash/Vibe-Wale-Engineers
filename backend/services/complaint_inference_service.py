import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.config import settings

logger = logging.getLogger("complaint_inference_service")


# Pydantic Schemas for Structured Gemini Inference
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
    def __init__(self):
        self._client: Optional[genai.Client] = None

    def _get_client(self) -> Optional[genai.Client]:
        if self._client is not None:
            return self._client

        api_key = (settings.GEMINI_API_KEY or "").strip()
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY is not configured in settings.")
            return None

        try:
            self._client = genai.Client(api_key=api_key)
            return self._client
        except Exception as exc:
            logger.exception("Failed to initialize Google GenAI Client: %s", exc)
            return None

    def load_all_question_sets(self) -> Dict[str, Dict[str, Any]]:
        """
        Dynamically scans backend/question_sets/ directory and loads all .json question sets.
        """
        q_dir = settings.question_sets_dir
        question_sets: Dict[str, Dict[str, Any]] = {}

        if not q_dir.exists():
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
        1. Compares complaint against all loaded question sets in backend/question_sets/.
        2. If matched: selects that question set and loads its questions.
        3. If not matched: uses Gemini to ask general health information questions.
        """
        question_sets = self.load_all_question_sets()
        clean_complaint = complaint_text.strip()

        # Build summary of available question sets for Gemini context
        sets_summary = []
        for q_id, q_data in question_sets.items():
            sets_summary.append({
                "id": q_id,
                "title": q_data.get("title", q_id),
                "description": q_data.get("description", ""),
                "keywords": q_data.get("keywords", []),
            })

        client = self._get_client()

        # If Gemini is available, run inference
        if client and clean_complaint:
            try:
                system_instruction = (
                    "You are a senior clinical triage AI assistant for an Indian public healthcare kiosk (AYUSH-Care). "
                    "The patient has provided their chief health complaint (in Hindi, English, or mixed Hinglish). "
                    "You are given a list of existing clinical question sets currently registered in the hospital backend.\n\n"
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
                    "   - Ensure the options are easy for an everyday rural or urban patient to touch-select on a kiosk screen.\n"
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

                logger.info("Calling Gemini model %s to infer complaint and select question set", settings.GEMINI_MODEL)
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
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
                    logger.info("Gemini found no matching question set. Returning %d general information questions", len(parsed_output.general_questions))
                    return ComplaintInferenceResult(
                        matched=False,
                        matched_set_id=None,
                        matched_set_title="General Health Assessment",
                        source="gemini_general",
                        reasoning=parsed_output.reasoning,
                        questions=parsed_output.general_questions,
                    )

            except Exception as exc:
                logger.exception("Error during Gemini complaint inference: %s. Using local fallback.", exc)

        # Fallback if Gemini failed or is not configured
        return self._local_fallback_inference(clean_complaint, question_sets)

    def _local_fallback_inference(
        self,
        complaint_text: str,
        question_sets: Dict[str, Dict[str, Any]],
    ) -> ComplaintInferenceResult:
        """
        Deterministic local keyword matching fallback if Gemini is offline.
        """
        lower_complaint = complaint_text.lower()

        # Check keywords in question sets
        best_match_id = None
        highest_hits = 0

        for q_id, q_data in question_sets.items():
            keywords = q_data.get("keywords", [])
            hits = sum(1 for kw in keywords if kw.lower() in lower_complaint)
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
                reasoning=f"Matched {highest_hits} clinical keywords.",
                questions=[DynamicQuestion(**q) for q in raw_questions],
            )

        # Default general health questions fallback
        default_general_questions = [
            DynamicQuestion(
                id="gen-01",
                key="site",
                category="स्थान (Location)",
                titleHindi="यह समस्या शरीर के किस हिस्से में सबसे अधिक महसूस हो रही है?",
                titleEnglish="Where in your body is this discomfort primarily located?",
                options=[
                    QuestionOption(hindi="सिर या गर्दन", english="Head or Neck", value="head_neck"),
                    QuestionOption(hindi="छाती या सांस नली", english="Chest or Breathing passage", value="chest"),
                    QuestionOption(hindi="पेट या पाचन अंग", english="Abdomen / Digestive area", value="abdomen"),
                    QuestionOption(hindi="हाथ, पैर या पूरे शरीर में", english="Limbs or General body", value="limbs_body"),
                ]
            ),
            DynamicQuestion(
                id="gen-02",
                key="onset",
                category="अवधि (Duration)",
                titleHindi="यह तकलीफ आपको कितने समय से परेशान कर रही है?",
                titleEnglish="How long have you had this health concern?",
                options=[
                    QuestionOption(hindi="हाल ही में (1-3 दिन से)", english="Recent (1-3 days)", value="acute_days"),
                    QuestionOption(hindi="1 से 4 हफ्तों से", english="1 to 4 weeks", value="subacute_weeks"),
                    QuestionOption(hindi="1 से 6 महीने से", english="1 to 6 months", value="chronic_months"),
                    QuestionOption(hindi="काफी पुराने समय से", english="Long standing / Years", value="chronic_years"),
                ]
            ),
            DynamicQuestion(
                id="gen-03",
                key="severity",
                category="तीव्रता (Discomfort Level)",
                titleHindi="इस परेशानी का असर आपके दैनिक काम-काज पर कितना पड़ता है?",
                titleEnglish="How much does this trouble affect your daily routine?",
                options=[
                    QuestionOption(hindi="हल्का • सामान्य काम में कोई रुकावट नहीं", english="Mild • Routine unaffected", value="mild"),
                    QuestionOption(hindi="मध्यम • काम करने में कठिनाई होती है", english="Moderate • Somewhat hinders tasks", value="moderate"),
                    QuestionOption(hindi="गंभीर • आराम करना पड़ता है", english="Severe • Requires rest / Hard to function", value="severe"),
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
                    QuestionOption(hindi="हाँ, कोई अन्य पुरानी बीमारी", english="Yes, other chronic condition", value="other_chronic"),
                    QuestionOption(hindi="नहीं, कोई पुरानी बीमारी नहीं है", english="No existing conditions", value="none"),
                ]
            ),
        ]

        return ComplaintInferenceResult(
            matched=False,
            matched_set_id=None,
            matched_set_title="General Health Assessment",
            source="gemini_general",
            reasoning="Complaint did not match specific question sets; gathering general clinical information.",
            questions=default_general_questions,
        )


complaint_inference_service = ComplaintInferenceService()
