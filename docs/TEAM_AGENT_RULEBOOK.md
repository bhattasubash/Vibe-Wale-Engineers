# AYUSH-Care: Master Team & AI Agent Collaboration Rulebook

This document is the **single source of truth** for all 6 team members and their AI coding agents (Cursor, Windsurf, Claude Code, Antigravity, Copilot). 

---

## Part 1: Universal Codebase Laws (The Anti-AI Standard)

Every AI agent working on this codebase must obey these 6 non-negotiable rules:

1. **Zero Emojis Policy:**
   * Never insert emojis in JSX, HTML, buttons, labels, comments, console logs, git commits, or API responses. Use text labels and SVG icons from `lucide-react`.

2. **Strict Non-Scrollable Kiosk Viewport:**
   * All kiosk patient screens must fit in a single viewport: `h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] overflow-hidden`.
   * Never add `overflow-y-auto` to main screen containers. Touch kiosks must never require vertical scrolling.

3. **GIGW Government Visual Identity:**
   * **Primary Trust Blue:** `#0B5FA5` (Buttons, active tabs, major headings)
   * **Secondary Ayush Green:** `#2F7D4F` (Prakriti and constitutional badges)
   * **Accent Saffron:** `#E07B1A` (Warnings, priority tags)
   * **Background Canvas:** `#EAEDF0`
   * **Cards Surface:** `#FFFFFF` with `border border-[#CED4DA]` and `rounded-[3px]`
   * **No drop shadows:** 100% flat UI. No `shadow-2xl`, no `rounded-2xl` or `rounded-3xl` bubble shapes.

4. **Touch Target Sizing (Apple Design Standard):**
   * Primary action buttons: Minimum height $56\text{px} - 64\text{px}$.
   * Option selector tiles: Minimum height $60\text{px} - 72\text{px}$.
   * Tap feedback: Always include `active:scale-[0.98]` on touch elements.

5. **Deterministic Math Over LLM Hallucinations:**
   * Never use an LLM for Prakriti dosha calculation or red-flag emergency detection.
   * Prakriti scoring must use pure arithmetic in `prakritiQuestions.ts` (Client) and `scoring.py` (Server).

6. **Privacy & DPDP Act 2023 Compliance:**
   * Never store full 12-digit Aadhaar numbers. Only capture `aadhaarLastFour` (4 digits).
   * All kiosk sessions are ephemeral and auto-purged on the terminal after token dispatch.

---

## Part 2: Team Module Ownership Matrix (Zero Merge Conflicts)

Merge conflicts happen when two developers edit the same file. Each role has 100% isolated ownership:

| Role | Member | Dedicated Branch | Owned Files & Directories | Never Touch |
|---|---|---|---|---|
| **Lead / Architect (You)** | 1 | `main` | `client/src/App.tsx`, `server/app/main.py`, `.env.example`, `docs/`, Merging PRs | Low-level UI without review |
| **Frontend Dev 1** | 2 | `feat/kiosk-patient-flow` | `client/src/pages/patient/`, `client/src/components/ui/`, `client/src/components/shared/` | `client/src/pages/physician/`, `server/` |
| **Frontend Dev 2** | 3 | `feat/doctor-dashboard` | `client/src/pages/physician/`, `client/src/components/physician/` | `client/src/pages/patient/`, `server/` |
| **OCR Engineer** | 4 | `feat/ocr-prescription-pipeline` | `server/app/services/ocr.py`, `server/app/routers/documents.py`, `client/src/lib/ocr.ts` | `client/src/pages/`, `server/app/routers/patients.py` |
| **Backend Dev 1** | 5 | `feat/backend-gateway-apis` | `server/app/routers/patients.py`, `server/app/routers/sessions.py`, `server/app/routers/prakriti.py`, `server/app/services/scoring.py` | `client/`, `supabase/migrations/` |
| **Backend Dev 2** | 6 | `feat/database-and-sync` | `supabase/migrations/`, `server/app/db/`, `server/app/routers/physician.py`, `server/app/services/red_flags.py` | `client/`, `server/app/services/ocr.py` |

---

## Part 3: Codebase Variable & Data Dictionary (The Frozen Contract)

**All AI agents and team members must use the exact variable names listed below:**

### 1. Patient Profile (`patient`)
* `fullName` (`string`): Full name in Devanagari or English (e.g. `"रामेश्वर दयाल शर्मा"`)
* `age` (`number`): Age in years (1 to 120)
* `gender` (`'male' | 'female' | 'other'`): Biological gender
* `phone` (`string`): 10-digit mobile number (e.g. `"9876543210"`)
* `abhaId` (`string`): 14-digit ABDM Health ID (e.g. `"91-4523-8901-2345"`)
* `abhaAddress` (`string`): ABDM PHR handle (e.g. `"rameshwar.sharma@abdm"`)
* `aadhaarLastFour` (`string`): Last 4 digits of Aadhaar (e.g. `"8912"`)
* `isReturning` (`boolean`): Previous hospital visitor flag
* `lastVisitDate` (`string | null`): Previous OPD visit timestamp

### 2. Chief Complaint & SOCRATES History
* `chiefComplaint` (`string`): Recorded primary complaint text
* `complaintCategory` (`string`): Triage classification (e.g. `'musculoskeletal'`, `'digestive'`)
* `socrates.site` (`string`): Anatomical site of problem (e.g. `'bilateral-knees'`)
* `socrates.onset` (`string`): Duration of symptoms (e.g. `'chronic-6-months'`)
* `socrates.severity` (`string`): Pain intensity scale (1-10) (e.g. `'severe-8'`)
* `socrates.timing` (`string`): Diurnal/seasonal triggers (e.g. `'cold-morning'`)
* `socrates.familyHistory` (`string`): Hereditary family history (e.g. `'family-arthritis'`)

### 3. Prakriti Scoring & Assessment
* `prakritiAnswers` (`Record<string, { optionIndex: number, doshaTag: 'vata' | 'pitta' | 'kapha' }>`): Dictionary of 15 question answers
* `prakritiResult.vataScore` (`number`): Vata percentage (0-100)
* `prakritiResult.pittaScore` (`number`): Pitta percentage (0-100)
* `prakritiResult.kaphaScore` (`number`): Kapha percentage (0-100)
* `prakritiResult.dominantPrakriti` (`string`): Classification string (e.g. `"PITTA-KAPHA"`)
* `prakritiResult.secondaryPrakriti` (`string | null`): Secondary dosha tag
* `prakritiResult.confidence` (`'high' | 'medium' | 'low'`): Mathematical dominance gap confidence

### 4. Uploaded Prescriptions & Documents
* `id` (`string`): Document unique ID (e.g. `"DOC-17253245"`)
* `name` (`string`): User-facing display title (e.g. `"पर्चा #1"`)
* `previewUrl` (`string`): Image preview URL / DataURI
* `extractedText` (`string`): Raw or structured OCR text

### 5. Assigned Doctor & Queue Record
* `sessionId` (`string`): Ephemeral session UUID (e.g. `"SES-8922B"`)
* `tokenNumber` (`string`): Printed OPD token slip ID (e.g. `"#AIIA-042"`)
* `assignedDoctor` (`string`): Name of assigned physician (e.g. `"डॉ. अनन्या शर्मा"`)
* `roomNumber` (`string`): Assigned physical OPD room (e.g. `"Room #104"`)
* `priority` (`'critical' | 'high' | 'normal'`): Triage priority
* `redFlagTriggered` (`boolean`): Emergency safety flag

---

## Part 4: Step-by-Step Git Protocol for Vibe Coders

### 1. Start of Day / Session Routine:
```bash
# 1. Switch to your feature branch
git checkout feat/your-feature-name

# 2. Fetch latest changes from main
git fetch origin

# 3. Cleanly rebase on top of main
git rebase origin/main
```

### 2. During Work:
* Commit small, logical chunks:
```bash
git add client/src/pages/physician/DoctorQueueScreen.tsx
git commit -m "feat(doctor): implement prioritized queue table with red flag sorting"
```

### 3. Pre-Push Verification:
* In `client/`, always run:
```bash
npm run build
```
*If build fails with TypeScript errors, fix them before pushing.*

### 4. Push to GitHub:
```bash
# 1. Rebase latest main
git pull --rebase origin main

# 2. Push your feature branch
git push origin feat/your-feature-name
```

---

## Part 5: Top 10 Mistakes AI Coding Agents Make & How to Stop Them

1. **Agent creates a new state store:**
   * *Rule:* Always use the existing `useSessionStore` in `client/src/stores/sessionStore.ts`.
2. **Agent adds `overflow-y-auto` making kiosk scrollable:**
   * *Rule:* Container must be `h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] overflow-hidden`.
3. **Agent mixes casing (`chief_complaint` in TS vs `fullName` in Python):**
   * *Rule:* Use `camelCase` for TypeScript and `snake_case` for Python.
4. **Agent switches audio to broken `window.speechSynthesis`:**
   * *Rule:* Always use `<AudioSpeaker />` component and `speech.ts` universal streaming.
5. **Agent installs random npm/pip packages:**
   * *Rule:* Zero new dependencies without Lead approval.
6. **Agent designs SaaS-style rounded cards with heavy shadows:**
   * *Rule:* Use strictly flat styling: `rounded-[3px] border border-[#CED4DA] bg-white` with zero drop shadows.
7. **Agent adds emojis to buttons:**
   * *Rule:* Never use emojis. Use Lucide SVG icons paired with text labels.
8. **Agent puts LLM API calls in React frontend components:**
   * *Rule:* All LLM calls must reside in `server/app/services/` backend routes.
9. **Agent creates a multi-page form with 15 questions on one screen:**
   * *Rule:* Exactly 1 question per screen with 3 large touch buttons ($72\text{px}$ height).
10. **Agent commits `.env` or `dist/` or `node_modules/`:**
    * *Rule:* Ensure `.env`, `dist/`, `node_modules/`, and `__pycache__/` are strictly in `.gitignore`.

---

## Part 6: Standard Prompt to Give Your AI Agent

Whenever you prompt your AI coding agent, start with this prompt:

```text
Follow the AYUSH-Care Master Rulebook:
1. Use existing useSessionStore in client/src/stores/sessionStore.ts.
2. Zero emojis anywhere in UI, code, or logs.
3. Strict non-scrollable kiosk layout: h-[calc(100vh-76px)] overflow-hidden.
4. GIGW government styling: 100% flat, rounded-[3px], #0B5FA5, #2F7D4F, #E07B1A.
5. Strict TypeScript types (no 'any').
6. Do not install new dependencies.
```
