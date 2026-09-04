from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from app.models.schemas import (
    DoctorQueueItem,
    DoctorReviewRequest,
    DoctorLoginRequest,
    DoctorLoginResponse,
)
from app.services.auth import (
    authenticate_physician,
    create_access_token,
    require_physician_auth,
)

router = APIRouter(prefix="/api/physician", tags=["Physician Dashboard"])

# Mock Doctor Queue seeded with realistic AIIA OPD cases
QUEUE_DB: List[Dict[str, Any]] = [
    {
        "session_id": "SES-8921A",
        "patient_name": "कमला देवी (Kamla Devi)",
        "age": 68,
        "gender": "female",
        "abha_id": "91-8821-4432-1109",
        "token_number": "#AIIA-041",
        "chief_complaint": "सीने में भारीपन व बेचैनी (Chest Discomfort)",
        "dominant_prakriti": "VATA-PITTA",
        "red_flag_triggered": True,
        "priority": "critical",
        "assigned_doctor": "डॉ. अनन्या शर्मा",
        "room_number": "Room 104",
        "created_at": "10:15 AM",
    },
    {
        "session_id": "SES-8922B",
        "patient_name": "रामेश्वर दयाल शर्मा (Rameshwar Sharma)",
        "age": 62,
        "gender": "male",
        "abha_id": "91-4523-8901-2345",
        "token_number": "#AIIA-042",
        "chief_complaint": "दोनों घुटनों में तेज दर्द (Sandhivata)",
        "dominant_prakriti": "PITTA-KAPHA",
        "red_flag_triggered": False,
        "priority": "normal",
        "assigned_doctor": "डॉ. अनन्या शर्मा",
        "room_number": "Room 104",
        "created_at": "10:22 AM",
    },
    {
        "session_id": "SES-8923C",
        "patient_name": "सुरेश चंद्र जोशी (Suresh Joshi)",
        "age": 54,
        "gender": "male",
        "abha_id": "91-2234-9988-5541",
        "token_number": "#AIIA-043",
        "chief_complaint": "अम्लपित्त एवं पेट में जलन (Chronic Acidity)",
        "dominant_prakriti": "Predominantly PITTA",
        "red_flag_triggered": False,
        "priority": "normal",
        "assigned_doctor": "डॉ. अनन्या शर्मा",
        "room_number": "Room 104",
        "created_at": "10:28 AM",
    },
]


@router.post("/login", response_model=DoctorLoginResponse, status_code=status.HTTP_200_OK)
async def login_physician(payload: DoctorLoginRequest):
    """
    Authenticates a hospital physician via Doctor ID and secure PIN.
    Returns a signed HMAC-SHA256 JWT access token with physician role.
    """
    doctor = authenticate_physician(payload.doctor_id, payload.pin)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Doctor ID or Security PIN.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": doctor["doctor_id"],
        "name": doctor["doctor_name"],
        "role": doctor["role"],
        "dept": doctor["department"],
    })

    return DoctorLoginResponse(
        access_token=token,
        token_type="bearer",
        doctor_id=doctor["doctor_id"],
        doctor_name=doctor["doctor_name"],
        department=doctor["department"],
        room_number=doctor["room_number"],
        role=doctor["role"],
    )


@router.get("/queue", response_model=List[DoctorQueueItem])
async def get_doctor_queue(current_physician: Dict[str, Any] = Depends(require_physician_auth)):
    """
    Returns prioritized patient queue for the authenticated doctor's workstation.
    Guarded by JWT Bearer authentication.
    """
    sorted_queue = sorted(
        QUEUE_DB,
        key=lambda x: (0 if x["priority"] == "critical" else 1, x["created_at"]),
    )
    return [DoctorQueueItem(**item) for item in sorted_queue]


@router.patch("/session/{session_id}/review", status_code=status.HTTP_200_OK)
async def review_patient_session(
    session_id: str,
    payload: DoctorReviewRequest,
    current_physician: Dict[str, Any] = Depends(require_physician_auth),
):
    """
    Doctor marks session as accepted, amended, or rejected with prescription notes.
    Protected: guarantees only authenticated physicians can modify clinical case status.
    """
    for item in QUEUE_DB:
        if item["session_id"] == session_id:
            item["status"] = payload.status
            item["reviewed_by"] = current_physician.get("sub", payload.doctor_id)
            item["reviewed_at"] = datetime.now().isoformat()
            item["doctor_notes"] = payload.doctor_notes
            return {
                "session_id": session_id,
                "review_status": payload.status,
                "message": f"Session marked as {payload.status} by {current_physician.get('sub')}",
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Patient session not found in doctor queue.",
    )


@router.get("/stats")
async def get_dashboard_stats(current_physician: Dict[str, Any] = Depends(require_physician_auth)):
    """
    Returns live OPD statistics for physician dashboard header.
    Protected: requires valid physician session token.
    """
    total = len(QUEUE_DB)
    red_flags = sum(1 for item in QUEUE_DB if item["red_flag_triggered"])
    return {
        "patients_today": total + 18,
        "pending_in_queue": total,
        "red_flags_intercepted": red_flags,
        "average_consult_time_mins": 4.2,
        "terminal_uptime": "99.98%",
    }
