"""
AYUSH-Care (MediKiosk) Enterprise Backend Entrypoint.
FastAPI 0.100+ Gateway with GIGW & DPDP Act 2023 compliance.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from backend.kiosk.routers import patients, sessions, prakriti, physician

app = FastAPI(
    title="AYUSH-Care Clinical Kiosk API",
    description="Enterprise OPD Triage & Deterministic Prakriti Calculation Engine for AIIA",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for Kiosk Terminal & Physician Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restricted in production to hospital domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}ms"
    return response


# Register Core Gateway Routers
app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(prakriti.router)
app.include_router(physician.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for hospital load balancers and system monitoring.
    """
    return {
        "status": "healthy",
        "service": "ayush-care-kiosk-api",
        "version": "2.0.0",
        "timestamp": time.time(),
        "dpdp_compliance": "ACTIVE_EPHEMERAL_MODE",
    }
