"""
AYUSH-Care (MediKiosk) Enterprise Backend Entrypoint.
FastAPI 0.100+ Gateway with GIGW & DPDP Act 2023 compliance.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time

from app.routers import patients, sessions, prakriti, physician, documents

ENV = os.getenv("ENVIRONMENT", "development").lower()
is_dev = ENV in ("development", "dev", "local")

app = FastAPI(
    title="AYUSH-Care Clinical Kiosk API",
    description="Enterprise OPD Triage, Dual-Engine OCR & Deterministic Prakriti Calculation Engine for AIIA",
    version="2.0.0",
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
)

# CORS configuration: strict explicit origins from env var (disallows wildcard with credentials)
cors_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://bhattasubash.github.io"
)
allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Session-ID", "Accept"],
)


@app.middleware("http")
async def security_and_timing_headers(request: Request, call_next):
    """
    Applies GIGW & OWASP recommended baseline security headers and process timer.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # Security & Privacy Headers
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}ms"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response


from app.db.connection import get_db_status

# Register Core Gateway Routers
app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(prakriti.router)
app.include_router(physician.router)
app.include_router(documents.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for hospital load balancers and system monitoring.
    Includes active database connectivity verification.
    """
    return {
        "status": "healthy",
        "service": "ayush-care-kiosk-api",
        "version": "2.0.0",
        "timestamp": time.time(),
        "dpdp_compliance": "ACTIVE_EPHEMERAL_MODE",
        "database": get_db_status(),
    }
