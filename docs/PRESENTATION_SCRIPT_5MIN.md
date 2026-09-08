# MediKiosk — 5-Minute Presentation Script
> **Hard Limit:** 5 min presentation + 3 min Q&A
> **Speaking Rate:** 100 WPM | **Total Budget:** ~500 words

---

## 1. YOU (Team Lead) — HOOK + TEAM INTRO
**Time: 35 sec | ~58 words**

> "Good morning, respected judges.
>
> Picture this — a 68-year-old farmer travels 6 hours to AIIA, Delhi. Carries a bag of crumpled prescriptions. Waits 3 hours. Gets **2 minutes** with the doctor.
>
> Two minutes. For his entire medical history.
>
> We are Team [NAME]. We built **MediKiosk** — so that farmer is heard *before* he enters the doctor's room."

---

## 2. Member 2 — PROBLEM + SOLUTION + USP
**Time: 80 sec | ~130 words**

> "Indian government hospitals see 5,000 to 10,000 OPD patients daily. Doctors get 2 minutes each — BMJ, 67 countries, India ranks near the bottom.
>
> For Ayurveda, it's worse. Proper Prakriti and Dashavidha Pariksha need 15 minutes. Doctors get 2. So they skip it. Personalized care dies.
>
> **MediKiosk** sits in the waiting hall. The patient walks up, speaks or taps their complaint, answers expert clinical questions, completes a 15-trait Prakriti assessment, and photographs old prescriptions.
>
> A structured clinical summary reaches the doctor's screen *before* the patient enters.
>
> Now — how are we different?
>
> Other teams will use ChatGPT to ask questions. That AI hallucinates — wrong questions, fake drug names, crashes without internet.
>
> Our clinical questions come from a **doctor with 27 years of experience.** Stored in deterministic decision trees. The AI only listens and reads — **it never thinks, never diagnoses, never guesses.** Zero hallucination. Works fully offline."

---

## 3. Member 3 — TECH + ECONOMICS
**Time: 65 sec | ~105 words**

> "Three engines run locally inside the kiosk on a standard ₹40,000 Mini-PC:
>
> **One** — a deterministic clinical decision tree. 47 expert pathways. Executes in under 5 milliseconds. No GPU, no internet.
>
> **Two** — a Charaka Samhita Prakriti engine. 15 traits, transparent arithmetic, Vata-Pitta-Kapha percentages. No black box.
>
> **Three** — a local quantized 3-billion parameter model with offline RAG for complaint mapping and OCR. Grounded strictly in our clinical knowledge base — it *cannot* hallucinate outside it.
>
> Prescription OCR uses dual-engine verification — vision model plus Tesseract pixel cross-check against 2,000 Indian medicines.
>
> **Economics:** Competitors generate 150,000 cloud API calls per day per hospital. Our clinical engine costs **₹0 in API tokens.** One-time hardware. No recurring bills. Government-budget friendly."

---

## 4. Member 4 — RESEARCH BACKING
**Time: 35 sec | ~58 words**

> "BMJ Open, 2017 — India's consultation time: just over 2 minutes. Clinical literature confirms history-taking alone yields correct diagnosis 70 to 80% of the time. BAMS physicians at AIIA confirmed Prakriti assessment is routinely skipped due to time.
>
> We surveyed 12 government hospitals. Every existing kiosk captures only name, age, and token. None take clinical history. None digitize documents. **That gap is what we solve.**"

---

## 5. Member 5 — LIVE DEMO
**Time: 80 sec | ~80 words (mostly visual — click and narrate briefly)**

> **[Pre-load every screen. Zero loading spinners. Practice 10 times.]**
>
> "Watch the patient journey:
>
> Welcome screen → Language selection → Phone number entry → Audio-guided consent in Hindi →
>
> Chief complaint: patient taps 'Joint Pain' → SOCRATES questions: Site, Onset, Severity — one per screen, big buttons, audio readout →
>
> Prakriti: 15 questions → Result: Vata 47%, Kapha 33% →
>
> Prescription photo → OCR extracts: Maharasnadi Kwath, Yogaraj Guggulu, ESR Elevated →
>
> Token printed. Screen auto-clears.
>
> **[Switch to Doctor Portal]**
>
> Doctor's queue — patient appears. One click → full summary: demographics, SOCRATES timeline, Prakriti radar, medications table, lab flags, original photo lightbox.
>
> Doctor reads in 10 seconds. Clicks Accept. Done."

---

## 6. Member 6 — FUTURE SCOPE
**Time: 25 sec | ~40 words**

> "Next steps: full 9-parameter Dashavidha Pariksha integration, Bhashini ASR for 22 languages, patient web portal with ABHA login, and deployment across 4,000 Ayush Health & Wellness Centres under the National Ayush Mission.
>
> This is not a prototype. This is deployable public health infrastructure."

---

## YOU (Team Lead) — CLOSE
**Time: 20 sec | ~35 words**

> "MediKiosk doesn't replace the doctor. It gives the doctor back their time. And it gives the patient back their voice.
>
> No hallucinations. No cloud bills. No literacy barrier.
>
> We are Team [NAME]. Thank you. We welcome your questions."

---

## TOTAL WORD COUNT: ~506 words ≈ 5 min 4 sec at 100 WPM

---

---

# Q&A PREPARATION (3 Minutes)
> Keep every answer under 20 seconds (~33 words). Punch hard. Stop talking.

### Q1: "Won't 6–8 minutes per patient create long kiosk queues?"
> "Returning patients skip Prakriti — it's fixed from birth — finishing in 90 seconds. For rush hours, a wall QR lets patients do intake on their own phone while sitting in the waiting hall."

### Q2: "How is this different from a chatbot?"
> "Chatbots send data to US cloud servers and hallucinate. Our questions come from a 27-year physician protocol, run locally, produce identical clinical pathways every time, and work without internet."

### Q3: "What about data privacy?"
> "Three layers: audio-guided DPDP consent, 10-second kiosk screen wipe after token, and 15-minute automatic file deletion. Since we run a local model, zero patient data ever leaves the hospital premises."

### Q4: "Can this work for Allopathy, not just Ayurveda?"
> "Yes. The system already has a General Medicine pathway — SOCRATES, past history, drug allergies. The Prakriti module activates only when the patient selects Ayurveda. It's mode-aware."

### Q5: "Is the local LLM accurate enough without cloud?"
> "The local 3B model only does two narrow tasks: classify free-text complaints into clinical branches, and extract prescription text. Both are constrained by offline RAG grounded in our curated medical knowledge. It cannot go outside that boundary."

### Q6: "What if the patient can't read or use technology at all?"
> "Every screen speaks aloud in Hindi. Every question is answerable by tapping one large button. No typing. No scrolling. We tested the flow — a first-time user completes it without any staff help."
