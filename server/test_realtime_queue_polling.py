import os
import sys
import time
from pathlib import Path
from fastapi.testclient import TestClient

server_root = Path(__file__).resolve().parent
sys.path.insert(0, str(server_root))
sys.stdout.reconfigure(encoding='utf-8')

from app.main import app

def test_realtime_queue_polling():
    client = TestClient(app)

    # 1. Doctor logs in and obtains token
    login_res = client.post("/api/physician/login", json={
        "doctor_id": "DOC-AIIA-104",
        "pin": "1234"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Initial Queue Poll
    initial_poll = client.get("/api/physician/queue", headers=headers)
    assert initial_poll.status_code == 200
    initial_queue = initial_poll.json()
    initial_count = len(initial_queue)
    print(f"[Queue Poll #1]: Doctor has {initial_count} patients in queue.")

    # 3. Patient completes intake at kiosk independently
    poll_session_id = f"SES-POLL-{int(time.time())}"
    token_num = "#AIIA-LIVE-088"
    print(f"[Kiosk Action]: Patient arrives and finishes intake at Kiosk with token {token_num}...")
    complete_res = client.post(f"/api/sessions/{poll_session_id}/complete", json={
        "patient_name": "हरिप्रसाद चौरसिया (Hariprasad Chaurasia)",
        "age": 59,
        "gender": "male",
        "phone": "9811334455",
        "abha_id": "91-3322-1100-9988",
        "token_number": token_num,
        "chief_complaint": "घुटने में असहनीय दर्द व सूजन (Severe knee pain & swelling)",
        "treatment_mode": "ayurveda",
        "assigned_doctor": "डॉ. अनन्या शर्मा",
        "room_number": "Room 104",
        "red_flag_triggered": False,
    })
    assert complete_res.status_code == 200

    # 4. Next automated poll (simulates the 3.5s interval)
    print("[Queue Poll #2]: Active polling cycle fires (simulating 3.5s interval)...")
    second_poll = client.get("/api/physician/queue", headers=headers)
    assert second_poll.status_code == 200
    updated_queue = second_poll.json()
    assert len(updated_queue) == initial_count + 1
    
    # Locate the new patient in the polled queue
    new_patient = next((p for p in updated_queue if p["session_id"] == poll_session_id), None)
    assert new_patient is not None, "New patient not found in live polled queue!"
    assert new_patient["patient_name"] == "हरिप्रसाद चौरसिया (Hariprasad Chaurasia)"
    assert new_patient["token_number"] == token_num
    print(f"SUCCESS: New patient {new_patient['token_number']} ({new_patient['patient_name']}) instantly appeared in live queue!")

    # 5. Doctor reviews patient
    review_res = client.patch(
        f"/api/physician/session/{poll_session_id}/review",
        headers=headers,
        json={
            "status": "accepted",
            "doctor_notes": "जानु बस्ति व शल्लाकी दी गई।",
            "doctor_id": "DOC-AIIA-104",
        }
    )
    assert review_res.status_code == 200
    print("Doctor reviewed and accepted patient session.")

    print("\n*** REAL-TIME QUEUE POLLING TRACE TEST PASSED 100%! ***\n")

if __name__ == "__main__":
    test_realtime_queue_polling()
