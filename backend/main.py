import json
import logging
import uuid
from typing import List, Optional
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.models.schemas import ProcessReportsResponse
from backend.services.ocr_service import ocr_service
from backend.services.report_service import report_service
from backend.kiosk.routers import patients, sessions, prakriti, physician

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pre_medical_summarizer")

app = FastAPI(
    title="Pre-Medical Report Summarizer & Kiosk API",
    description=(
        "Backend MVP for Pre-Medical Report Summarizer and AYUSH Kiosk. Receives multiple medical report images, "
        "extracts clinical data via Gemini multimodal understanding, independently verifies numerical "
        "values against original images using Tesseract OCR, and stores structured JSON outputs."
    ),
    version="1.0.0",
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Kiosk Routers
app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(prakriti.router)
app.include_router(physician.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint displaying system readiness and component availability."""
    tesseract_available = ocr_service.is_tesseract_available()
    gemini_key_configured = bool(
        settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here"
    )

    return {
        "status": "healthy",
        "tesseract_ocr_available": tesseract_available,
        "gemini_api_configured": gemini_key_configured,
        "gemini_model": settings.GEMINI_MODEL,
        "confidence_threshold": settings.TESSERACT_CONFIDENCE_THRESHOLD,
        "storage_uploads_dir": str(settings.uploads_dir),
        "storage_results_dir": str(settings.results_dir),
    }


@app.post(
    "/api/process-reports",
    response_model=ProcessReportsResponse,
    status_code=status.HTTP_200_OK,
    tags=["Reports"],
)
async def process_reports(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Multiple medical report image files (JPEG, PNG, WebP, TIFF)"),
    report_grouping: Optional[str] = Form(
        None,
        description=(
            "Optional JSON string explicitly grouping filenames into reports, e.g. "
            '{"report_001": ["page1.jpg", "page2.jpg"]}'
        ),
    ),
    patient_session_id: Optional[str] = Form(
        None,
        description="Optional existing patient session ID (e.g. from Kiosk)",
    ),
    sync: bool = Form(
        False,
        description="If True, process synchronously; if False, process in background and return immediately.",
    ),
):
    """
    Process multiple medical report images:
    1. Validates image types, integrity, and sizes
    2. Writes files to an isolated ephemeral temporary directory
    3. If sync=True: executes Gemini multimodal extraction and Tesseract OCR verification synchronously
    4. If sync=False (default for kiosk): dispatches processing pipeline via BackgroundTasks and returns immediately
    5. In all cases, raw images and ephemeral storage are guaranteed to be auto-purged on completion
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one medical report image must be uploaded.",
        )

    session_id = patient_session_id or f"session_{uuid.uuid4().hex[:10]}"

    try:
        grouping_spec = None
        if report_grouping:
            try:
                grouping_spec = json.loads(report_grouping)
            except Exception as exc:
                logger.warning("Could not parse grouping JSON: %s", exc)

        # Save files to ephemeral temp directory
        temp_dir, image_metas = await report_service.save_uploaded_files_ephemeral(
            files=files,
            patient_session_id=session_id,
            grouping_spec=grouping_spec,
        )

        if sync:
            return report_service.process_pipeline_and_cleanup(
                temp_dir=temp_dir,
                image_metas=image_metas,
                patient_session_id=session_id,
            )

        # Queue background processing and return immediately
        background_tasks.add_task(
            report_service.process_pipeline_and_cleanup,
            temp_dir=temp_dir,
            image_metas=image_metas,
            patient_session_id=session_id,
        )

        return ProcessReportsResponse(
            status="queued",
            patient_session_id=session_id,
            reports_processed=0,
            result_file=None,
            message="Report images received and saved to ephemeral storage. Extraction & OCR verification queued in background.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error occurred while processing reports: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during report processing: {str(exc)}",
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error_type": type(exc).__name__,
        },
    )
