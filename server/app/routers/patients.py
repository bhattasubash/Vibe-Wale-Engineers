import hashlib
import os
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import PatientCreate, PatientResponse
from app.db import repository as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/patients", tags=["Patients"])

# Aadhaar salt loaded from environment variable (never hardcoded in production)
AADHAAR_SALT = os.getenv("AADHAAR_SALT", "aiia_aadhaar_salt_dev_only_")


@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(payload: PatientCreate):
    """
    Registers a new patient walk-in intake.
    Hashes and salts any Aadhaar fragment to prevent plaintext storage (DPDP Act compliance).
    """
    patient_id = f"pat-{uuid.uuid4().hex[:8]}"
    aadhaar_hash = (
        hashlib.sha256((AADHAAR_SALT + payload.aadhaar_last_four).encode()).hexdigest()[:12]
        if payload.aadhaar_last_four
        else None
    )

    # Check if patient already exists by ABHA ID
    if payload.abha_id:
        existing = db.find_patient_by_abha(payload.abha_id)
        if existing:
            # Returning patient — update and return
            existing["is_returning"] = True
            existing["last_visit_date"] = datetime.now(timezone.utc).strftime("%d %b %Y")
            db.save_patient(existing)
            return PatientResponse(
                id=existing["id"],
                full_name=existing["full_name"],
                age=existing["age"],
                gender=existing["gender"],
                phone=existing.get("phone"),
                abha_id=existing.get("abha_id"),
                abha_address=existing.get("abha_address"),
                aadhaar_last_four=None,  # Never return hash as aadhaar_last_four
                created_at=existing.get("created_at", datetime.now(timezone.utc)),
                is_returning=True,
                last_visit_date=existing.get("last_visit_date"),
            )

    record = {
        "id": patient_id,
        "full_name": payload.full_name,
        "age": payload.age,
        "gender": payload.gender,
        "phone": payload.phone,
        "abha_id": payload.abha_id,
        "abha_address": payload.abha_address,
        "aadhaar_hash": aadhaar_hash,
        "is_returning": False,
        "last_visit_date": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    db.save_patient(record)
    logger.info("Registered new patient %s", patient_id)

    return PatientResponse(
        id=patient_id,
        full_name=payload.full_name,
        age=payload.age,
        gender=payload.gender,
        phone=payload.phone,
        abha_id=payload.abha_id,
        abha_address=payload.abha_address,
        aadhaar_last_four=None,
        created_at=datetime.now(timezone.utc),
        is_returning=False,
        last_visit_date=None,
    )


@router.post("/identify", response_model=PatientResponse)
async def identify_patient(abha_id: str):
    """
    Looks up patient by scanned ABHA ID.
    """
    patient = db.find_patient_by_abha(abha_id)
    if patient:
        return PatientResponse(
            id=patient["id"],
            full_name=patient["full_name"],
            age=patient["age"],
            gender=patient["gender"],
            phone=patient.get("phone"),
            abha_id=patient.get("abha_id"),
            abha_address=patient.get("abha_address"),
            aadhaar_last_four=None,
            created_at=patient.get("created_at", datetime.now(timezone.utc)),
            is_returning=bool(patient.get("is_returning")),
            last_visit_date=patient.get("last_visit_date"),
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No patient found with the provided ABHA identifier.",
    )
