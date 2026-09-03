from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import uuid
from datetime import datetime

from backend.kiosk.models.schemas import PatientCreate, PatientResponse

router = APIRouter(prefix="/api/patients", tags=["Patients"])

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
        "aadhaar_last_four": "8912",
        "created_at": datetime.now(),
        "is_returning": True,
        "last_visit_date": "14 अगस्त 2026 (OPD #104)",
    }
}


@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(payload: PatientCreate):
    """
    Registers a new patient walk-in intake.
    """
    patient_id = f"pat-{uuid.uuid4().hex[:8]}"
    record = {
        "id": patient_id,
        "full_name": payload.full_name,
        "age": payload.age,
        "gender": payload.gender,
        "phone": payload.phone,
        "abha_id": payload.abha_id,
        "abha_address": payload.abha_address,
        "aadhaar_last_four": payload.aadhaar_last_four,
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
