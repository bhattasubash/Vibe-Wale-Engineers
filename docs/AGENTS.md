# AI Coding Context File

This file provides crucial context, architectural guidelines, and strict rules for developing the AYUSH-Care (MediKiosk) application. Read this thoroughly before generating any code.

## Project Identity
- **Name**: AYUSH-Care (MediKiosk)
- **Type**: Full-stack web application
- **Context**: SIH 2026 hackathon submission for AIIA, Ministry of AYUSH

## Tech Stack (exact versions)
- **Frontend**: React 18.x, Vite 5.x, TypeScript 5.x, Tailwind CSS 3.x
- **Backend**: Python 3.11+, FastAPI 0.100+, Uvicorn, Pydantic v2
- **Database**: PostgreSQL 15 via Supabase
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (`@supabase/supabase-js`)
- **LLM**: Google Generative AI (`@google/generative-ai` for frontend, `google-generativeai` for backend)
- **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **OCR**: Tesseract.js 5.x
- **HTTP Client**: Axios
- **State**: Zustand
- **Routing**: React Router v6

## Folder Structure
```
ayush-care/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Base design system (Button, Card, Input, etc.)
│   │   │   └── shared/        # Shared composite components
│   │   ├── pages/             # Route-level page components
│   │   │   ├── patient/       # Patient-facing kiosk screens
│   │   │   └── physician/     # Doctor dashboard screens
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state stores
│   │   ├── services/          # API client functions
│   │   ├── lib/               # Utilities, constants, types
│   │   │   ├── supabase.ts    # Supabase client init
│   │   │   ├── speech.ts      # Web Speech API wrapper
│   │   │   └── ocr.ts         # Tesseract.js wrapper
│   │   ├── config/            # Prakriti questions JSON, red-flag rules JSON
│   │   └── App.tsx
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── config.py          # Settings from env vars
│   │   ├── models/            # Pydantic models (request/response)
│   │   ├── routers/           # API route modules
│   │   │   ├── patients.py
│   │   │   ├── sessions.py
│   │   │   ├── conversation.py # Adaptive questioning & turn management
│   │   │   ├── prakriti.py     # 15-point Prakriti assessment & scoring
│   │   │   ├── pariksha.py     # Dashavidha Pariksha parameters
│   │   │   ├── documents.py    # Direct document metadata & OCR text storage
│   │   │   ├── summary.py      # Structured clinical summary generation
│   │   │   └── physician.py    # Doctor queue & review endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── llm.py         # Gemini API integration & prompt builder
│   │   │   ├── scoring.py     # Deterministic dosha scoring arithmetic
│   │   │   ├── red_flags.py   # Emergency symptom pattern-matcher
│   │   │   ├── ocr.py         # Document processing helpers
│   │   │   └── summary.py     # Clinical summary template engine
│   │   ├── db/                # Supabase/Postgres client
│   │   └── utils/
│   ├── requirements.txt
│   └── .env
├── docs/                      # This documentation folder
├── supabase/                  # Supabase migrations
│   └── migrations/
└── .env.example
```

## Coding Conventions
- **TypeScript**: strict mode, no `any`, use interfaces over types for public contracts.
- **Python**: type hints on all function signatures, Pydantic models for all request/response shapes.
- **Components**: functional components only, no class components.
- **Naming**: `PascalCase` for components, `camelCase` for variables/functions, `snake_case` for Python, `SCREAMING_SNAKE` for env vars.
- **CSS**: Tailwind utility classes only — use semantic design tokens from `tailwind.config.ts` (`bg-primary`, `bg-surface`, `bg-status-danger`, etc.). Use `cn()` helper (clsx + tailwind-merge) for conditional classes.
- **API calls**: all API calls go through `services/` layer, never directly in components.
- **State**: Zustand stores in `stores/` — one store per domain (sessionStore, patientStore, physicianStore).
- **Error handling & Graceful Degradation**: try/catch with user-facing toast messages. If AI follow-up / LLM call fails twice or times out (>3000ms), fallback to static clinical question bank and advance directly to Prakriti module without stalling.
- **Comments**: explain WHY, not WHAT. No commented-out code in commits.

## Environment Variables
All env vars must be in `.env.example`. Frontend vars prefixed with `VITE_`. Never hardcode API keys.

## DO NOT Rules
- **DO NOT** use Next.js, Remix, or any SSR framework — this is a Vite SPA.
- **DO NOT** use Redux, MobX, or Context for global state — use Zustand.
- **DO NOT** use styled-components, CSS modules, or Emotion — use Tailwind only.
- **DO NOT** use Firebase/Firestore — use Supabase (Postgres).
- **DO NOT** let the LLM generate diagnoses or prescriptions — it is a clinical clerk only.
- **DO NOT** retain patient personal health data in local kiosk browser storage after S-14 session completion (ephemeral on device). Backend database securely persists records for physician review.
- **DO NOT** use `var` in TypeScript — always `const` or `let`.
- **DO NOT** hardcode Prakriti questions in JSX — load from `config/prakriti-questions.json`.
- **DO NOT** make the dosha scoring LLM-driven — it must be deterministic arithmetic.
- **DO NOT** skip consent capture — consent screen is mandatory before any health data collection.
- **DO NOT** use `alert()` or `confirm()` — use custom UI components for all dialogs.
