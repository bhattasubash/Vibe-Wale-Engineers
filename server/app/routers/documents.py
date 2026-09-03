"""
Document and Prescription OCR Processing Router.
Handles multimodal prescription uploads, Tesseract spatial verification,
and Ayurvedic Pharmacopoeia entity extraction.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.models.schemas import ProcessReportsResponse
from app.services.report_pipeline import report_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents & OCR"])


@router.post(
    "/process-reports",
    response_model=ProcessReportsResponse,
    status_code=status.HTTP_200_OK,
    summary="Process and verify multiple medical prescription images",
)
async def process_reports(
    files: List[UploadFile] = File(..., description="Uploaded prescription/lab report image files"),
    session_id: Optional[str] = Form(None, description="Optional patient kiosk session identifier"),
    grouping_json: Optional[str] = Form(None, description="Optional JSON string specifying report page grouping"),
):
    """
    Submits prescription images through the Dual-Engine Vision & OCR Pipeline:
    1. Validates image integrity and MIME types.
    2. Runs Gemini Multimodal Vision analysis to extract Ayurvedic formulations and lab values.
    3. Executes independent Tesseract OCR spatial verification against original pixels.
    4. Synthesizes a longitudinal patient clinical history for BAMS doctor review.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one prescription or report image must be provided.",
        )

    try:
        response = await report_pipeline.process_all_reports(
            files=files,
            session_id=session_id,
            grouping_json=grouping_json,
        )
        return response
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to process documents: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(exc)}",
        )


@router.post(
    "/{session_id}/upload",
    response_model=ProcessReportsResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload prescription for a specific kiosk intake session",
)
async def upload_session_document(
    session_id: str,
    files: List[UploadFile] = File(..., description="Prescription image files"),
):
    """
    Uploads prescriptions directly linked to an active patient intake session.
    """
    return await process_reports(files=files, session_id=session_id)
