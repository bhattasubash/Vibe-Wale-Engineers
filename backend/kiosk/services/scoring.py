"""
Deterministic Prakriti Calculation Engine grounded in Charaka Samhita (Vimana Sthana 8).
Executes in O(1) arithmetic time with zero LLM hallucinations.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DoshaScore(BaseModel):
    vata: int = Field(ge=0, le=15, description="Vata total point count")
    pitta: int = Field(ge=0, le=15, description="Pitta total point count")
    kapha: int = Field(ge=0, le=15, description="Kapha total point count")


class PrakritiAnalysisResult(BaseModel):
    scores: DoshaScore
    percentages: Dict[str, int]
    dominant_prakriti: str
    secondary_prakriti: Optional[str]
    confidence: str  # 'high' | 'medium' | 'low'
    dominance_gap: int
    clinical_note: str


def calculate_prakriti_scores(answers: List[Dict[str, Any]]) -> PrakritiAnalysisResult:
    """
    Computes exact dosha scores and constitutional classification from 15 Charaka Samhita answers.
    
    Args:
        answers: List of answer dicts, each with 'dosha_tag' ('vata' | 'pitta' | 'kapha')
        
    Returns:
        PrakritiAnalysisResult with percentages, dominance gap, and confidence.
    """
    v_score = 0
    p_score = 0
    k_score = 0

    for ans in answers:
        tag = ans.get("dosha_tag", "").lower()
        points = int(ans.get("points", 1))
        if tag == "vata":
            v_score += points
        elif tag == "pitta":
            p_score += points
        elif tag == "kapha":
            k_score += points

    total = v_score + p_score + k_score
    if total == 0:
        total = 15  # Fallback divisor

    # Compute rounded percentages
    v_pct = round((v_score / total) * 100)
    p_pct = round((p_score / total) * 100)
    k_pct = round((k_score / total) * 100)

    # Sort doshas by raw score
    sorted_doshas = sorted(
        [("vata", v_score), ("pitta", p_score), ("kapha", k_score)],
        key=lambda x: x[1],
        reverse=True,
    )

    first_dosha, first_score = sorted_doshas[0]
    second_dosha, second_score = sorted_doshas[1]
    third_dosha, third_score = sorted_doshas[2]

    gap = first_score - second_score

    # Determine constitutional typology and confidence
    if gap >= 5:
        dominant_label = f"Predominantly {first_dosha.capitalize()} (एकदोषज)"
        secondary_dosha = None
        confidence = "high"
        clinical_note = (
            f"Strong single-dosha dominance ({first_dosha.capitalize()}). "
            f"Clear constitutional predisposition indicated."
        )
    elif gap >= 3:
        dominant_label = f"{first_dosha.capitalize()}-{second_dosha.capitalize()} (द्वन्द्वज)"
        secondary_dosha = second_dosha
        confidence = "medium"
        clinical_note = (
            f"Dual-dosha constitution ({first_dosha.capitalize()}-{second_dosha.capitalize()}). "
            f"Requires consideration of both doshas in Chikitsa plan."
        )
    else:
        dominant_label = "SAMA / Tri-Doshic (समदोषज / त्रिदोषज)"
        secondary_dosha = second_dosha
        confidence = "low"
        clinical_note = (
            "Near-balanced dosha distribution across all 15 parameters. "
            "Requires Nadi Pariksha (pulse examination) by physician for definitive confirmation."
        )

    return PrakritiAnalysisResult(
        scores=DoshaScore(vata=v_score, pitta=p_score, kapha=k_score),
        percentages={"vata": v_pct, "pitta": p_pct, "kapha": k_pct},
        dominant_prakriti=dominant_label,
        secondary_prakriti=secondary_dosha,
        confidence=confidence,
        dominance_gap=gap,
        clinical_note=clinical_note,
    )
