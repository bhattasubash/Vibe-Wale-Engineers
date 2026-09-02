from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import uuid
from datetime import datetime

from app.models.schemas import (
    SessionStartRequest,
    SessionResponse,
    ChiefComplaintRequest,
    SessionSyncBatchRequest,
    SessionSyncBatchResponse,
)
from app.services.red_flags import evaluate_red_flags

router = APIRouter(prefix="/api/sessions", tags=["Kiosk Sessions"])

# In-Memory Active Sessions Table
SESSION_DB: Dict[str, Dict[str, Any]] = {}


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(payload: SessionStartRequest):
    """
    Initializes a new kiosk session.
    """
    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    record = {
        "session_id": session_id,
        "patient_id": payload.patient_id,
        "language": payload.language,
        "status": "in_progress",
        "chief_complaint": None,
        "complaint_category": None,
        "red_flag_triggered": False,
        "red_flag_details": None,
        "created_at": datetime.now(),
    }
    SESSION_DB[session_id] = record
    return SessionResponse(
        session_id=session_id,
        status="in_progress",
        language=payload.language,
        created_at=record["created_at"],
    )


@router.patch("/{session_id}/complaint", status_code=status.HTTP_200_OK)
async def submit_complaint(session_id: str, payload: ChiefComplaintRequest):
    """
    Records chief complaint and performs sub-millisecond emergency red-flag triage.
    """
    if session_id not in SESSION_DB:
        # Auto-create if buffered
        SESSION_DB[session_id] = {
            "session_id": session_id,
            "status": "in_progress",
            "created_at": datetime.now(),
        }

    red_flag_eval = evaluate_red_flags(payload.complaint_text)

    SESSION_DB[session_id]["chief_complaint"] = payload.complaint_text
    SESSION_DB[session_id]["complaint_category"] = payload.category
    SESSION_DB[session_id]["red_flag_triggered"] = red_flag_eval.triggered
    SESSION_DB[session_id]["red_flag_details"] = red_flag_eval.model_dump() if red_flag_eval.triggered else None

    return {
        "session_id": session_id,
        "recorded_complaint": payload.complaint_text,
        "red_flag": red_flag_eval.model_dump(),
    }


@router.post("/sync-batch", response_model=SessionSyncBatchResponse, status_code=status.HTTP_200_OK)
async def sync_offline_batch(payload: SessionSyncBatchRequest):
    """
    Idempotent batch ingestion for intakes buffered offline on kiosk hardware.
    """
    synced = 0
    failed = 0

    for s in payload.sessions:
        try:
            # Idempotent overwrite/insert
            SESSION_DB[s.sessionId] = {
                "session_id": s.sessionId,
                "patient_name": s.patientName,
                "age": s.age,
                "gender": s.gender,
                "phone": s.phone,
                "abha_id": s.abhaId,
                "chief_complaint": s.chiefComplaint,
                "socrates": s.socrates,
                "prakriti_result": s.prakritiResult,
                "consent_granted": s.consentGranted,
                "status": "awaiting_review",
                "synced_at": datetime.now(),
            }
            synced += 1
        except Exception as err:
            print(f"[SyncBatch Error] Failed to ingest session {s.sessionId}: {err}")
            failed += 1

    return SessionSyncBatchResponse(
        synced_count=synced,
        failed_count=failed,
        message=f"Successfully ingested {synced} offline sessions.",
    )
