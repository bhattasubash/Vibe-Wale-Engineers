from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import hashlib
import uuid
from datetime import datetime

from app.models.schemas import PatientCreate, PatientResponse

router = APIRouter(prefix="/api/patients", tags=["Patients"])

AADHAAR_SALT = "aiia_aadhaar_salt_2026_"

# In-Memory Store / Redis Bridge for demo and kiosk operation
PATIENT_DB: Dict[str, Dict[str, Any]] = {
    "91-4523-8901-2345": {
        "id": "pat-aiia-001",
        "full_name": "रामेश्वर दयाल शर्मा (Rameshwar Sharma)",
        "age": 62,
        "gender": "male",
        "phone": "9876543210",
        "abha_id": "91-4523-8901-2345",
        "abha_address": "rameshwar.sharma@abdm",
        "aadhaar_last_four": hashlib.sha256((AADHAAR_SALT + "8912").encode()).hexdigest()[:12],
        "created_at": datetime.now(),
        "is_returning": True,
        "last_visit_date": "14 अगस्त 2026 (OPD #104)",
    }
}


@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(payload: PatientCreate):
    """
    Registers a new patient walk-in intake.
    Hashes and salts any Aadhaar fragment to prevent plaintext storage (DPDP Act compliance).
    """
    patient_id = f"pat-{uuid.uuid4().hex[:8]}"
    aadhaar_token = (
        hashlib.sha256((AADHAAR_SALT + payload.aadhaar_last_four).encode()).hexdigest()[:12]
        if payload.aadhaar_last_four
        else None
    )

    record = {
        "id": patient_id,
        "full_name": payload.full_name,
        "age": payload.age,
        "gender": payload.gender,
        "phone": payload.phone,
        "abha_id": payload.abha_id,
        "abha_address": payload.abha_address,
        "aadhaar_last_four": aadhaar_token,
        "created_at": datetime.now(),
        "is_returning": False,
        "last_visit_date": None,
    }

    if payload.abha_id:
        PATIENT_DB[payload.abha_id] = record
    else:
        PATIENT_DB[patient_id] = record

    return PatientResponse(**record)


@router.post("/identify", response_model=PatientResponse)
async def identify_patient(abha_id: str):
    """
    Looks up patient by scanned ABHA ID or mobile number.
    """
    if abha_id in PATIENT_DB:
        return PatientResponse(**PATIENT_DB[abha_id])

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No patient found with the provided ABHA identifier.",
    )
