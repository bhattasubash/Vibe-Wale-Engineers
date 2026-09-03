# Technical Diagram Suite Specification: AYUSH-Care (MediKiosk)

> Formal engineering documentation defining the complete diagram suite for the AYUSH-Care clinical intake platform. All diagrams use rigorous clinical and software engineering nomenclature with zero conversational artifacts or decorative emojis.

---

## 1. Classification of Diagrams: What is Each Diagram Exactly?

In enterprise healthcare engineering, a single diagram cannot represent an entire platform. Different diagrams answer fundamentally different architectural and clinical questions:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAM CLASSIFICATION                           │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. SYSTEM ARCHITECTURE ➔ "Where does code run & how do tiers connect?"   │
│ 2. STATE MACHINE       ➔ "How does the kiosk UI transition over time?"  │
│ 3. LOGIC FLOWCHART     ➔ "How does the deterministic clinical rule think?"│
│ 4. ALGORITHM DIAGRAM   ➔ "What mathematical equations calculate doshas?" │
│ 5. SEQUENCE DIAGRAM    ➔ "In what exact millisecond order do APIs talk?"│
│ 6. RELATIONAL ERD      ➔ "How is patient health data normalized in DB?" │
│ 7. CLINICAL WORKFLOW   ➔ "How does a BAMS doctor review & accept EMR?"   │
│ 8. SECURITY TOPOLOGY   ➔ "Where is the DPDP Act 2023 compliance wall?"  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Diagram 1: High-Level System Architecture (Tiered Infrastructure)
* **What it is:** A **C4 Layer 2 / Multi-Tier Deployment Topology Diagram**.
* **What it shows:**
  * **Physical Touchpoint Tier:** 15.6-inch anti-glare capacitive touch panel, noise-cancelling directional microphone array, dual audio transducers, and optical capture document sensor.
  * **Client Application Tier:** React 18 Single Page Application (SPA), Web Speech API runtime (Speech-to-Text and SpeechSynthesis), ephemeral Zustand state store, and deterministic screen router.
  * **API Microservice Tier:** FastAPI (Python 3.11) asynchronous gateway exposing 7 REST router modules (`/api/patients`, `/api/sessions`, `/api/prakriti`, `/api/pariksha`, `/api/documents`, `/api/summary`, `/api/physician`).
  * **Deterministic Clinical Core:** In-memory rule engines operating independently of external LLM APIs (47-question decision tree, Charaka Samhita arithmetic accumulator, 8-rule red flag scanner, 9-section template formatter).
  * **Data Persistence Tier:** PostgreSQL relational database with Row-Level Security (RLS), Supabase S3-compatible private object storage, and Supabase JWT authentication.
  * **Physician Workstation Tier:** Real-time priority queueing controller, clinical review workbench, and one-click EMR disposition dispatch.

---

### Diagram 2: Patient Kiosk State Machine (Deterministic UI Lifecycle)
* **What it is:** A **Finite State Machine (FSM) Transition Diagram**.
* **What it shows:** 
  * Linear state flow from `S-01: Welcome/Idle` through `S-14: Session Termination`.
  * Audio-guided comprehension checkpoints (`S-05`) where action buttons remain disabled until acoustic text-to-speech synthesis completes.
  * Non-blocking emergency red-flag overlay routing (`S-08`) with 6-second auto-resume so patient case-taking is never permanently stalled.
  * 10-second automatic local memory and browser cache purging upon reaching `S-14` to guarantee zero data leakage between successive patients.

---

### Diagram 3: Deterministic Clinical Knowledge Engine (Decision Tree)
* **What it is:** A **Deterministic Expert System Decision Tree Diagram**.
* **What it shows:**
  * Categorization routing table matching chief complaints to 6 distinct clinical branches (Musculoskeletal/Joints, Pyrexia/Infection, Agni/GI, Pranavaha/Respiratory, Twak/Dermatological, and General Constitutional).
  * Standardized SOCRATES diagnostic framework (Site, Onset, Character, Timing, Exacerbating factors, Associated signs).
  * Elimination of large language model hallucinations by storing all 47 clinical branches in static, version-controlled JSON configuration files.

---

### Diagram 4: Charaka Samhita Prakriti Scoring Engine (Mathematical Algorithm)
* **What it is:** An **Ayurvedic Constitutional Vector Normalization Algorithm Diagram**.
* **What it shows:**
  * 15 standardized physical and psychological traits grounded in *Charaka Samhita (Vimana Sthana Chapter 8)*.
  * Linear arithmetic point accumulation across independent Vata, Pitta, and Kapha counters.
  * Mathematical percentage normalization:
    $$V_{\%} = \left(\frac{\text{Vata Score}}{15}\right) \times 100, \quad P_{\%} = \left(\frac{\text{Pitta Score}}{15}\right) \times 100, \quad K_{\%} = \left(\frac{\text{Kapha Score}}{15}\right) \times 100$$
  * Dominance and confidence gap evaluation:
    * $\Delta \ge 5 \implies \text{High Confidence (Single Dosha Dominance)}$
    * $3 \le \Delta < 5 \implies \text{Medium Confidence (Dual Dosha Dominance)}$
    * $\Delta < 3 \implies \text{Low Confidence / Sama Prakriti (Flagged for Doctor Touch Examination)}$

---

### Diagram 5: Emergency Red-Flag Triage Pipeline (Low-Latency Safety Net)
* **What it is:** An **In-Memory Emergency Pattern Matcher and Priority Dispatch Pipeline**.
* **What it shows:**
  * Sub-10 millisecond regex and keyword scanning across raw voice transcripts and touch inputs.
  * Disjunction logic (`OR` combinations) across 5 critical emergency rules (Cardiac/Respiratory, Stroke/Neurological, Meningitis/Sepsis, Internal Hemorrhage, Self-Harm Ideation).
  * Automated parallel safety actions: immediate acoustic warning on kiosk, database alert logging, and real-time physician queue re-sorting to Priority #1.

---

### Diagram 6: Document Vision OCR & Pharmacopoeia Validation Pipeline
* **What it is:** A **Multimodal Document Processing Sequence Diagram**.
* **What it shows:**
  * Client-side video streaming with OpenCV.js edge detection, perspective transform, and deskewing.
  * Backend invocation of Vision-Language Models (Gemini Vision) constrained by strict Pydantic JSON schemas.
  * RapidFuzz token matching against an authoritative Indian Pharmacopoeia dictionary (~2,000 canonical pharmaceutical formulations) to correct optical character recognition errors before clinical display.

---

### Diagram 7: PostgreSQL Database Schema (Entity-Relationship Model)
* **What it is:** A **Third Normal Form (3NF) Relational Database Entity-Relationship Diagram (ERD)**.
* **What it shows:**
  * 10 normalized tables (`patients`, `physicians`, `sessions`, `conversation_turns`, `prakriti_responses`, `prakriti_results`, `pariksha_notes`, `documents`, `red_flags`, `summaries`).
  * Explicit Primary Key (PK), Foreign Key (FK), Unique Key (UK), and cascade delete constraints.
  * Index optimization on foreign keys, temporal timestamps, and session status flags.

---

### Diagram 8: Physician Consultation & Triage Workflow (Clinical UX)
* **What it is:** A **Clinical Workflow & Decision Support Flowchart**.
* **What it shows:**
  * Priority-sorted OPD consultation queueing.
  * Scannable 4-quadrant clinical summary presentation (Chief Complaint, Prakriti Radar Chart, Chronic Comorbidities, and Scanned Document Timeline).
  * One-click physician disposition actions: `[Accept to EMR]`, `[Amend & Accept]`, or `[Reject / Retake]`.

---

### Diagram 9: Cybersecurity, Data Boundary & DPDP Act 2023 Compliance
* **What it is:** A **Zero-Trust Network Topology and Data Protection Boundary Diagram**.
* **What it shows:**
  * Separation of Public Patient Kiosk Zone, Encryption in Transit (TLS 1.3), Secure Backend Enclave, and Compliant Persistence Layer.
  * Ephemeral client-side session storage preventing data exposure on public hardware.
  * Row-Level Security (RLS) enforcement on Supabase PostgreSQL within the India regulatory data boundary.

---

## 📁 Native draw.io Master File Location

The master, multi-page, 100% editable `.drawio` file containing all diagrams with zero emojis is located at:
👉 **[`diagrams/AYUSH_Care_Master_Diagrams.drawio`](file:///c:/Users/SUBASH/Desktop/SIH/diagrams/AYUSH_Care_Master_Diagrams.drawio)**

### How to Open:
1. Launch **draw.io** ([app.diagrams.net](https://app.diagrams.net/)).
2. Select **`File` $\rightarrow$ `Open From` $\rightarrow$ `Device...`**
3. Select `c:\Users\SUBASH\Desktop\SIH\diagrams\AYUSH_Care_Master_Diagrams.drawio`.
4. Switch between diagram pages using the navigation tabs at the bottom of the draw.io window.
