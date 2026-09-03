# Screen Inventory: AYUSH-Care / MediKiosk

This document details every screen and page in the AYUSH-Care application. The application is divided into two main sections: the Patient Kiosk Flow and the Physician Dashboard.

## Patient Kiosk Flow
**Route Prefix:** `/kiosk`

### S-01: Welcome/Idle Screen
- **Route path:** `/kiosk`
- **Purpose:** Attract patients to start the process.
- **Data required:** None.
- **User actions:** Tap anywhere to begin.
- **Navigation:** On tap → navigates to S-02.
- **Special behaviors:** Ambient welcome animation, 'Tap to Begin' CTA, hospital branding. Auto-resets to this screen after 60s of inactivity on any other screen.

### S-02: Language Selection
- **Route path:** `/kiosk/language`
- **Purpose:** Allow the patient to choose their preferred interaction language.
- **Data required:** Available languages list (static).
- **User actions:** Select language (Hindi, English, etc.).
- **Navigation:** On select → saves preference to `sessionStore` → navigates to S-03.
- **Special behaviors:** Voice plays welcome in each language on hover/focus. Large flag/icon buttons.

### S-03: Patient Identification
- **Route path:** `/kiosk/identify`
- **Purpose:** Identify the patient or register a new one, and initialize the active session.
- **Data required:** None for input; calls `POST /api/patients/register` or `/identify`, followed immediately by `POST /api/sessions/start` with `patient_id` and selected `language`.
- **User actions:** Scan ABHA QR code, enter ABHA/Aadhaar number manually, or register fresh (name, age, gender form).
- **Navigation:** On identification + session creation → stores `patient_id` & `session_id` → navigates to S-04. (If existing patient, displays 'Welcome back, [name]').

### S-04: Consent Screen
- **Route path:** `/kiosk/consent`
- **Purpose:** Secure patient consent for data processing and clinical intake.
- **Data required:** Existing `session_id`, selected language for text/TTS.
- **User actions:** Tap 'I Agree' or 'I Do Not Agree' (minimum 64px height).
- **Navigation:**
  - Decline → shows 'We cannot proceed without consent' → clears session → navigates to S-01.
  - Accept → calls `PATCH /api/sessions/{session_id}/consent` with `{ consent_granted: true }` → navigates to S-05.
- **Special behaviors:** Full-screen explanation, TTS reads consent aloud automatically.

### S-05: Comprehension Check
- **Route path:** `/kiosk/ready`
- **Purpose:** Ensure the patient is ready for the assessment before conversational intake begins.
- **Data required:** Existing `session_id`.
- **User actions:** Tap 'I Understand'.
- **Navigation:** On tap → calls `PATCH /api/sessions/{session_id}/step` with `{ current_step: 'complaint' }` → navigates to S-06.
- **Special behaviors:** TTS speaks: "Now I am going to ask you some questions about your health. Please answer carefully." The 'I Understand' button appears AFTER TTS finishes (disabled during speech).

### S-06: Chief Complaint
- **Route path:** `/kiosk/complaint`
- **Purpose:** Capture the primary reason for the patient's visit.
- **Data required:** `session_id`.
- **User actions:** Voice input (Web Speech API) via microphone button, or text input via typing. Tap 'Next' (disabled until input provided).
- **Navigation:** On submit → calls `PATCH /api/sessions/{session_id}/complaint` → navigates to S-07.
- **Special behaviors:** Large text: "What is bothering you today?" in selected language.

### S-07: Adaptive Follow-Up Questions
- **Route path:** `/kiosk/conversation`
- **Purpose:** Deep-dive into the chief complaint using SOCRATES logic.
- **Data required:** Follow-up questions; calls `POST /api/conversation/{session_id}/turn` per interaction.
- **User actions:** Respond via voice or tapping suggested options. 'Repeat Question' and 'Go Back' buttons always visible.
- **Navigation:** When questions complete (or on AI timeout fallback) → navigates to S-09.
- **Special behaviors:** Chat-bubble style UI. Question displayed + read aloud via TTS. Background red-flag detection runs silently; if triggered, overlays S-08.

### S-08: Red Flag Alert (Urgent Banner Overlay)
- **Route path:** `/kiosk/conversation?alert=true` (Overlay on S-07)
- **Purpose:** Immediate alert for critical emergency symptoms without creating a kiosk dead-end.
- **Data required:** Red flag trigger details.
- **User actions:** Tap 'Continue Intake (Staff Alerted)' button or auto-resumes after 6 seconds.
- **Navigation:** Immediately flags session on physician queue as top priority (pinned with RED badge) while allowing patient to finish case-taking.
- **Special behaviors:** Red background, pulsing warning icon, text: "Your symptoms need immediate clinical attention. Hospital staff has been alerted." TTS reads warning aloud. Kiosk never locks permanently.

### S-09: Prakriti Assessment
- **Route path:** `/kiosk/prakriti`
- **Purpose:** 15-question Ayurvedic Prakriti evaluation.
- **Data required:** 15 localized questions with 3 options each (Vata/Pitta/Kapha mapped to simple text).
- **User actions:** Select one option per question. 'Previous' button to go back.
- **Navigation:**
  - On each answer → calls `POST /api/prakriti/{session_id}/answer`.
  - After question 15 → calls `POST /api/prakriti/{session_id}/calculate` → navigates to S-10.
- **Special behaviors:** Progress bar showing question X of 15. One question per screen with large buttons. TTS reads each question aloud. Options are in plain patient-understandable language.

### S-10: Remaining Pariksha
- **Route path:** `/kiosk/pariksha`
- **Purpose:** Capture remaining Ayurvedic parameters (Dashavidha Pariksha).
- **Data required:** 9 simple questions.
- **User actions:** Tap options / swipe through cards.
- **Navigation:** On complete → calls `POST /api/pariksha/{session_id}` → navigates to S-11.
- **Special behaviors:** Quick-fire format, one question per card, fast and lightweight.

### S-11: Document Upload
- **Route path:** `/kiosk/documents`
- **Purpose:** Digitize old prescriptions or reports.
- **Data required:** None initially.
- **User actions:** 'Yes' (capture/upload) or 'No'. If yes, camera capture or file upload. Client runs OCR and uploads structured result. 'Add Another' and 'Done' buttons.
- **Navigation:** If 'No' or 'Done' → navigates to S-12.
- **Special behaviors:** Shows uploaded document thumbnails with instant extraction preview. Each upload calls `POST /api/documents/{session_id}`.

### S-12: Summary Review — Patient Facing
- **Route path:** `/kiosk/summary`
- **Purpose:** Allow the patient to review the generated clinical summary.
- **Data required:** Generated summary data; calls `POST /api/summary/{session_id}/generate`.
- **User actions:** Review content. Tap 'Confirm Details' or 'Flag for Doctor Review'.
- **Navigation:**
  - If 'Confirm Details' → calls `PATCH /api/summary/{session_id}/confirm` with `{ patient_confirmed: true }` → navigates to S-14.
  - If 'Flag for Doctor Review' → calls `PATCH /api/summary/{session_id}/confirm` with `{ patient_confirmed: false, notes: 'Patient requested doctor verification' }` → navigates to S-14.
- **Special behaviors:** Shows loading animation initially. Displays summary in simple language. TTS reads summary aloud. Visualizes Prakriti result (dosha radar/bars). No multi-screen undo loops.

### S-13: Submission Confirmation
- **Route path:** `/kiosk/submitted`
- **Purpose:** Confirm data has been securely transmitted.
- **Data required:** Submission status; calls `POST /api/summary/{session_id}/submit`.
- **User actions:** Tap 'Done'.
- **Navigation:** On tap → navigates to S-15.
- **Special behaviors:** Shows mock ABHA linking animation and "Sent to Doctor's Queue" confirmation.

### S-14: Session End
- **Route path:** `/kiosk/thank-you`
- **Purpose:** Gracefully close the patient session and clear local device memory.
- **Data required:** Token/queue number.
- **User actions:** None required.
- **Navigation:** Auto-redirects to S-01 after 10 seconds.
- **Special behaviors:** "Thank you" message with TTS. "Your token number is [X]". All session data cleared from frontend state and local storage. Backend persists records for doctor review.

---

## Physician Dashboard
**Route Prefix:** `/doctor`

### S-16: Physician Login
- **Route path:** `/doctor/login`
- **Purpose:** Authenticate the physician.
- **Data required:** Credentials.
- **User actions:** Enter Email + Password.
- **Navigation:** On success (Supabase Auth) → navigates to S-17.

### S-17: Patient Queue
- **Route path:** `/doctor/queue`
- **Purpose:** Display patients waiting for consultation.
- **Data required:** List of active/pending sessions.
- **User actions:** Click a row to review the patient.
- **Navigation:** On row click → navigates to S-18.
- **Special behaviors:** Table/list format. Red-flagged patients pinned to the top with red indicators. Columns: Patient Name, Age, Chief Complaint, Prakriti, Time, Priority. Stats bar at the top (Patients today, Avg review time, Red flags).

### S-18: Summary Review — Physician Facing
- **Route path:** `/doctor/session/:sessionId`
- **Purpose:** Provide a dense, clinical overview of the patient's intake.
- **Data required:** Full patient session data, including clinical summary and OCR results.
- **User actions:** Review data, use inline edit affordances on sections, and choose 'Accept', 'Amend & Accept', or 'Reject'.
- **Navigation:** On action → calls `PATCH /api/physician/session/{id}/review` → navigates to S-17.
- **Special behaviors:** Dense, clinical layout. Sections include: Demographics, Chief Complaint, HPI (conversation summary), Prakriti Assessment (radar chart + scores), Dashavidha Pariksha, Uploaded Documents (extracted text), Red Flags.
