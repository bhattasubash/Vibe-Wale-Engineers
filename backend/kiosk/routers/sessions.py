from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

from backend.kiosk.models.schemas import (
    SessionStartRequest,
    SessionResponse,
    ChiefComplaintRequest,
    SessionSyncBatchRequest,
    SessionSyncBatchResponse,
    TranscribeAudioRequest,
    TranscribeAudioResponse,
    InferComplaintRequest,
    InferComplaintResponse,
)
from backend.kiosk.services.red_flags import evaluate_red_flags
from backend.services.whisprflow_service import whisprflow_service
from backend.services.complaint_inference_service import complaint_inference_service

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


@router.post("/transcribe", response_model=TranscribeAudioResponse)
async def transcribe_audio(payload: TranscribeAudioRequest):
    """
    Transcribes microphone audio using Wispr Flow API.
    """
    res = await whisprflow_service.transcribe_audio_base64(
        audio_base64=payload.audio_base64,
        properties=payload.properties,
    )
    return TranscribeAudioResponse(
        success=res["success"],
        text=res["text"],
        error=res.get("error"),
        source=res.get("source", "whisprflow"),
    )


@router.post("/infer-complaint", response_model=InferComplaintResponse)
async def infer_complaint(payload: InferComplaintRequest):
    """
    Analyzes chief complaint using Gemini AI:
    - Matches complaint against available question sets in backend/question_sets/
    - If matched: returns that question set to be pushed to the kiosk frontend
    - If unmatched: uses Gemini to ask structured general health questions
    - Evaluates red-flag emergency symptoms
    """
    session_id = payload.session_id or f"SES-{uuid.uuid4().hex[:8].upper()}"
    if session_id not in SESSION_DB:
        SESSION_DB[session_id] = {
            "session_id": session_id,
            "status": "in_progress",
            "created_at": datetime.now(),
        }

    # Evaluate red flag
    red_flag_eval = evaluate_red_flags(payload.complaint_text)

    # Gemini Inference
    inference_result = complaint_inference_service.infer_complaint(
        complaint_text=payload.complaint_text,
        language=payload.language or "hi",
    )

    SESSION_DB[session_id]["chief_complaint"] = payload.complaint_text
    SESSION_DB[session_id]["complaint_category"] = (
        inference_result.matched_set_id if inference_result.matched else "general"
    )
    SESSION_DB[session_id]["red_flag_triggered"] = red_flag_eval.triggered
    SESSION_DB[session_id]["red_flag_details"] = (
        red_flag_eval.model_dump() if red_flag_eval.triggered else None
    )
    SESSION_DB[session_id]["active_questions"] = [
        q.model_dump() for q in inference_result.questions
    ]

    return InferComplaintResponse(
        session_id=session_id,
        complaint_text=payload.complaint_text,
        matched=inference_result.matched,
        matched_set_id=inference_result.matched_set_id,
        matched_set_title=inference_result.matched_set_title,
        source=inference_result.source,
        reasoning=inference_result.reasoning,
        questions=[q.model_dump() for q in inference_result.questions],
        red_flag=red_flag_eval.model_dump(),
    )


@router.post("/transcribe-and-infer", response_model=InferComplaintResponse)
async def transcribe_and_infer(
    payload: TranscribeAudioRequest,
    session_id: Optional[str] = None,
    language: Optional[str] = "hi",
):
    """
    Convenience endpoint: transcribes audio with Wispr Flow, then immediately infers with Gemini.
    """
    transcribe_res = await whisprflow_service.transcribe_audio_base64(
        audio_base64=payload.audio_base64,
        properties=payload.properties,
    )
    complaint_text = transcribe_res.get("text", "").strip()
    if not complaint_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=transcribe_res.get("error") or "Failed to transcribe audio from voice input.",
        )

    return await infer_complaint(
        InferComplaintRequest(
            session_id=session_id,
            complaint_text=complaint_text,
            language=language,
        )
    )



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
