# Product Requirements Document: AYUSH-Care / MediKiosk

## 1. Problem Statement
The typical Indian Outpatient Department (OPD) faces a consultation collapse, where physicians have roughly 2 minutes per patient. In AYUSH systems like Ayurveda, this makes complex assessments such as the Dashavidha Pariksha practically impossible to conduct manually. Furthermore, patient clinical histories and paper documents remain fragmented, while the first-mile data digitization required for integration with the Ayushman Bharat Digital Mission (ABDM) is largely non-existent. AYUSH-Care solves this by intelligently offloading case-taking to a kiosk before the patient sees the doctor.

## 2. Target Users
- **Primary: Patient** — Often elderly, low-literacy, lacks smartphone access, speaks Hindi or regional languages, and may be visiting the hospital for the first time. Zero technological training is assumed.
- **Secondary: AYUSH Physician (BAMS)** — Handles 100+ patients per day. Requires an instant, structured summary of Prakriti and clinical history while retaining full clinical authority.
- **Tertiary: Hospital Admin** — Responsible for monitoring throughput, optimizing queue management, and overall operational efficiency.

## 3. MVP Feature List

| Feature | Module | Priority | Status |
| :--- | :---: | :---: | :--- |
| Language selection (Hindi/English) | A | P0 | Build |
| Audio-guided consent capture | D | P0 | Build |
| Dual-mode chief complaint (voice + touch) | A | P0 | Build |
| Adaptive SOCRATES follow-up questioning | A | P0 | Build |
| Prakriti assessment (15 structured questions) | A | P0 | Build |
| Deterministic dosha scoring (Vata/Pitta/Kapha) | A | P0 | Build |
| Lightweight Dashavidha Pariksha (9 remaining params) | A | P1 | Build |
| Red-flag emergency detection & triage alert | A | P0 | Build |
| Document upload with printed OCR | B | P1 | Build |
| Clinical entity extraction from documents | B | P1 | Build |
| Structured physician-ready summary generation | C | P0 | Build |
| Patient audio confirmation of summary | C | P1 | Build |
| Physician dashboard (view/edit/accept summary) | C | P0 | Build |
| Patient registration & identification | D | P0 | Build |
| Session data cleared after submission | D | P0 | Build |
| Mock ABHA linking UI | D | P2 | Mock |
| Mock HIS push confirmation | D | P2 | Mock |

## 4. Explicitly Out of Scope (MVP)

- **Patient Self-Service Web Portal / Patient Login**: Deferred for MVP. Patients are identified by staff-assisted / kiosk ABHA/Aadhaar/demographic lookup during OPD intake; personal patient portal with longitudinal record vault is scheduled for Phase 2.
- **Handwritten OCR**: Too complex for an MVP timeframe; requires specialized models beyond Tesseract. Printed documents are fully supported.
- **Bhashini ASR**: Delayed to roadmap; Web Speech API is sufficient for MVP demonstration.
- **Real ABDM Sandbox Integration**: Overly complex authentication and certification hurdles for a hackathon; UI flows are mocked to show intent.
- **Drug Interaction Engine**: Presents significant clinical risk; requires validated medical databases out of scope for case-taking.
- **Sign-Language Avatar**: Requires complex 3D rendering and NLP to sign translation.
- **Allopathic-only Mode**: Contradicts the specific problem statement aimed at the Ministry of AYUSH.
- **Mobile App**: Focus is on a kiosk/web-based flow for accessible hospital deployments without app downloads.

## 5. Success Criteria for Demo
- End-to-end patient journey completes without developer intervention.
- Physician summary screen shows dosha breakdown + structured history + extracted documents.
- At least one red-flag scenario triggers a visible priority alert.
- Mock ABHA/HIS confirmation displays on submission.
- First-time non-technical user completes Prakriti assessment without help.

## 6. Tech Stack Summary

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind | Fast iteration, robust typing, industry standard for SPAs. |
| **Backend** | FastAPI (Python 3.11+) | Ideal for AI/LLM integration, highly performant, auto-generated OpenAPI docs. |
| **Database** | PostgreSQL via Supabase | Reliable relational data model with free-tier accessibility. |
| **Storage** | Supabase Storage | Seamless integration with the database for document uploads. |
| **Auth** | Supabase Auth | Quick implementation for physician dashboard security. |
| **LLM** | Google Gemini API (Groq fallback) | Fast inference for adaptive questioning and summary generation. |
| **Voice** | Browser Web Speech API | Zero-dependency implementation for dual-mode interaction. |
| **OCR** | Tesseract.js / Gemini Vision | Client-side and VLM solution for printed text extraction. |

## 7. Key Risks

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **LLM Hallucinations & API Outage** | High (Incorrect summaries or stalled kiosk) | Confine LLM strictly to structured extraction; use deterministic arithmetic for dosha scores. If LLM call fails twice or times out (>3000ms), fallback to static clinical question bank and proceed straight to Prakriti module. |
| **Web Speech API inaccuracies** | Medium (Frustrated users) | Ensure touch/manual input fallback is always available and prominent. |
| **Tesseract OCR failures** | Low (Missing document data) | Allow manual entry; clarify that OCR is a supplementary feature for printed text only. |
| **Network Latency** | Medium (Slow kiosk responses) | Implement optimistic UI updates; show clear loading states; optimize prompt sizes. |
