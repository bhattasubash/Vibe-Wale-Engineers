from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from app.models.schemas import DoctorQueueItem, DoctorReviewRequest

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


@router.get("/queue", response_model=List[DoctorQueueItem])
async def get_doctor_queue(doctor_id: str = "DOC-AIIA-104"):
    """
    Returns prioritized patient queue for the doctor's workstation.
    Critical Red-Flag emergency cases are automatically sorted to the top.
    """
    sorted_queue = sorted(
        QUEUE_DB,
        key=lambda x: (0 if x["priority"] == "critical" else 1, x["created_at"]),
    )
    return [DoctorQueueItem(**item) for item in sorted_queue]


@router.patch("/session/{session_id}/review", status_code=status.HTTP_200_OK)
async def review_patient_session(session_id: str, payload: DoctorReviewRequest):
    """
    Doctor marks session as accepted, amended, or rejected with prescription notes.
    """
    for item in QUEUE_DB:
        if item["session_id"] == session_id:
            item["status"] = payload.status
            item["reviewed_by"] = payload.doctor_id
            item["reviewed_at"] = datetime.now().isoformat()
            item["doctor_notes"] = payload.doctor_notes
            return {
                "session_id": session_id,
                "review_status": payload.status,
                "message": f"Session marked as {payload.status} by {payload.doctor_id}",
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Patient session not found in doctor queue.",
    )


@router.get("/stats")
async def get_dashboard_stats():
    """
    Returns live OPD statistics for physician dashboard header.
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
