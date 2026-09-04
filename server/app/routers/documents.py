"""
Document and Prescription OCR Processing Router.
Handles multimodal prescription uploads, Tesseract spatial verification,
FastAPI BackgroundTasks for sub-100ms response, and DPDP ephemeral storage.
"""

import json
import logging
import uuid
import re
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile, status

from app.models.schemas import ProcessReportsResponse
from app.services.report_pipeline import report_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents & OCR"])


def sanitize_session_identifier(raw_id: Optional[str]) -> str:
    """Enforces alphanumeric, underscore, and hyphen allowlist against path traversal."""
    if not raw_id:
        return f"session_{uuid.uuid4().hex[:10]}"
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", raw_id)[:64]
    return cleaned if cleaned else f"session_{uuid.uuid4().hex[:10]}"


@router.post(
    "/process-reports",
    response_model=ProcessReportsResponse,
    status_code=status.HTTP_200_OK,
    summary="Process and verify multiple medical prescription images with background queuing",
)
async def process_reports(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Uploaded prescription/lab report image files"),
    session_id: Optional[str] = Form(None, description="Optional patient kiosk session identifier"),
    grouping_json: Optional[str] = Form(None, description="Optional JSON string specifying report page grouping"),
    sync: bool = Form(False, description="If True, process synchronously; if False, process in background for fast UX"),
):
    """
    Submits prescription images through the Dual-Engine Vision & OCR Pipeline:
    1. Validates image integrity and MIME types.
    2. Writes files to an isolated ephemeral temporary directory.
    3. If sync=True: executes Gemini extraction and Tesseract verification synchronously.
    4. If sync=False (default for kiosk): queues processing via BackgroundTasks and returns immediately.
    5. In all cases, raw images are auto-purged on completion (DPDP Act 2023 compliance).
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one prescription or report image must be provided.",
        )

    patient_session_id = sanitize_session_identifier(session_id)

    try:
        grouping_spec = None
        if grouping_json:
            try:
                grouping_spec = json.loads(grouping_json)
            except Exception as exc:
                logger.warning("Could not parse grouping JSON: %s", exc)

        temp_dir = None
        # 1. Save uploaded images to isolated ephemeral storage
        temp_dir, image_metas = await report_pipeline.save_uploaded_files_ephemeral(
            files=files,
            patient_session_id=patient_session_id,
            grouping_spec=grouping_spec,
        )

        if sync:
            return report_pipeline.process_pipeline_and_cleanup(
                temp_dir=temp_dir,
                image_metas=image_metas,
                patient_session_id=patient_session_id,
            )

        # 2. Fast UX: Dispatch to BackgroundTasks and return immediately in <100ms
        background_tasks.add_task(
            report_pipeline.process_pipeline_and_cleanup,
            temp_dir=temp_dir,
            image_metas=image_metas,
            patient_session_id=patient_session_id,
        )

        return ProcessReportsResponse(
            status="queued",
            patient_session_id=patient_session_id,
            reports_processed=0,
            result_file=None,
            message="Prescriptions received and saved to ephemeral storage. Extraction & OCR verification queued in background.",
        )

    except HTTPException:
        raise
    except Exception as exc:
        if 'temp_dir' in locals() and temp_dir and hasattr(temp_dir, 'exists') and temp_dir.exists():
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
        error_ref = f"ERR-DOC-{uuid.uuid4().hex[:8].upper()}"
        logger.exception("Internal error in process_reports [Ref: %s]: %s", error_ref, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred while processing documents. Incident Reference: {error_ref}",
        )


@router.post(
    "/{session_id}/upload",
    response_model=ProcessReportsResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload prescription for a specific kiosk intake session",
)
async def upload_session_document(
    session_id: str,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Prescription image files"),
):
    """
    Uploads prescriptions directly linked to an active patient intake session.
    """
    return await process_reports(files=files, session_id=session_id, background_tasks=background_tasks)
