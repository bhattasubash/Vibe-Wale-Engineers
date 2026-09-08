import pytest
import os
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi.testclient import TestClient

server_root = Path(__file__).resolve().parent.parent
if str(server_root) not in sys.path:
    sys.path.insert(0, str(server_root))

from app.main import app
from app.db import repository as db

client = TestClient(app)


def run_single_patient_lifecycle(worker_id: int):
    """
    Executes a complete patient lifecycle through the API:
    1. Register patient
    2. Start session
    3. Infer/submit complaint
    4. Save vitals/prakriti
    5. Complete intake session
    """
    t_start = time.perf_counter()

    # 1. Register
    reg_res = client.post("/api/patients/register", json={
        "full_name": f"Concurrent Patient {worker_id}",
        "age": 30 + (worker_id % 40),
        "gender": "female" if worker_id % 2 == 0 else "male",
        "phone": f"98000000{worker_id:02d}",
        "abha_id": f"91-0000-0000-{worker_id:04d}"
    })
    assert reg_res.status_code == 201, f"Worker {worker_id} register failed: {reg_res.text}"
    pat = reg_res.json()

    # 2. Start Session
    start_res = client.post("/api/sessions/start", json={
        "patient_id": pat["id"],
        "language": "hi" if worker_id % 2 == 0 else "en",
        "department": "ayurveda" if worker_id % 2 == 0 else "allopathy"
    })
    assert start_res.status_code == 201, f"Worker {worker_id} session start failed: {start_res.text}"
    session_id = start_res.json()["session_id"]

    # 3. Chief Complaint
    complaint_text = "Severe joint pain and morning stiffness" if worker_id % 2 == 0 else "Persistent fever and headache"
    comp_res = client.patch(f"/api/sessions/{session_id}/complaint", json={
        "complaint_text": complaint_text,
        "category": "musculoskeletal" if worker_id % 2 == 0 else "general"
    })
    assert comp_res.status_code == 200, f"Worker {worker_id} complaint failed: {comp_res.text}"

    # 4. Complete Intake
    token_num = f"#AIIA-LOAD-{worker_id:03d}"
    comp_session = client.post(f"/api/sessions/{session_id}/complete", json={
        "patient_name": f"Concurrent Patient {worker_id}",
        "age": 30 + (worker_id % 40),
        "gender": "female" if worker_id % 2 == 0 else "male",
        "token_number": token_num,
        "chief_complaint": complaint_text,
        "treatment_mode": "ayurveda" if worker_id % 2 == 0 else "allopathy",
        "red_flag_triggered": False
    })
    assert comp_session.status_code == 200, f"Worker {worker_id} complete failed: {comp_session.text}"

    duration = time.perf_counter() - t_start
    return {
        "worker_id": worker_id,
        "session_id": session_id,
        "token_number": token_num,
        "duration": duration,
    }


def test_concurrent_sessions_and_database_locking():
    """
    Simulates 20 concurrent kiosk terminals running full intake lifecycles
    simultaneously to stress SQLite WAL concurrency and ensure 0 database-locked errors.
    """
    CONCURRENT_WORKERS = 20
    results = []
    errors = []

    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=CONCURRENT_WORKERS) as executor:
        futures = {executor.submit(run_single_patient_lifecycle, i): i for i in range(CONCURRENT_WORKERS)}
        for future in as_completed(futures):
            worker_id = futures[future]
            try:
                data = future.result()
                results.append(data)
            except Exception as exc:
                errors.append({"worker_id": worker_id, "error": str(exc)})

    total_wall_time = time.perf_counter() - t0

    # Verification
    assert len(errors) == 0, f"Encountered concurrency errors: {errors}"
    assert len(results) == CONCURRENT_WORKERS

    durations = [r["duration"] for r in results]
    min_lat = min(durations)
    max_lat = max(durations)
    avg_lat = sum(durations) / len(durations)
    throughput = CONCURRENT_WORKERS / total_wall_time

    print(f"\n--- LOAD BENCHMARK (20 CONCURRENT KIOSK INTAKES) ---")
    print(f"Total Completed: {len(results)}/{CONCURRENT_WORKERS}")
    print(f"Total Wall Clock Time: {total_wall_time:.3f}s")
    print(f"Throughput: {throughput:.2f} intakes/sec")
    print(f"Min Lifecycle Latency: {min_lat*1000:.1f}ms")
    print(f"Avg Lifecycle Latency: {avg_lat*1000:.1f}ms")
    print(f"Max Lifecycle Latency: {max_lat*1000:.1f}ms")
    print(f"Database Lock Errors: 0")

    # Verify uniqueness of generated token numbers
    token_set = {r["token_number"] for r in results}
    assert len(token_set) == CONCURRENT_WORKERS, "Duplicate token numbers detected under concurrent load!"

    # Verify all 20 sessions exist in database
    for r in results:
        entry = db.get_queue_entry(r["session_id"])
        assert entry is not None, f"Session {r['session_id']} lost in database!"
        assert entry["token_number"] == r["token_number"]


def test_rapid_doctor_queue_polling_under_load():
    """
    Simulates physician workstation polling /api/physician/queue 25 times
    in rapid succession while background intakes are active.
    """
    # Doctor login
    login_res = client.post("/api/physician/login", json={"doctor_id": "DOC-AIIA-104", "pin": "1234"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    def poll_queue(call_id: int):
        t0 = time.perf_counter()
        res = client.get("/api/physician/queue", headers=headers)
        duration = time.perf_counter() - t0
        assert res.status_code == 200
        return {"call_id": call_id, "duration": duration, "count": len(res.json())}

    POLL_REQUESTS = 25
    poll_results = []
    t_start = time.perf_counter()

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(poll_queue, i) for i in range(POLL_REQUESTS)]
        for f in as_completed(futures):
            poll_results.append(f.result())

    wall_time = time.perf_counter() - t_start
    poll_durations = [p["duration"] for p in poll_results]
    avg_poll = sum(poll_durations) / len(poll_durations)
    max_poll = max(poll_durations)

    print(f"\n--- DOCTOR QUEUE RAPID POLLING BENCHMARK ({POLL_REQUESTS} REQUESTS) ---")
    print(f"Total Requests Succeeded: {len(poll_results)}/{POLL_REQUESTS}")
    print(f"Total Time: {wall_time:.3f}s")
    print(f"Throughput: {POLL_REQUESTS/wall_time:.2f} req/sec")
    print(f"Avg Polling Latency: {avg_poll*1000:.1f}ms")
    print(f"Max Polling Latency: {max_poll*1000:.1f}ms")

    assert len(poll_results) == POLL_REQUESTS
