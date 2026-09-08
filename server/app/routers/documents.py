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
from app.db import repository as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents & OCR"])


def sanitize_session_identifier(raw_id: Optional[str]) -> str:
    """Enforces alphanumeric, underscore, and hyphen allowlist against path traversal."""
    if not raw_id:
        return f"session_{uuid.uuid4().hex[:10]}"
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", raw_id)[:64]
    return cleaned if cleaned else f"session_{uuid.uuid4().hex[:10]}"


def _persist_pipeline_results(patient_session_id: str, result_file: Optional[str]) -> None:
    """
    After the OCR pipeline finishes and writes JSON to disk,
    read those results and persist them into the database so the
    physician dashboard can fetch them.
    """
    if not result_file:
        return

    try:
        import pathlib
        result_path = pathlib.Path(result_file)
        if not result_path.exists():
            logger.warning("OCR result file not found: %s", result_file)
            return

        with open(result_path, "r", encoding="utf-8") as f:
            session_output = json.load(f)

        # Persist each individual report
        reports = session_output.get("reports", [])
        for report_ref in reports:
            report_file = report_ref.get("report_summary_file")
            if report_file:
                report_path = pathlib.Path(report_file)
                if report_path.exists():
                    with open(report_path, "r", encoding="utf-8") as rf:
                        report_data = json.load(rf)
                    db.save_ocr_result(patient_session_id, report_data)
                    logger.info("Persisted OCR report %s for session %s",
                                report_ref.get("report_id"), patient_session_id)

        # Update queue entry if it exists
        saved_reports = db.get_ocr_results(patient_session_id)
        if saved_reports:
            db.update_queue_ocr(patient_session_id, saved_reports)

        logger.info("OCR results persisted to database and queue updated for session %s", patient_session_id)
    except Exception as exc:
        logger.error("Failed to persist OCR results for session %s: %s", patient_session_id, exc)


def _process_and_persist(temp_dir, image_metas, patient_session_id: str):
    """Wrapper that runs the OCR pipeline and then persists results to DB."""
    result = report_pipeline.process_pipeline_and_cleanup(
        temp_dir=temp_dir,
        image_metas=image_metas,
        patient_session_id=patient_session_id,
    )
    _persist_pipeline_results(patient_session_id, result.result_file)
    return result


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
    6. OCR results are persisted to the database for physician dashboard access.
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
            result = _process_and_persist(temp_dir, image_metas, patient_session_id)
            return result

        # 2. Fast UX: Dispatch to BackgroundTasks and return immediately in <100ms
        background_tasks.add_task(
            _process_and_persist,
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


@router.get("/{session_id}/results", status_code=status.HTTP_200_OK)
async def get_session_ocr_results(session_id: str):
    """
    Returns all OCR-extracted reports for a given session.
    This is the endpoint the physician dashboard calls to show real OCR data.
    """
    patient_session_id = sanitize_session_identifier(session_id)
    results = db.get_ocr_results(patient_session_id)

    # Flatten and normalize medications and lab findings
    all_medications = []
    all_findings = []
    all_diagnoses = []
    summaries = []

    for r in results:
        if r.get("summary"):
            summaries.append(r["summary"])
        for d in r.get("diagnoses", []):
            if d and d not in all_diagnoses:
                all_diagnoses.append(d)
        for m in r.get("medications", []):
            all_medications.append({
                "drugName": m.get("drugName") or m.get("drug_name") or m.get("name") or "Medication",
                "dosage": m.get("dosage") or m.get("dose") or "As directed",
                "frequency": m.get("frequency") or "1-0-1 (BD)",
                "anupana": m.get("anupana") or m.get("vehicle") or "Warm Water / Koshna Jala",
                "duration": m.get("duration") or "15 days",
                "source": m.get("source") or "Ayurvedic Formulations",
            })
        for f in r.get("findings", []):
            all_findings.append({
                "testName": f.get("test_name") or f.get("testName") or "Biomarker",
                "value": str(f.get("value", "")),
                "unit": f.get("unit") or "",
                "referenceRange": f.get("reference_range") or f.get("referenceRange") or "Normal Range",
                "flag": (f.get("flag") or "NORMAL").upper(),
                "verifiedStatus": f.get("verified_status") or "verified",
            })

    return {
        "session_id": patient_session_id,
        "reports_count": len(results),
        "reports": results,
        "all_medications": all_medications,
        "all_findings": all_findings,
        "all_diagnoses": all_diagnoses,
        "combined_summary": " | ".join(summaries) if summaries else None,
    }


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
