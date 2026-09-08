import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    SessionStartRequest,
    SessionResponse,
    ChiefComplaintRequest,
    SessionSyncBatchRequest,
    SessionSyncBatchResponse,
    TranscribeAudioRequest,
    TranscribeAudioResponse,
    InferComplaintRequest,
    InferComplaintResponse,
    DynamicQuestionSchema,
    DynamicQuestionOptionSchema,
)
from app.services.red_flags import evaluate_red_flags
from app.services.whisprflow_service import whisprflow_service
from app.services.complaint_inference_service import complaint_inference_service
from app.db import repository as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sessions", tags=["Kiosk Sessions"])


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(payload: SessionStartRequest):
    """
    Initializes a new kiosk session. Persisted to the database.
    """
    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)
    session = db.create_session({
        "session_id": session_id,
        "patient_id": payload.patient_id,
        "language": payload.language,
        "status": "in_progress",
    })
    return SessionResponse(
        session_id=session_id,
        status="in_progress",
        language=payload.language,
        created_at=now,
    )


@router.patch("/{session_id}/complaint", status_code=status.HTTP_200_OK)
async def submit_complaint(session_id: str, payload: ChiefComplaintRequest):
    """
    Records chief complaint and performs sub-millisecond emergency red-flag triage.
    """
    # Auto-create session if it doesn't exist yet (e.g. frontend sent complaint before /start)
    existing = db.get_session(session_id)
    if not existing:
        db.create_session({"session_id": session_id, "status": "in_progress"})

    red_flag_eval = evaluate_red_flags(payload.complaint_text)

    db.update_session(session_id, {
        "chief_complaint": payload.complaint_text,
        "complaint_category": payload.category,
        "red_flag_triggered": red_flag_eval.triggered,
        "red_flag_reason": red_flag_eval.model_dump().get("matched_rule", {}).get("name") if red_flag_eval.triggered else None,
    })

    return {
        "session_id": session_id,
        "recorded_complaint": payload.complaint_text,
        "red_flag": red_flag_eval.model_dump(),
    }


@router.post("/transcribe", response_model=TranscribeAudioResponse, status_code=status.HTTP_200_OK)
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


@router.post("/infer-complaint", response_model=InferComplaintResponse, status_code=status.HTTP_200_OK)
async def infer_complaint(payload: InferComplaintRequest):
    """
    Analyzes chief complaint using Gemini AI:
    - Matches complaint against available question sets
    - If matched: returns that question set to be pushed to the kiosk frontend
    - If unmatched: uses Gemini to ask structured general health questions
    - Evaluates red-flag emergency symptoms
    """
    session_id = payload.session_id or f"SES-{uuid.uuid4().hex[:8].upper()}"
    existing = db.get_session(session_id)
    if not existing:
        db.create_session({"session_id": session_id, "status": "in_progress"})

    # Evaluate red flag
    red_flag_eval = evaluate_red_flags(payload.complaint_text)

    # Infer complaint & select question set
    inference_result = complaint_inference_service.infer_complaint(
        complaint_text=payload.complaint_text,
        language=payload.language or "hi",
    )

    category = inference_result.matched_set_id if inference_result.matched else "general"
    db.update_session(session_id, {
        "chief_complaint": payload.complaint_text,
        "complaint_category": category,
        "red_flag_triggered": red_flag_eval.triggered,
        "red_flag_reason": red_flag_eval.model_dump().get("matched_rule", {}).get("name") if red_flag_eval.triggered else None,
    })

    return InferComplaintResponse(
        session_id=session_id,
        complaint_text=payload.complaint_text,
        matched=inference_result.matched,
        matched_set_id=inference_result.matched_set_id,
        matched_set_title=inference_result.matched_set_title,
        source=inference_result.source,
        reasoning=inference_result.reasoning,
        questions=[
            DynamicQuestionSchema(
                id=q.id,
                key=q.key,
                category=q.category,
                titleHindi=q.titleHindi,
                titleEnglish=q.titleEnglish,
                options=[
                    DynamicQuestionOptionSchema(
                        hindi=opt.hindi,
                        english=opt.english,
                        value=opt.value,
                    )
                    for opt in q.options
                ],
            )
            for q in inference_result.questions
        ],
        red_flag=red_flag_eval.model_dump() if red_flag_eval.triggered else None,
    )


@router.post("/transcribe-and-infer", response_model=InferComplaintResponse, status_code=status.HTTP_200_OK)
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
            db.create_session({
                "session_id": s.sessionId,
                "chief_complaint": s.chiefComplaint,
                "complaint_category": s.complaintCategory or "general",
                "status": "awaiting_review",
            })

            # Also save as a queue entry for the doctor
            db.save_queue_entry({
                "session_id": s.sessionId,
                "patient_name": s.patientName,
                "age": s.age if isinstance(s.age, int) else 0,
                "gender": s.gender,
                "phone": s.phone,
                "abha_id": s.abhaId,
                "chief_complaint": s.chiefComplaint,
                "complaint_category": s.complaintCategory or "general",
                "socrates": s.socrates or {},
                "status": "awaiting_review",
                "created_at": s.createdAt,
            })

            if s.prakritiResult:
                db.save_prakriti(s.sessionId, s.prakritiResult)

            synced += 1
        except Exception as err:
            logger.warning("SyncBatch: Failed to ingest session %s: %s", s.sessionId, err)
            failed += 1

    return SessionSyncBatchResponse(
        synced_count=synced,
        failed_count=failed,
        message=f"Successfully ingested {synced} offline sessions.",
    )


@router.post("/{session_id}/complete", status_code=status.HTTP_200_OK)
async def complete_session_intake(session_id: str, payload: dict):
    """
    Finalizes a patient kiosk intake session upon Token Screen generation:
    1. Persists patient demographics
    2. Persists session state, SOCRATES, Prakriti, and Vitals
    3. Links any OCR extracted prescription documents to the physician queue entry
    4. Queues patient for the physician EMR workstation
    """
    try:
        # 1. Save or update patient
        patient_name = payload.get("patient_name") or payload.get("fullName") or "Walk-In Patient"
        abha_id = payload.get("abha_id") or payload.get("abhaId")
        phone = payload.get("phone")
        age = payload.get("age", 0)
        if isinstance(age, str) and age.isdigit():
            age = int(age)
        elif not isinstance(age, int):
            age = 0
        gender = payload.get("gender") or "other"

        patient_rec = {
            "full_name": patient_name,
            "age": age,
            "gender": gender,
            "phone": phone,
            "abha_id": abha_id,
            "abha_address": payload.get("abha_address") or payload.get("abhaAddress"),
        }
        saved_pat = db.save_patient(patient_rec)
        patient_id = saved_pat["id"]

        # 2. Update session record
        db.create_session({
            "session_id": session_id,
            "patient_id": patient_id,
            "department": payload.get("treatment_mode") or "ayurveda",
            "chief_complaint": payload.get("chief_complaint") or "",
            "complaint_category": payload.get("complaint_category") or "general",
            "red_flag_triggered": 1 if payload.get("red_flag_triggered") else 0,
            "status": "awaiting_review",
        })

        # 3. Save Socrates if provided
        socrates_data = payload.get("socrates")
        if socrates_data and isinstance(socrates_data, dict):
            db.save_socrates(session_id, socrates_data)

        # 4. Save Prakriti if provided
        prakriti_data = payload.get("prakriti_result") or payload.get("prakritiResult")
        if prakriti_data and isinstance(prakriti_data, dict):
            db.save_prakriti(session_id, prakriti_data)

        # 5. Save Vitals if provided
        vitals_data = payload.get("general_vitals") or payload.get("generalVitals")
        if vitals_data and isinstance(vitals_data, dict):
            db.save_vitals(session_id, vitals_data)

        # 6. Check existing OCR results for this session and aggregate medications/findings
        existing_ocr = db.get_ocr_results(session_id)
        all_meds = []
        all_labs = []
        all_drugs = []
        ocr_texts = []

        for r in existing_ocr:
            if r.get("summary"):
                ocr_texts.append(r["summary"])
            for m in r.get("medications", []):
                all_meds.append(m)
                dname = m.get("drugName") or m.get("drug_name") or m.get("name")
                if dname and dname not in all_drugs:
                    all_drugs.append(dname)
            for f in r.get("findings", []):
                all_labs.append(f)

        # 7. Create/Update Queue Entry
        token_num = payload.get("token_number") or payload.get("tokenNumber") or "#AIIA-001"
        queue_entry = {
            "session_id": session_id,
            "patient_name": patient_name,
            "age": age,
            "gender": gender,
            "phone": phone,
            "abha_id": abha_id,
            "token_number": token_num,
            "chief_complaint": payload.get("chief_complaint") or "",
            "complaint_category": payload.get("complaint_category") or "general",
            "dominant_prakriti": prakriti_data.get("dominant_prakriti") or prakriti_data.get("dominantPrakriti") or "Sama" if prakriti_data else "General",
            "secondary_prakriti": prakriti_data.get("secondary_prakriti") if prakriti_data else None,
            "vata_score": prakriti_data.get("vata_score") or prakriti_data.get("vataScore", 0) if prakriti_data else 0,
            "pitta_score": prakriti_data.get("pitta_score") or prakriti_data.get("pittaScore", 0) if prakriti_data else 0,
            "kapha_score": prakriti_data.get("kapha_score") or prakriti_data.get("kaphaScore", 0) if prakriti_data else 0,
            "red_flag_triggered": payload.get("red_flag_triggered", False),
            "priority": "critical" if payload.get("red_flag_triggered") else "normal",
            "assigned_doctor": payload.get("assigned_doctor") or "Dr. Ananya Sharma",
            "room_number": payload.get("room_number") or "Room 104",
            "socrates": socrates_data or {},
            "documents": payload.get("documents") or [],
            "medications": all_meds,
            "lab_findings": all_labs,
            "ocr_text": " | ".join(ocr_texts) if ocr_texts else payload.get("ocr_text", ""),
            "extracted_drugs": all_drugs,
            "status": "awaiting_review",
            "treatment_mode": payload.get("treatment_mode") or "ayurveda",
            "general_vitals": vitals_data or {},
            "created_at": payload.get("created_at") or datetime.now(timezone.utc).isoformat(),
        }
        db.save_queue_entry(queue_entry)

        logger.info("Successfully completed kiosk session %s with token %s", session_id, token_num)
        return {
            "status": "completed",
            "session_id": session_id,
            "token_number": token_num,
            "reports_attached": len(existing_ocr),
        }
    except Exception as exc:
        logger.exception("Failed to complete session %s: %s", session_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not complete session intake: {str(exc)}",
        )

