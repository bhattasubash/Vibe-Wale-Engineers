import logging
from fastapi import APIRouter, status
from app.models.schemas import PrakritiCalculateRequest, PrakritiResultResponse
from app.services.scoring import calculate_prakriti_scores
from app.db import repository as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/prakriti", tags=["Prakriti Engine"])


@router.post("/calculate", response_model=PrakritiResultResponse, status_code=status.HTTP_200_OK)
async def calculate_prakriti(payload: PrakritiCalculateRequest):
    """
    Computes exact dosha score arithmetic and typology from 15 Charaka Samhita answers.
    Persists the result to the database for the physician dashboard.
    """
    answers_dict = [
        {"dosha_tag": a.dosha_tag, "points": a.points, "question_id": a.question_id}
        for a in payload.answers
    ]

    result = calculate_prakriti_scores(answers_dict)

    # Persist to database
    db.save_prakriti(payload.session_id, {
        "answers": answers_dict,
        "vata_score": result.percentages["vata"],
        "pitta_score": result.percentages["pitta"],
        "kapha_score": result.percentages["kapha"],
        "dominant_prakriti": result.dominant_prakriti,
        "secondary_prakriti": result.secondary_prakriti,
        "confidence": result.confidence,
        "clinical_note": result.clinical_note,
    })

    return PrakritiResultResponse(
        session_id=payload.session_id,
        vata_score=result.percentages["vata"],
        pitta_score=result.percentages["pitta"],
        kapha_score=result.percentages["kapha"],
        dominant_prakriti=result.dominant_prakriti,
        secondary_prakriti=result.secondary_prakriti,
        confidence=result.confidence,
        clinical_note=result.clinical_note,
    )
