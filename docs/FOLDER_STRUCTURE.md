# AYUSH-Care: Complete Enterprise Project Structure

This document outlines the standard folder hierarchy and module ownership for the entire AYUSH-Care project.

```
ayush-care/
├── .github/                       # GitHub Actions CI/CD workflows
│   └── workflows/
│       └── deploy.yml             # Automated Vite build & GitHub Pages deployment
│
├── client/                        # React 18 + Vite 5 + TypeScript Frontend
│   ├── public/                    # Static public assets (Favicon, emblems, audio)
│   │   └── audio/                 # Pre-rendered female Hindi/regional voice prompts
│   ├── src/
│   │   ├── components/            # Reusable UI component library
│   │   │   ├── ui/                # Base design system (Buttons, Cards, AudioSpeaker)
│   │   │   ├── shared/            # Composite components (KioskHeader, TricolorBar)
│   │   │   └── physician/         # Doctor workstation widgets (RadarChart, QueueTable)
│   │   ├── pages/                 # Route-level view components
│   │   │   ├── patient/           # Patient Kiosk flow (S-01 to S-11)
│   │   │   │   ├── WelcomeScreen.tsx       # S-01: Walk-up welcome & voice greeting
│   │   │   │   ├── LanguageScreen.tsx      # S-02: 22 Scheduled languages matrix
│   │   │   │   ├── IdentifyScreen.tsx      # S-03: ABDM Scan & Share QR code
│   │   │   │   ├── ConsentScreen.tsx       # S-04: DPDP Act 2023 audio consent
│   │   │   │   ├── ComplaintScreen.tsx     # S-05: 64px Mic + AYUSH OPD symptoms
│   │   │   │   ├── SocratesScreen.tsx      # S-07: 5-Turn adaptive clinical intake
│   │   │   │   ├── PrakritiScreen.tsx      # S-08: 15 Charaka Samhita questions
│   │   │   │   ├── ReviewScreen.tsx        # S-09: Summary review & 1-tap editing
│   │   │   │   ├── CameraUploadScreen.tsx  # S-10: Auto-framing prescription camera
│   │   │   │   └── TokenScreen.tsx         # S-11: Doctor card & printed token slip
│   │   │   └── physician/         # Physician Workstation screens (S-16 to S-18)
│   │   │       ├── DoctorLoginScreen.tsx   # S-16: BAMS doctor authentication
│   │   │       ├── DoctorQueueScreen.tsx   # S-17: Prioritized OPD triage queue
│   │   │       └── DoctorSessionReview.tsx # S-18: Dense clinical case review sheet
│   │   ├── stores/                # Zustand global state stores
│   │   │   ├── sessionStore.ts    # Patient kiosk session state machine
│   │   │   └── physicianStore.ts  # Doctor queue & review state
│   │   ├── lib/                   # Core client utilities & offline engines
│   │   │   ├── offlineDb.ts       # Zero-dependency native IndexedDB storage
│   │   │   ├── syncManager.ts     # Automatic background synchronization manager
│   │   │   ├── speech.ts          # Universal hybrid direct audio TTS engine
│   │   │   └── ocr.ts             # Client-side Tesseract.js / WebAssembly wrapper
│   │   ├── config/                # Static clinical data & question matrices
│   │   │   ├── prakritiQuestions.ts # 15 Classical Charaka Samhita parameters
│   │   │   └── redFlagRules.json    # Sub-millisecond emergency keywords
│   │   ├── App.tsx                # Global HashRouter application entry
│   │   ├── main.tsx               # React DOM root mounting
│   │   └── index.css              # Tailwind CSS directives & GIGW styles
│   ├── tailwind.config.ts         # GIGW government color palette & font tokens
│   ├── tsconfig.json              # Strict TypeScript compiler options
│   └── vite.config.ts             # Vite bundler build configuration
│
├── server/                        # Python FastAPI 0.100+ Backend Gateway
│   ├── app/
│   │   ├── main.py                # FastAPI ASGI application entrypoint & middleware
│   │   ├── config.py              # Environment variables & security settings
│   │   ├── models/                # Pydantic v2 data validation schemas
│   │   │   └── schemas.py         # Request/Response models for all endpoints
│   │   ├── routers/               # Microservice API route controllers
│   │   │   ├── patients.py        # /api/patients (ABDM identify & register)
│   │   │   ├── sessions.py        # /api/sessions (Lifecycle & batch offline sync)
│   │   │   ├── prakriti.py        # /api/prakriti (Deterministic calculation)
│   │   │   ├── documents.py       # /api/documents (Prescription OCR upload)
│   │   │   └── physician.py       # /api/physician (OPD queue & review actions)
│   │   ├── services/              # Business logic & algorithms
│   │   │   ├── scoring.py         # Deterministic Charaka Samhita arithmetic engine
│   │   │   ├── red_flags.py       # Sub-millisecond emergency triage analyzer
│   │   │   ├── ocr.py             # Ayurvedic Pharmacopoeia entity extractor
│   │   │   └── summary.py         # Clinical case sheet synthesizer
│   │   └── db/                    # Persistence layer & database connections
│   │       └── connection.py      # Supabase / PostgreSQL 15 client
│   ├── tests/                     # Pytest automated testing suite
│   │   ├── test_scoring.py        # 100% mathematical boundary tests
│   │   └── test_api.py            # Integration tests for FastAPI endpoints
│   └── requirements.txt           # Python backend dependencies
│
├── supabase/                      # Database Schemas & Migrations
│   └── migrations/
│       └── 20260903000000_initial_schema.sql # PostgreSQL 15 DDL tables & indexes
│
├── scripts/                       # DevOps & Kiosk Hardware Lockdown
│   ├── kiosk-lockdown.bat         # Chrome full-screen kiosk sandbox launcher
│   └── start-dev.bat              # One-click startup for client and server
│
├── docs/                          # Single Source of Truth Documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── SCHEMA.md                  # Database schema design & ER diagrams
│   ├── API_CONTRACT.md            # Frozen REST API endpoints & JSON contracts
│   ├── DESIGN.md                  # GIGW Government Design System specifications
│   ├── PRAKRITI_LOGIC.md          # Classical Charaka Samhita scoring rubric
│   ├── TEAM_AGENT_RULEBOOK.md     # 6-member team collaboration & Git guide
│   └── FOLDER_STRUCTURE.md        # This folder hierarchy blueprint
│
├── AGENT_RULES.md                 # Root file automatically read by AI IDEs
├── .gitattributes                 # Cross-platform LF line ending normalization
├── .gitignore                     # Ignored files (dist, .env, node_modules)
└── .env.example                   # Environment configuration template
```
