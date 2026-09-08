# AYUSH-Care MediKiosk — Fix Log

Permanent record of all issues fixed, what changed, and how each fix was verified.

---

### ISSUE 1: Database not connected — all data lives in volatile Python dicts, lost on restart
- **WHAT WAS WRONG:** All patient records, kiosk sessions, and doctor queues were stored in in-memory Python dictionaries (`PATIENT_DB`, `SESSION_DB`, `QUEUE_DB`). When the server restarted or scaled, all patient registrations, complaints, and queues were instantly lost. A dual-mode SQLite WAL / PostgreSQL configuration existed in `server/app/db/connection.py` but was completely bypassed by the routers.
- **WHAT I CHANGED:**
  - `server/app/db/connection.py`: Enhanced database schema with WAL mode and tables for `patients`, `sessions`, `session_socrates`, `session_vitals`, `prakriti_records`, `ocr_results`, `clinical_summaries`, and `queue_entries` with foreign keys and performance indexes. Configured `DATA_DIR` and `SQLITE_DB_PATH` environment overrides for persistent disk mounts in production.
  - `render.yaml`: Added `DATA_DIR` setting to ensure persistent disk compatibility in Render cloud deployments alongside existing `SUPABASE_DB_URL` PostgreSQL sync.
  - `server/app/db/repository.py`: Created complete Repository layer providing clean CRUD data access functions for all hospital entities.
  - `server/app/db/__init__.py`: Added package exports.
  - `server/app/routers/patients.py`: Wired patient registration and ABHA identification directly to persistent storage with returning-patient detection.
  - `server/app/routers/sessions.py`: Replaced `SESSION_DB` with database operations for session creation, complaint recording, and offline sync.
  - `server/app/routers/physician.py`: Replaced `QUEUE_DB` with database-backed queue queries, real stats aggregation, and added `GET /session/{session_id}` endpoint.
  - `server/app/routers/prakriti.py`: Persisted classical dosha assessment results to database.
  - `server/app/routers/documents.py`: Saved OCR reports to database and added `GET /{session_id}/results` endpoint.
  - `server/app/utils/file_validation.py`: Fixed missing `logger` import bug preventing error logging on corrupted images.
- **HOW I VERIFIED IT WORKS:**
  - Created and executed `server/test_db_persistence.py` testing database connectivity, direct repository CRUD, reconnecting clients, and full end-to-end FastAPI endpoint calls.
  - Executed literal server process restart test `server/verify_literal_restart.py`: spawned a real `uvicorn` server process on port 8011, POSTed a patient registration, hard-killed the server process, verified it was offline, started a fresh `uvicorn` process, and successfully queried the same patient and state via HTTP.
  - Executed the complete test suite with `pytest tests` (15/15 tests passing).
- **STATUS:** ✅ Fixed & verified

---

### ISSUE 2: OCR results disconnected from doctor view — pipeline works but output is never shown
- **WHAT WAS WRONG:**
  1. The kiosk frontend never populated `sessionId` in `useSessionStore` (`setSessionId` was never called anywhere in the app), causing document uploads and session dispatches to use disparate unlinked session identifiers.
  2. The OCR pipeline ran and wrote JSON to disk, but `DoctorSessionReview.tsx` never queried the backend for results. It only checked `patient?.documents` in local state, and if empty, silently rendered hardcoded mock Sandhivata data.
  3. `TokenScreen.tsx` only pushed patients to an in-memory browser store without persisting completed intake sessions to the database.
- **WHAT I CHANGED:**
  - `server/app/db/repository.py`: Added `update_queue_ocr` helper to automatically attach newly extracted medications, lab findings, and text summaries to the doctor's queue entry. Added `_ensure_session_exists` safeguards to protect foreign-key relationships.
  - `server/app/routers/documents.py`: Enhanced `_persist_pipeline_results` to update queue records on completion; expanded `GET /api/documents/{session_id}/results` to return structured aggregations (`all_medications`, `all_findings`, `all_diagnoses`, `combined_summary`).
  - `server/app/routers/sessions.py`: Added `POST /api/sessions/{session_id}/complete` to finalize patient intake, persist demographics, attach OCR documents, and queue the patient for the physician.
  - `client/src/stores/sessionStore.ts`: Added `getOrCreateSessionId()` action to guarantee a persistent, shared clinical session ID across all patient kiosk screens.
  - `client/src/pages/patient/WelcomeScreen.tsx`: Initialized `sessionId` upon patient start.
  - `client/src/pages/patient/ComplaintScreen.tsx`: Synchronized `sessionId` with Gemini complaint inference responses.
  - `client/src/pages/patient/CameraUploadScreen.tsx`: Tied prescription photo uploads directly to `activeSessionId` with `sync=true` processing. Added prominent animated viewfinder scanning overlay (`Loader2`, pulse progress bar, bilingual instructions) and disabled all action buttons during upload to prevent double-submitting and patient confusion.
  - `client/src/pages/patient/TokenScreen.tsx`: Dispatched complete patient intake payload to `POST /api/sessions/{sessionId}/complete` with real captured document references.
  - `client/src/pages/physician/DoctorQueueScreen.tsx`: Replaced one-off mount fetch with an active 3.5-second recurring polling loop (`setInterval`), automatic background doctor authentication token acquisition, a live pulsating status pill (`🟢 Live Sync Active 3.5s`), and a manual "Refresh" button.
  - `client/src/pages/physician/DoctorSessionReview.tsx`: Added live OCR result fetching from `GET /api/documents/{sessionId}/results`, mapping real extracted medications, lab findings, verified test values, and raw OCR text, accompanied by a visual "Live Gemini + Tesseract Verified" status badge.
- **HOW I VERIFIED IT WORKS:**
  - Created and executed end-to-end integration test `server/test_ocr_to_doctor_flow.py`: created session `SES-OCR-TEST-LIVE`, uploaded real clinical sample report `CamScanner 09-03-2026 01.07 (2)_page-0001.jpg`, ran dual-engine OCR pipeline, completed session intake, queried `GET /api/documents/{session_id}/results`, verified 3 extracted medications (Maharasnadi Kwath, Yogaraj Guggulu, Shallaki), 3 verified lab biomarkers (Hemoglobin, Serum Uric Acid, elevated ESR), and verified the physician review endpoint returned matching records.
  - Created and executed real-time queue polling trace test `server/test_realtime_queue_polling.py`: polled the doctor's queue, completed an independent kiosk intake on a separate session `#AIIA-LIVE-088`, verified that on the subsequent poll the patient immediately appeared in the queue without manual page reload, and confirmed doctor review acceptance.
  - Executed frontend TypeScript typecheck (`tsc --noEmit`) with 0 errors.
  - Executed full frontend production build (`vite build`) successfully creating deployment bundles in 15.94s with 0 errors.
- **STATUS:** ✅ Fixed & verified


