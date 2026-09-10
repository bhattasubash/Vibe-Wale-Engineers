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

---

### ISSUE 3: Silent voice guidance, voice intake not transcribing ("showing nothing"), and Gemini asking random/unrelated questions
- **WHAT WAS WRONG:**
  1. **Voice Guidance Silent on Screens:**
     - `client/src/components/ui/AudioSpeaker.tsx` evaluated `if (bilingual && hindiText && englishText) ... else if (text)`. Screens passed `bilingual={language === 'hi'}`. When English was chosen, `bilingual` was `false` and `text` was undefined, resulting in 100% silent output for English across all patient screens.
     - `client/src/lib/speech.ts` attempted to stream audio directly from Google Translate's external URL in the browser, triggering CORS failures, 403 Forbidden blocks, or failing silently on Windows OS where Chromium lacks native Hindi SAPI5 voices.
     - Several screens omitted voice triggers or failed to update speech when advancing turn-by-turn.
  2. **Voice Intake Transcribing Nothing:**
     - `server/app/services/whisprflow_service.py` strictly called Wispr Flow, but `WISPRFLOW_API_KEY` was completely unconfigured in `.env`. Calls to `POST /api/sessions/transcribe` failed with `success: false, text: ""`, discarding patient audio.
     - `client/src/pages/patient/ComplaintScreen.tsx` ran `audioRecorder.start()` (`getUserMedia`) and `webkitSpeechRecognition.start()` concurrently, causing microphone stream locking in Windows WASAPI.
     - Web Speech API handler iterated only from `event.resultIndex` while clearing `finalTranscript`, dropping earlier words.
     - `client/src/lib/audioRecorder.ts` directly connected `processor.connect(audioContext.destination)`, creating speaker-to-mic loopback feedback and triggering audio gating.
  3. **Gemini Questions Random / Unrelated to Disease:**
     - `LLM_MODEL=gemini-3.5-flash` in `.env` was rejected by the Gemini API, causing `ComplaintInferenceService` to throw an exception and silently fall back to `_local_fallback_inference`.
     - The local fallback only possessed 4 hardcoded question sets (`joint_pain`, `digestive_acidity`, `respiratory_cough`, `skin_dermatology`). Any other complaint (e.g. migraine, headache, acute fever, chills, diabetes, high blood pressure, etc.) resulted in 0 keyword hits and dumped the exact same 5 generic body/timing questions every single time.
     - The Gemini system instruction explicitly restricted questions to generic SOCRATES categories (`key ('site', 'onset', 'severity', 'timing', 'history')`) instead of disease-specific clinical differentiators.
- **WHAT I CHANGED:**
  1. **High-Performance Backend TTS Service:**
     - `server/app/routers/tts.py`: Created high-performance `GET /api/tts` endpoint using `gTTS` with sub-5ms in-memory audio caching, streaming clear Google female Hindi and English MP3 audio directly to browsers without CORS or Windows voice-pack issues.
     - `server/app/main.py`: Registered `tts.router` in FastAPI.
     - `client/src/lib/speech.ts`: Wired `speechEngine` to play from `/api/tts` with automatic browser `SpeechSynthesisUtterance` fallback, added Hindi & English voice matching, and global interaction-based AudioContext unlock.
     - `client/src/components/ui/AudioSpeaker.tsx`: Updated language resolution to automatically speak in the user's active language (`language === 'hi' ? hindiText : englishText`), re-triggering smoothly on prop changes.
     - Updated all 11 patient screens (`WelcomeScreen`, `LanguageScreen`, `IdentifyScreen`, `DepartmentScreen`, `ConsentScreen`, `ComplaintScreen`, `SocratesScreen`, `PrakritiScreen`, `GeneralVitalsScreen`, `ReviewScreen`, `CameraUploadScreen`, `TokenScreen`) to speak clear, localized spoken guidance upon entry. In `SocratesScreen`, each newly presented question and its options are auto-read aloud when advancing turn-by-turn.
  2. **Native Gemini Multimodal Audio Transcription:**
     - `server/app/services/whisprflow_service.py`: Implemented dual-engine audio intake. When Wispr Flow is not configured or fails, it automatically decodes the 16kHz WAV payload and transcribes it using Google Gemini Multimodal Audio understanding (`gemini-2.5-flash` / `gemini-3.5-flash-lite` / `gemini-flash-latest`) using the existing `GEMINI_API_KEY`.
     - `client/src/lib/audioRecorder.ts`: Routed `processor` output through a muted GainNode (`gain.value = 0`) before destination, preventing speaker loopback and mic gating.
     - `client/src/pages/patient/ComplaintScreen.tsx`: Fixed Web Speech transcript concatenation across all result indices and seamlessly merged with the verified Gemini backend transcription.
  3. **Disease-Specific Clinical Question Generation & Model Fallbacks:**
     - `.env`: Updated `LLM_MODEL=gemini-2.5-flash` and `LLM_FALLBACK_MODEL=gemini-3.5-flash-lite`.
     - `server/app/services/complaint_inference_service.py`: Added automatic model fallback chain (`[self.model_name, "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"]`). Rewrote clinical triage system prompt to instruct Gemini as a senior physician to generate 5 targeted, condition-specific diagnostic questions tailored directly to the patient's condition. Added `detected_condition` to structured output schema.
     - Added 4 new classical & clinical question sets to `server/app/data/question_sets/`:
       - `headache_migraine.json` (Shiroroga / Headaches & Migraines)
       - `fever_infection.json` (Jwara / Acute & Intermittent Fever)
       - `diabetes_metabolic.json` (Prameha / High Blood Sugar & Neuropathy)
       - `hypertension_cardiac.json` (Raktachapa / Blood Pressure & Palpitations)
- **HOW I VERIFIED IT WORKS:**
  - Created and executed comprehensive integration test `server/test_tts_and_transcribe_flow.py`:
    - Verified `GET /api/tts`: Hindi TTS generated 21,888 bytes in 0.44s; in-memory cache hit served in 4.0ms; English TTS generated 27,648 bytes.
    - Verified all 8 question sets loaded with 5 questions each.
    - Verified disease-specific inference: Migraine complaint resolved to `Headache & Migraine (Shiroroga)` (5 questions); Acute fever complaint resolved to `Fever & Acute Infection (Jwara)` (5 questions); Unregistered renal colic complaint dynamically generated 5 condition-specific questions via Gemini.
    - Verified `POST /api/sessions/transcribe` returned `success=True, source=gemini`.
  - Executed full test suite `pytest tests`: 41/41 unit & integration tests passing in 79.72s.
  - Executed frontend TypeScript typecheck (`tsc --noEmit`): 0 errors.
  - Executed full frontend production build (`vite build`): bundles compiled in 35.51s with 0 errors.
- **STATUS:** ✅ Fixed & verified



