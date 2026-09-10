"""
Complaint Inference Service.
Analyzes patient chief complaints using Google Gemini Flash with structured outputs.
Matches complaints against registered question sets or dynamically generates disease-specific clinical questions.
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
        description="True if the patient's complaint matches one of the provided registered question sets, False otherwise."
    )
    matched_set_id: Optional[str] = Field(
        None,
        description="The exact ID of the matching question set if matched=True, else null."
    )
    detected_condition: Optional[str] = Field(
        None,
        description="Clinical condition or disease name identified from the complaint (e.g., 'माइग्रेन / Migraine', 'तीव्र ज्वर / Acute Fever', 'मधुमेह / Diabetes')."
    )
    confidence: str = Field(
        "high",
        description="Confidence level: high, medium, or low."
    )
    reasoning: str = Field(
        "",
        description="Brief clinical reasoning for the match or generated exploration questions."
    )
    general_questions: Optional[List[DynamicQuestion]] = Field(
        None,
        description="Only populated when matched=False. Exactly 6 to 9 targeted, disease-specific diagnostic questions tailored directly to the patient's condition."
    )


class ComplaintInferenceResult(BaseModel):
    matched: bool
    matched_set_id: Optional[str]
    matched_set_title: str
    source: str  # "question_set" | "gemini_dynamic" | "fallback"
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
        return os.getenv("LLM_MODEL", "gemini-2.5-flash")

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

    def _match_local_set(
        self,
        complaint_text: str,
        question_sets: Dict[str, Dict[str, Any]],
    ) -> Optional[ComplaintInferenceResult]:
        """
        Checks if complaint matches any of the 4 doctor-verified fixed question sets
        (joint_pain, digestive_acidity, respiratory_cough, skin_dermatology).
        Returns ComplaintInferenceResult if a strong match is found, else None.
        """
        lower_complaint = complaint_text.lower()
        tokens = set(re.findall(r"\w+", lower_complaint))

        best_match_id = None
        highest_hits = 0

        for q_id in ["joint_pain", "digestive_acidity", "respiratory_cough", "skin_dermatology"]:
            q_data = question_sets.get(q_id)
            if not q_data:
                continue
            keywords = q_data.get("keywords", [])
            hits = 0
            for kw in keywords:
                kw_lower = kw.lower()
                if kw_lower in lower_complaint:
                    hits += 2
                elif kw_lower in tokens:
                    hits += 1

            if hits > highest_hits:
                highest_hits = hits
                best_match_id = q_id

        # Require at least 2 points (e.g. keyword match)
        if best_match_id and highest_hits >= 2:
            matched_data = question_sets[best_match_id]
            raw_questions = matched_data.get("questions", [])
            logger.info("Complaint locally matched fixed set '%s' (%d hits) - 0ms API latency", best_match_id, highest_hits)
            return ComplaintInferenceResult(
                matched=True,
                matched_set_id=best_match_id,
                matched_set_title=matched_data.get("title", best_match_id),
                source="question_set",
                reasoning=f"Matched doctor-verified fixed set {best_match_id}.",
                questions=[DynamicQuestion(**q) for q in raw_questions],
            )
        return None

    def infer_complaint(
        self,
        complaint_text: str,
        language: str = "hi",
    ) -> ComplaintInferenceResult:
        """
        Doctor-verified clinical triage routing:
        1. 4 Fixed Local Sets (No API call): If complaint matches Sets A, B, C, or D,
           returns the local set instantly with zero API latency and zero quota usage.
        2. Gemini Dynamic Call (ONLY for unmatched complaints): Calls Gemini to dynamically
           generate 6 to 9 condition-tailored questions following strict doctor rules.
        3. Offline Fallback: If Gemini is unavailable, returns Section 6 General Fallback questions.
        """
        question_sets = self.load_all_question_sets()
        clean_complaint = complaint_text.strip()

        # 1. Check the 4 fixed local sets first (Sets A-D)
        local_match = self._match_local_set(clean_complaint, question_sets)
        if local_match:
            return local_match

        # 2. Unmatched complaint: Call Gemini to generate 6-9 condition-specific questions
        client = self._get_client()

        if client and clean_complaint and types is not None:
            system_instruction = (
                "You are an expert senior physician and clinical triage specialist for an Indian hospital kiosk (AYUSH-Care). "
                "The patient has provided a chief complaint that does not match the 4 standard local question sets (Joint Pain, Digestion, Respiratory, Skin).\n\n"
                "YOUR TASK:\n"
                "Generate 6 to 9 TARGETED, CONDITION-SPECIFIC DIAGNOSTIC QUESTIONS in 'general_questions'.\n"
                "Identify the condition in 'detected_condition'. Set matched = false, matched_set_id = null.\n\n"
                "CRITICAL CLINICAL RULES FOR GENERATED QUESTIONS (VERIFIED BY SENIOR PHYSICIANS):\n"
                "1. NEVER ask the patient to rate pain, discomfort, or severity on a numeric scale of 1 to 10 or face scale.\n"
                "   If assessing emotional impact or irritability, ask whether the discomfort makes them feel angry or irritated:\n"
                "   'Does this discomfort make you feel angry or irritated?' / 'क्या यह तकलीफ आपको गुस्सा या चिड़चिड़ा महसूस कराती है?' with options 'हाँ / Yes' and 'नहीं / No'.\n"
                "2. DURATION FORMAT: When asking how long this has been going on, options MUST strictly be:\n"
                "   - 'Today' / 'आज से'\n"
                "   - 'A few days ago' / 'कुछ दिन पहले से'\n"
                "   - 'A few weeks ago' / 'कुछ हफ्ते पहले से'\n"
                "   - 'Longer than a month ago' / 'एक महीने से भी ज़्यादा समय से'\n"
                "3. GRADED WEIGHT LOSS: If asking about involuntary weight loss, options MUST strictly be:\n"
                "   - 'No' / 'नहीं'\n"
                "   - 'Yes — about 3 kg in the last 6 months' / 'हाँ — पिछले 6 महीने में लगभग 3 किलो'\n"
                "   - 'Yes — about 6 kg in the last 12 months' / 'हाँ — पिछले 12 महीने में लगभग 6 किलो'\n"
                "4. SPOKEN NATURAL HINDI: Hindi must be phrased naturally as a caring doctor speaks to a patient in an Indian OPD, in clean Devanagari script, alongside English.\n"
                "5. Touch options must be closed-choice (Yes/No or 3-4 clear options) easy to tap on a touchscreen kiosk.\n"
            )

            prompt = (
                f"PATIENT CHIEF COMPLAINT:\n\"{clean_complaint}\"\n\n"
                f"Selected Language Code: {language}\n"
                "Generate 6 to 9 condition-tailored diagnostic questions for this patient complaint."
            )

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=GeminiInferenceOutput,
                temperature=0.1,
            )

            # Modern Gemini model fallback list
            models_to_try = [
                self.model_name,
                "gemini-3.6-flash",
                "gemini-2.5-flash-lite",
                "gemini-flash-latest",
            ]

            last_gemini_error = None
            for candidate_model in models_to_try:
                try:
                    logger.info("Calling Gemini model %s to generate questions for unmatched complaint", candidate_model)
                    response = client.models.generate_content(
                        model=candidate_model,
                        contents=[prompt],
                        config=config,
                    )

                    raw_text = clean_json_markdown(response.text or "{}")
                    parsed_output = GeminiInferenceOutput.model_validate_json(raw_text)

                    if parsed_output.general_questions and len(parsed_output.general_questions) >= 3:
                        condition_title = parsed_output.detected_condition or "लक्षण अन्वेषण / Clinical Exploration"
                        logger.info("Gemini generated %d condition-specific questions for '%s'", len(parsed_output.general_questions), condition_title)
                        return ComplaintInferenceResult(
                            matched=False,
                            matched_set_id=None,
                            matched_set_title=condition_title,
                            source="gemini_dynamic",
                            reasoning=parsed_output.reasoning,
                            questions=parsed_output.general_questions,
                        )

                except Exception as exc:
                    last_gemini_error = exc
                    logger.warning("Gemini model %s failed during complaint inference: %s", candidate_model, exc)
                    continue

            logger.warning("All Gemini models failed for complaint inference (last error: %s). Using local deterministic fallback.", last_gemini_error)

        # Fallback if Gemini failed, not installed, or unconfigured
        return self._local_fallback_inference(clean_complaint, question_sets)

    def _local_fallback_inference(
        self,
        complaint_text: str,
        question_sets: Dict[str, Dict[str, Any]],
    ) -> ComplaintInferenceResult:
        """
        Deterministic local keyword matching fallback if Gemini is offline.
        Checks both English and Hindi keywords across registered question sets.
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
                if kw_lower in lower_complaint:
                    hits += 2
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

        # Doctor-verified Section 6 General Fallback SOCRATES questions
        default_general_questions = [
            DynamicQuestion(
                id="gen-01",
                key="site",
                category="स्थान (Location)",
                titleHindi="तकलीफ शरीर में कहाँ है?",
                titleEnglish="Where in your body is the discomfort?",
                options=[
                    QuestionOption(hindi="सिर या गर्दन", english="Head or Neck", value="head_neck"),
                    QuestionOption(hindi="छाती या सांस नली", english="Chest or Breathing", value="chest_breathing"),
                    QuestionOption(hindi="पेट या पाचन तंत्र", english="Abdomen or Digestion", value="abdomen"),
                    QuestionOption(hindi="हाथ, पैर या जोड़", english="Limbs or Joints", value="limbs_joints"),
                    QuestionOption(hindi="पूरे शरीर में", english="All over the body", value="whole_body"),
                ]
            ),
            DynamicQuestion(
                id="gen-02",
                key="onset",
                category="अवधि (Duration)",
                titleHindi="यह आज से शुरू हुई, कुछ दिन पहले से, कुछ हफ्ते पहले से, या एक महीने से भी ज़्यादा समय से है?",
                titleEnglish="Did this start today, a few days ago, a few weeks ago, or longer than a month ago?",
                options=[
                    QuestionOption(hindi="आज से", english="Today", value="today"),
                    QuestionOption(hindi="कुछ दिन पहले से", english="A few days ago", value="few_days_ago"),
                    QuestionOption(hindi="कुछ हफ्ते पहले से", english="A few weeks ago", value="few_weeks_ago"),
                    QuestionOption(hindi="एक महीने से भी ज़्यादा समय से", english="Longer than a month ago", value="longer_than_month"),
                ]
            ),
            DynamicQuestion(
                id="gen-03",
                key="anger_irritation",
                category="मानसिक प्रभाव (Emotional Impact)",
                titleHindi="क्या यह तकलीफ आपको गुस्सा या चिड़चिड़ा महसूस कराती है?",
                titleEnglish="Does this discomfort make you feel angry or irritated?",
                options=[
                    QuestionOption(hindi="हाँ", english="Yes", value="yes"),
                    QuestionOption(hindi="नहीं", english="No", value="no"),
                ]
            ),
            DynamicQuestion(
                id="gen-04",
                key="triggers",
                category="बढ़ाने वाले कारक (Aggravating Factors)",
                titleHindi="यह रात में ज़्यादा होता है, खाने के बाद ज़्यादा होता है, या हिलने-डुलने से ज़्यादा होता है?",
                titleEnglish="Is it worse at night, worse after eating, or worse with movement?",
                options=[
                    QuestionOption(hindi="रात में ज़्यादा", english="Worse at night", value="night_worse"),
                    QuestionOption(hindi="खाने के बाद ज़्यादा", english="Worse after eating", value="after_eating_worse"),
                    QuestionOption(hindi="हिलने-डुलने से ज़्यादा", english="Worse with movement", value="movement_worse"),
                    QuestionOption(hindi="दिनभर एक जैसा", english="Constant throughout day", value="constant"),
                ]
            ),
            DynamicQuestion(
                id="gen-05",
                key="family_history",
                category="पारिवारिक इतिहास (Family History)",
                titleHindi="परिवार में किसी को ऐसी ही तकलीफ रही है — जैसे बीपी, शुगर, दिल की बीमारी, या ऐसी ही जोड़ों, पेट, या त्वचा की तकलीफ?",
                titleEnglish="Has anyone in your family had similar problems — like BP, sugar, heart problems, or similar joint/stomach/skin trouble?",
                options=[
                    QuestionOption(hindi="हाँ, परिवार में है", english="Yes, family history present", value="yes_family"),
                    QuestionOption(hindi="नहीं, किसी को नहीं", english="No, no family history", value="no_family"),
                    QuestionOption(hindi="निश्चित जानकारी नहीं", english="Not sure / Don't know", value="unsure"),
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
