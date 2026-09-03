import logging
from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
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
    files: List[UploadFile] = File(..., description="Multiple medical report image files (JPEG, PNG, WebP, TIFF)"),
    report_grouping: Optional[str] = Form(
        None,
        description=(
            "Optional JSON string explicitly grouping filenames into reports, e.g. "
            '{"report_001": ["page1.jpg", "page2.jpg"]}'
        ),
    ),
):
    """
    Process multiple medical report images:
    1. Validates image types, integrity, and sizes
    2. Saves original images to storage/uploads/
    3. Groups images into individual reports
    4. Performs multimodal clinical extraction using Gemini
    5. Independently verifies extracted numbers against original images using Tesseract OCR
    6. Persists individual report JSONs in storage/results/reports/
    7. Synthesizes overall longitudinal patient history using Gemini
    8. Persists overall patient session JSON in storage/results/
    9. Returns processing confirmation with session ID and saved result path
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one medical report image must be uploaded.",
        )

    try:
        response = await report_service.process_all_reports(
            files=files,
            grouping_json=report_grouping,
        )
        return response
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
