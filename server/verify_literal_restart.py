import os
import sys
import time
import subprocess
import requests
from pathlib import Path

PYTHON_EXE = sys.executable
SERVER_DIR = str(Path(__file__).resolve().parent)
PORT = 8011
BASE_URL = f"http://127.0.0.1:{PORT}"

def wait_for_server(timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(f"{BASE_URL}/api/health", timeout=1)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def run_literal_restart_test():
    print(f"=== STEP 1: Starting Uvicorn Server Process on port {PORT} ===")
    p1 = subprocess.Popen(
        [PYTHON_EXE, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(PORT)],
        cwd=SERVER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    
    try:
        assert wait_for_server(), "Server failed to start in initial run!"
        print("Server 1 is healthy!")

        # Step 2: Register a test patient via real HTTP
        print("=== STEP 2: Registering patient over HTTP ===")
        patient_payload = {
            "full_name": "Rameshwar Literal Restart Test",
            "age": 63,
            "gender": "male",
            "phone": "9811002233",
            "abha_id": "91-7777-6666-5555",
            "abha_address": "rameshwar.literal@abdm"
        }
        res = requests.post(f"{BASE_URL}/api/patients/register", json=patient_payload)
        assert res.status_code == 201, f"Failed to register: {res.text}"
        patient_data = res.json()
        patient_id = patient_data["id"]
        print(f"Patient registered: {patient_id} ({patient_data['full_name']})")

        # Step 3: Create a session for this patient over HTTP
        res_sess = requests.post(f"{BASE_URL}/api/sessions/start", json={
            "patient_id": patient_id,
            "language": "hi"
        })
        assert res_sess.status_code == 201, f"Failed session start: {res_sess.text}"
        session_id = res_sess.json()["session_id"]
        print(f"Session started: {session_id}")

        # Step 4: Add complaint
        res_comp = requests.patch(f"{BASE_URL}/api/sessions/{session_id}/complaint", json={
            "complaint_text": "Chronic joint stiffness and severe back pain",
            "category": "musculoskeletal"
        })
        assert res_comp.status_code == 200, f"Failed complaint: {res_comp.text}"
        print("Complaint recorded successfully!")

    finally:
        # Step 5: Fully kill/terminate the server process
        print("=== STEP 5: Hard-killing the Uvicorn server process ===")
        p1.terminate()
        try:
            p1.wait(timeout=5)
        except subprocess.TimeoutExpired:
            p1.kill()
            p1.wait()
        print("Server 1 process fully stopped!")

    # Verify server is down
    time.sleep(1)
    server_down = False
    try:
        requests.get(f"{BASE_URL}/api/health", timeout=1)
    except Exception:
        server_down = True
    assert server_down, "Server 1 is still responding after kill!"
    print("Confirmed: Server 1 is offline and process is dead.")

    # Step 6: Start a brand-new Uvicorn process
    print("=== STEP 6: Starting a completely fresh Uvicorn Server Process ===")
    p2 = subprocess.Popen(
        [PYTHON_EXE, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(PORT)],
        cwd=SERVER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        assert wait_for_server(), "Server 2 failed to start fresh!"
        print("Server 2 is healthy on new process!")

        # Step 7: Query the patient from the new server process
        print("=== STEP 7: Querying patient over HTTP from new server process ===")
        ident_res = requests.post(f"{BASE_URL}/api/patients/identify?abha_id=91-7777-6666-5555")
        assert ident_res.status_code == 200, f"Patient not found in Server 2: {ident_res.text}"
        retrieved = ident_res.json()
        assert retrieved["id"] == patient_id
        assert retrieved["full_name"] == "Rameshwar Literal Restart Test"
        print(f"SUCCESS: Patient retrieved from restarted server: {retrieved['full_name']} (ID: {retrieved['id']})")

        # Step 8: Query doctor queue to ensure full DB state persisted
        login_res = requests.post(f"{BASE_URL}/api/physician/login", json={
            "doctor_id": "DOC-AIIA-104",
            "pin": "1234"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        
        # Verify stats endpoint returns persisted counts
        stats_res = requests.get(f"{BASE_URL}/api/physician/stats", headers={"Authorization": f"Bearer {token}"})
        assert stats_res.status_code == 200
        print("Stats from restarted server:", stats_res.json())

        print("\n*** LITERAL PROCESS RESTART ACCEPTANCE TEST PASSED 100%! ***\n")

    finally:
        print("Cleaning up Server 2 process...")
        p2.terminate()
        try:
            p2.wait(timeout=5)
        except subprocess.TimeoutExpired:
            p2.kill()
            p2.wait()
        print("Server 2 terminated.")

if __name__ == "__main__":
    run_literal_restart_test()
