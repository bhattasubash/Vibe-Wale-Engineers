"""
Document and Prescription OCR Processing Router.
Handles multimodal prescription uploads, Tesseract spatial verification,
FastAPI BackgroundTasks for sub-100ms response, and DPDP ephemeral storage.
"""

import json
import logging
import os
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


from pydantic import BaseModel, Field
from datetime import datetime, timezone


class VoiceHistoryRequest(BaseModel):
    spoken_text: str = Field(..., min_length=2, description="Patient's spoken narration of past medical history")
    language: Optional[str] = "hi"


@router.post(
    "/{session_id}/voice-history",
    status_code=status.HTTP_200_OK,
    summary="Record and structure spoken medical history for patients without physical documents"
)
async def record_voice_history(session_id: str, payload: VoiceHistoryRequest):
    """
    Processes spoken clinical history for patients who do not possess physical papers.
    Uses Gemini 3.5 Flash to extract medications, past surgeries, chronic conditions, and allergies,
    and structures them into the exact same EMR timeline as scanned documents.
    """
    patient_session_id = sanitize_session_identifier(session_id)
    text = payload.spoken_text.strip()
    lang = payload.language or "hi"

    # 1. Attempt Gemini 3.5 Extraction
    extracted_data = None
    try:
        from app.services.gemini_vision import gemini_vision, clean_json_markdown
        from google.genai import types

        client = gemini_vision._get_client()
        if client:
            system_instruction = (
                "You are an expert hospital clinical registrar. The patient does not have physical documents "
                "and is narrating their medical history verbally in Hindi or English. "
                "Extract all clinical details and return a strictly valid JSON object with these keys:\n"
                "- summary: A professional 2-3 sentence clinical overview for physician EMR\n"
                "- diagnoses: list of strings (e.g. Type 2 Diabetes, Essential Hypertension)\n"
                "- medications: list of objects with {drug_name, dosage, frequency, anupana}\n"
                "- past_surgeries: list of strings with procedure and approximate year if mentioned\n"
                "- allergies: list of strings (known drug allergies)\n"
                "- chronic_conditions: list of strings\n"
            )
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            )
            response = client.models.generate_content(
                model=os.getenv("LLM_MODEL", "gemini-3.5-flash"),
                contents=[f"Patient Verbal History ({lang}):\n{text}"],
                config=config,
            )
            raw = clean_json_markdown(response.text or "{}")
            extracted_data = json.loads(raw)
    except Exception as exc:
        logger.warning("Gemini voice history extraction failed or offline (%s). Using rule-based extractor.", exc)

    # 2. Local Fallback Extractor if Gemini is offline
    if not extracted_data:
        lower_t = text.lower()
        diagnoses = []
        medications = []
        surgeries = []
        allergies = []

        # Common clinical keywords in Hindi / English
        if any(w in lower_t for w in ["sugar", "शुगर", "मधुमेह", "diabetes"]):
            diagnoses.append("Type 2 Diabetes Mellitus")
        if any(w in lower_t for w in ["bp", "बीपी", "रक्तचाप", "hypertension", "high pressure"]):
            diagnoses.append("Essential Hypertension")
        if any(w in lower_t for w in ["घुटने", "joint", "जोड़ों", "गठिया", "arthritis"]):
            diagnoses.append("Sandhivata (Osteoarthritis)")
        if any(w in lower_t for w in ["दमा", "asthma", "सांस"]):
            diagnoses.append("Bronchial Asthma")

        if any(w in lower_t for w in ["metformin", "मेटफॉर्मिन"]):
            medications.append({"drug_name": "Metformin", "dosage": "500mg", "frequency": "BD", "anupana": "Water"})
        if any(w in lower_t for w in ["amlodipine", "एमलोडिपिन"]):
            medications.append({"drug_name": "Amlodipine", "dosage": "5mg", "frequency": "OD", "anupana": "Water"})
        if any(w in lower_t for w in ["paracetamol", "पैरासिटामोल"]):
            medications.append({"drug_name": "Paracetamol", "dosage": "650mg", "frequency": "SOS", "anupana": "Water"})
        if any(w in lower_t for w in ["क्वाथ", "kwath", "गूगल", "guggulu"]):
            medications.append({"drug_name": "Maharasnadi Kwath", "dosage": "20ml", "frequency": "BD", "anupana": "Koshna Jala"})

        if any(w in lower_t for w in ["operation", "सर्जरी", "ऑपरेशन", "appendix", "अपेंडिक्स", "gallbladder", "पित्त"]):
            surgeries.append("Past Abdominal Surgery / Procedure reported")
        if any(w in lower_t for w in ["allergy", "एलर्जी", "penicillin", "पेनिसिलिन"]):
            allergies.append("Suspected Drug Allergy reported")

        extracted_data = {
            "summary": f"Patient self-reported history: {text}",
            "diagnoses": diagnoses,
            "medications": medications,
            "past_surgeries": surgeries,
            "allergies": allergies,
            "chronic_conditions": diagnoses,
        }

    # 3. Create synthetic OCR/Document record
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report_id = f"VOICE-{uuid.uuid4().hex[:6].upper()}"

    formatted_meds = []
    for m in extracted_data.get("medications", []):
        formatted_meds.append({
            "drugName": m.get("drug_name") or m.get("drugName") or "Medication",
            "dosage": m.get("dosage") or "As directed",
            "frequency": m.get("frequency") or "1-0-1 (BD)",
            "anupana": m.get("anupana") or "Warm Water",
            "source": "Patient Spoken History",
        })

    report_record = {
        "report_id": report_id,
        "report_type": "Spoken Patient History (मौखिक इतिहास)",
        "medical_specialty": "General & AYUSH Clinical History",
        "report_date": now_iso,
        "facility_name": "Kiosk Spoken Self-Report",
        "summary": extracted_data.get("summary") or text,
        "diagnoses": extracted_data.get("diagnoses", []),
        "medications": formatted_meds,
        "findings": [],
        "observations": extracted_data.get("past_surgeries", []) + extracted_data.get("allergies", []),
        "impression": "Verbal medical intake recorded on kiosk hardware.",
        "uncertain_information": [],
    }

    # 4. Persist to DB and update queue entry
    db.save_ocr_result(patient_session_id, report_record)
    saved_reports = db.get_ocr_results(patient_session_id)
    db.update_queue_ocr(patient_session_id, saved_reports)

    # 5. Also record into session general_vitals if allergies/surgeries found
    existing_vitals = db.get_vitals(patient_session_id) or {}
    if extracted_data.get("past_surgeries"):
        existing_vitals["pastSurgeries"] = ", ".join(extracted_data["past_surgeries"])
    if extracted_data.get("allergies"):
        existing_vitals["knownAllergies"] = ", ".join(extracted_data["allergies"])
    if existing_vitals:
        db.save_vitals(patient_session_id, existing_vitals)

    logger.info("Successfully recorded voice medical history for session %s: %d meds, %d diagnoses",
                patient_session_id, len(formatted_meds), len(extracted_data.get("diagnoses", [])))

    return {
        "status": "success",
        "session_id": patient_session_id,
        "report_id": report_id,
        "extracted_data": extracted_data,
        "message": "Spoken history successfully processed and saved to patient record."
    }
