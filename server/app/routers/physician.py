import logging
from datetime import datetime, timezone
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import (
    DoctorQueueItem,
    DoctorReviewRequest,
    DoctorLoginRequest,
    DoctorLoginResponse,
)
from app.services.auth import (
    authenticate_physician,
    create_access_token,
    require_physician_auth,
)
from app.db import repository as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/physician", tags=["Physician Dashboard"])


@router.post("/login", response_model=DoctorLoginResponse, status_code=status.HTTP_200_OK)
async def login_physician(payload: DoctorLoginRequest):
    """
    Authenticates a hospital physician via Doctor ID and secure PIN.
    Returns a signed HMAC-SHA256 JWT access token with physician role.
    """
    doctor = authenticate_physician(payload.doctor_id, payload.pin)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Doctor ID or Security PIN.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": doctor["doctor_id"],
        "name": doctor["doctor_name"],
        "role": doctor["role"],
        "dept": doctor["department"],
    })

    return DoctorLoginResponse(
        access_token=token,
        token_type="bearer",
        doctor_id=doctor["doctor_id"],
        doctor_name=doctor["doctor_name"],
        department=doctor["department"],
        room_number=doctor["room_number"],
        role=doctor["role"],
    )


@router.get("/queue", response_model=List[DoctorQueueItem])
async def get_doctor_queue(current_physician: Dict[str, Any] = Depends(require_physician_auth)):
    """
    Returns prioritized patient queue for the authenticated doctor's workstation.
    Reads from the persistent database instead of in-memory mock data.
    """
    entries = db.get_queue_entries()

    queue_items = []
    for entry in entries:
        queue_items.append(DoctorQueueItem(
            session_id=entry["session_id"],
            patient_name=entry.get("patient_name", ""),
            age=entry.get("age", 0),
            gender=entry.get("gender", "other"),
            phone=entry.get("phone"),
            abha_id=entry.get("abha_id"),
            token_number=entry.get("token_number", ""),
            chief_complaint=entry.get("chief_complaint", ""),
            complaint_category=entry.get("complaint_category", "general"),
            dominant_prakriti=entry.get("dominant_prakriti", ""),
            secondary_prakriti=entry.get("secondary_prakriti"),
            vata_score=entry.get("vata_score", 0),
            pitta_score=entry.get("pitta_score", 0),
            kapha_score=entry.get("kapha_score", 0),
            treatment_mode=entry.get("treatment_mode", "ayurveda"),
            red_flag_triggered=entry.get("red_flag_triggered", False),
            priority=entry.get("priority", "normal"),
            assigned_doctor=entry.get("assigned_doctor", ""),
            room_number=entry.get("room_number", ""),
            created_at=entry.get("created_at", ""),
            socrates=entry.get("socrates", {}),
            documents=entry.get("documents", []),
            medications=entry.get("medications", []),
            lab_findings=entry.get("lab_findings", []),
            ocr_text=entry.get("ocr_text", ""),
            general_vitals=entry.get("general_vitals", {}),
        ))

    return queue_items


@router.get("/session/{session_id}")
async def get_session_details(
    session_id: str,
    current_physician: Dict[str, Any] = Depends(require_physician_auth),
):
    """
    Returns full session details for a specific patient, including OCR results,
    prakriti, SOCRATES data, and any clinical summary.
    """
    queue_entry = db.get_queue_entry(session_id)
    if not queue_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient session not found.",
        )

    # Enrich with OCR results from the database
    ocr_results = db.get_ocr_results(session_id)
    prakriti = db.get_prakriti(session_id)
    socrates = db.get_socrates(session_id)
    vitals = db.get_vitals(session_id)
    summary = db.get_summary(session_id)

    return {
        "session_id": session_id,
        "queue_entry": queue_entry,
        "ocr_results": ocr_results,
        "prakriti": prakriti,
        "socrates": socrates,
        "vitals": vitals,
        "summary": summary,
    }


@router.patch("/session/{session_id}/review", status_code=status.HTTP_200_OK)
async def review_patient_session(
    session_id: str,
    payload: DoctorReviewRequest,
    current_physician: Dict[str, Any] = Depends(require_physician_auth),
):
    """
    Doctor marks session as accepted, amended, or rejected with prescription notes.
    Protected: guarantees only authenticated physicians can modify clinical case status.
    """
    entry = db.get_queue_entry(session_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient session not found in doctor queue.",
        )

    # Update queue entry status
    db.update_queue_review(session_id, payload.status, payload.doctor_notes)

    # Also update clinical summary if it exists
    db.update_summary_review(
        session_id,
        doctor_id=current_physician.get("sub", payload.doctor_id),
        status=payload.status,
        notes=payload.doctor_notes,
    )

    return {
        "session_id": session_id,
        "review_status": payload.status,
        "message": f"Session marked as {payload.status} by {current_physician.get('sub')}",
    }


@router.get("/stats")
async def get_dashboard_stats(current_physician: Dict[str, Any] = Depends(require_physician_auth)):
    """
    Returns live OPD statistics for physician dashboard header.
    Now computed from real database data instead of hardcoded numbers.
    """
    stats = db.get_queue_stats()
    return {
        "patients_today": stats["patients_today"],
        "pending_in_queue": stats["awaiting_review"],
        "red_flags_intercepted": stats["critical_pending"],
        "reviewed": stats["reviewed"],
    }
