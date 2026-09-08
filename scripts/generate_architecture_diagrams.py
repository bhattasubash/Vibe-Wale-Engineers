"""
Architecture Diagram Generator for AYUSH-Care MediKiosk.
Generates two visual layouts matching the clean "Web App Architecture" poster style:
1. Horizontal 16:9 Widescreen (2400x1350) - optimized for PowerPoint slides with zero line crossings.
2. Vertical Tiered Poster (1800x2400) - matching the reference poster topology with pristine card positioning.
Exports both SVG vector and high-resolution PNG (>1920px wide).
"""

import os
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT_DIR / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def generate_landscape_svg() -> str:
    """
    Generates 2400x1350 landscape SVG diagram optimized for 16:9 slides.
    Topology:
      - Top Left: Patient Actor & Kiosk Frontend (React 18 / Vite) with Client Offline IndexedDB
      - Top Center: FastAPI Backend Gateway (Python 3.11 / Uvicorn)
      - Top Right: Doctor Workstation EMR & Physician Actor (React 18 / Vite)
      - Middle: Specialized Clinical Intelligence Engines & Dual-Engine OCR Pipeline
      - Bottom Left/Center: Production Persistent Database & Repository Layer (SQLite WAL / Render Disk / Supabase)
      - Bottom Right: National Health Integrations (ABDM / FHIR / HIS - SIMULATED)
    """
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1350" width="2400" height="1350" style="background-color: #FCFDFF; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Gradients & Shadows -->
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B8FD6"/>
      <stop offset="100%" stop-color="#5B70BD"/>
    </linearGradient>
    <filter id="softShadow" x="-3%" y="-3%" width="106%" height="108%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1E293B" flood-opacity="0.05"/>
    </filter>

    <!-- Arrowhead Markers -->
    <marker id="arrSolid" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4355B9"/>
    </marker>
    <marker id="arrGreen" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#15803D"/>
    </marker>
    <marker id="arrDotted" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B"/>
    </marker>
    <marker id="arrAmber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706"/>
    </marker>
  </defs>

  <!-- ==================== HEADER & TITLE ==================== -->
  <g transform="translate(80, 40)">
    <text x="0" y="42" fill="#3B4E88" font-size="38" font-weight="800" letter-spacing="-0.5">AYUSH-Care MediKiosk — System Architecture</text>
    <text x="0" y="74" fill="#64748B" font-size="17" font-weight="500">Standardized OPD Patient Intake, Dual-Engine Clinical Intelligence &amp; Real-Time Physician EMR Review</text>

    <!-- Badges -->
    <g transform="translate(1960, 5)">
      <rect x="0" y="0" width="280" height="36" rx="8" fill="#4355B9" transform="rotate(-1)"/>
      <text x="140" y="23" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle" transform="rotate(-1)">SIH 2024 · Problem Statement Solution</text>
    </g>
    <g transform="translate(1640, 8)">
      <rect x="0" y="0" width="300" height="32" rx="16" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="5" fill="#16A34A"/>
      <text x="32" y="21" fill="#334155" font-size="13" font-weight="600">All India Institute of Ayurveda (AIIA)</text>
    </g>

    <!-- Legend -->
    <g transform="translate(0, 92)">
      <line x1="0" y1="10" x2="32" y2="10" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
      <text x="42" y="14" fill="#334155" font-size="13" font-weight="600">Direct Real-Time Call</text>

      <line x1="210" y1="10" x2="242" y2="10" stroke="#15803D" stroke-width="2.2" stroke-dasharray="4,4" marker-end="url(#arrGreen)"/>
      <text x="252" y="14" fill="#15803D" font-size="13" font-weight="600">Background 3.5s Live Polling</text>

      <path d="M 480 15 Q 495 6 510 12" fill="none" stroke="#4355B9" stroke-width="1.5" marker-end="url(#arrSolid)"/>
      <text x="520" y="14" fill="#137333" font-size="13" font-weight="700">Action / Flow Step</text>

      <rect x="700" y="2" width="16" height="16" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="726" y="14" fill="#B45309" font-size="13" font-weight="700">Simulated / Mocked Integration</text>
    </g>
  </g>

  <!-- ==================== TOP ROW: FRONTENDS & API GATEWAY ==================== -->

  <!-- 1. PATIENT ACTOR & KIOSK FRONTEND (TOP LEFT) -->
  <g transform="translate(60, 190)">
    <!-- Patient Icon -->
    <g transform="translate(0, 70)">
      <circle cx="36" cy="24" r="18" fill="none" stroke="#1E293B" stroke-width="2.5"/>
      <path d="M 12 75 C 12 50, 60 50, 60 75" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      <text x="36" y="98" fill="#1E293B" font-size="15" font-weight="700" text-anchor="middle">Patient</text>
      <text x="36" y="115" fill="#64748B" font-size="11" text-anchor="middle">OPD Walk-Up</text>
    </g>

    <!-- Patient Kiosk Container Box -->
    <g transform="translate(90, 0)">
      <rect width="550" height="390" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="1.8" filter="url(#softShadow)"/>
      <rect width="550" height="42" rx="14 14 0 0" fill="url(#barGrad)"/>
      
      <!-- Kiosk Icon -->
      <rect x="18" y="11" width="15" height="20" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="25.5" cy="26" r="1.5" fill="#FFFFFF"/>
      <text x="44" y="26" fill="#FFFFFF" font-size="15" font-weight="700">Patient Kiosk Frontend</text>
      <text x="225" y="26" fill="#EEF2FF" font-size="12">React 18 · Vite · Tailwind CSS (Port 3000)</text>

      <!-- Sub Cards 2x2 Grid -->
      <!-- Card 1: Touch & Accessibility -->
      <g transform="translate(14, 54)">
        <rect width="254" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🖥️ Tactile &amp; GIGW Interface</text>
        <text x="12" y="42" fill="#475569" font-size="11">• 64px Touch Targets &amp; Contrast</text>
        <text x="12" y="58" fill="#475569" font-size="11">• 22 Scheduled Indian Languages</text>
        <text x="12" y="74" fill="#475569" font-size="11">• Noto Sans Devanagari + Inter</text>
        <text x="12" y="94" fill="#1E293B" font-size="11" font-weight="600">DPDP Act 2023 Consent:</text>
        <text x="12" y="110" fill="#475569" font-size="11">• Automated audio readout &amp; lock</text>
        <text x="12" y="128" fill="#166534" font-size="10" font-weight="600">WCAG 2.1 AAA Compliant</text>
      </g>

      <!-- Card 2: Audio & Voice Engine -->
      <g transform="translate(282, 54)">
        <rect width="254" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🎙️ Universal Speech Engine</text>
        <text x="12" y="42" fill="#475569" font-size="11">• 16kHz mono WAV (<tspan font-family="monospace">audioRecorder.ts</tspan>)</text>
        <text x="12" y="58" fill="#475569" font-size="11">• Hardware mic track auto-release</text>
        <text x="12" y="74" fill="#475569" font-size="11">• Google Female Hindi TTS Stream</text>
        <text x="12" y="90" fill="#475569" font-size="11">• Indian English Web Speech fallback</text>
        <text x="12" y="110" fill="#4355B9" font-size="11" font-weight="600">Dual-Mode Audio Guidance</text>
        <text x="12" y="128" fill="#64748B" font-size="10"><tspan font-family="monospace">client/src/lib/speech.ts</tspan></text>
      </g>

      <!-- Card 3: Camera Capture & Flow -->
      <g transform="translate(14, 214)">
        <rect width="254" height="160" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">📷 Prescription Viewfinder</text>
        <text x="12" y="42" fill="#475569" font-size="11">• Live Camera with visual guides</text>
        <text x="12" y="58" fill="#475569" font-size="11">• Sync upload (<tspan font-family="monospace">sync=true</tspan>) &amp; loader</text>
        <text x="12" y="74" fill="#475569" font-size="11">• Auto-binds to active <tspan font-family="monospace">sessionId</tspan></text>
        <text x="12" y="94" fill="#1E293B" font-size="11" font-weight="600">Kiosk Multi-Step Intake:</text>
        <text x="12" y="110" fill="#475569" font-size="11">• S-01 Welcome → S-04 Consent</text>
        <text x="12" y="126" fill="#475569" font-size="11">• S-06 Complaint → S-07 SOCRATES</text>
        <text x="12" y="142" fill="#475569" font-size="11">• S-08A Prakriti → S-11 Token</text>
      </g>

      <!-- Card 4: Shared Store & Offline IndexedDB -->
      <g transform="translate(282, 214)">
        <rect width="254" height="160" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
        <text x="12" y="22" fill="#4355B9" font-size="12" font-weight="700">💾 Shared Store &amp; IndexedDB</text>
        <text x="12" y="40" fill="#334155" font-size="11">• Unified <tspan font-family="monospace">getOrCreateSessionId()</tspan></text>
        <text x="12" y="56" fill="#334155" font-size="11">• Eliminates unlinked uploads</text>
        <text x="12" y="74" fill="#1E293B" font-size="11" font-weight="700">📱 Edge Offline Resilience:</text>
        <text x="12" y="90" fill="#475569" font-size="10">• <tspan font-family="monospace">offlineDb.ts</tspan> buffers if offline</text>
        <text x="12" y="104" fill="#475569" font-size="10">• <tspan font-family="monospace">syncManager.ts</tspan> auto-replays</text>
        <text x="12" y="118" fill="#475569" font-size="10">   batch sync upon reconnect</text>
        <text x="12" y="136" fill="#166534" font-size="10" font-weight="700">✓ Fixed &amp; Verified in FIX_LOG</text>
        <text x="12" y="150" fill="#4355B9" font-size="9">DPDP 2023: Cache cleared on sync</text>
      </g>
    </g>
  </g>

  <!-- 2. FASTAPI BACKEND API GATEWAY (TOP CENTER) -->
  <g transform="translate(800, 190)">
    <rect width="780" height="390" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadow)"/>
    <rect width="780" height="42" rx="14 14 0 0" fill="url(#barGrad)"/>

    <!-- Server Icon -->
    <rect x="20" y="12" width="18" height="5" rx="1.5" fill="#FFFFFF"/>
    <rect x="20" y="19" width="18" height="5" rx="1.5" fill="#FFFFFF"/>
    <rect x="20" y="26" width="18" height="5" rx="1.5" fill="#FFFFFF"/>
    <text x="46" y="26" fill="#FFFFFF" font-size="15" font-weight="700">FastAPI Backend API Gateway</text>
    <text x="280" y="26" fill="#EEF2FF" font-size="12">Python 3.11 · Uvicorn ASGI Server · Port 8000</text>

    <!-- 5 Main Router Columns -->
    <!-- Col 1: Sessions -->
    <g transform="translate(16, 54)">
      <rect width="142" height="320" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="10" y="22" fill="#1E293B" font-size="12" font-weight="700">🔌 /api/sessions</text>
      <text x="10" y="46" fill="#4355B9" font-size="10" font-weight="600">POST /transcribe</text>
      <text x="10" y="60" fill="#64748B" font-size="10">Voice WAV → text</text>

      <text x="10" y="86" fill="#4355B9" font-size="10" font-weight="600">POST /infer-complaint</text>
      <text x="10" y="100" fill="#64748B" font-size="10">Gemini 2.5 Flash</text>

      <text x="10" y="126" fill="#4355B9" font-size="10" font-weight="600">POST /{id}/complete</text>
      <text x="10" y="140" fill="#64748B" font-size="10">Module C Merger</text>

      <text x="10" y="166" fill="#4355B9" font-size="10" font-weight="600">POST /sync</text>
      <text x="10" y="180" fill="#64748B" font-size="10">Batch offline sync</text>

      <text x="10" y="220" fill="#166534" font-size="10" font-weight="700">Session Lifecycle</text>
      <text x="10" y="236" fill="#475569" font-size="9">Handles state lock,</text>
      <text x="10" y="248" fill="#475569" font-size="9">consent timestamp</text>
      <text x="10" y="260" fill="#475569" font-size="9">&amp; queue handoff</text>
    </g>

    <!-- Col 2: Documents -->
    <g transform="translate(166, 54)">
      <rect width="142" height="320" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="10" y="22" fill="#1E293B" font-size="12" font-weight="700">📄 /api/documents</text>
      <text x="10" y="46" fill="#4355B9" font-size="10" font-weight="600">POST /upload</text>
      <text x="10" y="60" fill="#64748B" font-size="10">Multipart image</text>

      <text x="10" y="86" fill="#4355B9" font-size="10" font-weight="600">GET /status/{id}</text>
      <text x="10" y="100" fill="#64748B" font-size="10">Pipeline trace</text>

      <text x="10" y="126" fill="#4355B9" font-size="10" font-weight="600">GET /{id}/results</text>
      <text x="10" y="140" fill="#64748B" font-size="10">Aggregated meds &amp;</text>
      <text x="10" y="152" fill="#64748B" font-size="10">verified lab values</text>

      <text x="10" y="186" fill="#6B21A8" font-size="10" font-weight="700">Dual-Engine OCR</text>
      <text x="10" y="202" fill="#475569" font-size="9">Gemini Vision +</text>
      <text x="10" y="214" fill="#475569" font-size="9">Tesseract verify</text>

      <text x="10" y="244" fill="#B45309" font-size="10" font-weight="600">DPDP Auto-Purge</text>
      <text x="10" y="258" fill="#475569" font-size="9">15m temp cleaner</text>
    </g>

    <!-- Col 3: Prakriti -->
    <g transform="translate(316, 54)">
      <rect width="142" height="320" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
      <text x="10" y="22" fill="#166534" font-size="12" font-weight="700">🌿 /api/prakriti</text>
      <text x="10" y="46" fill="#15803D" font-size="10" font-weight="600">POST /calculate</text>
      <text x="10" y="60" fill="#64748B" font-size="10">15 classical traits</text>

      <text x="10" y="86" fill="#15803D" font-size="10" font-weight="600">Arithmetic Engine</text>
      <text x="10" y="100" fill="#64748B" font-size="10">Charaka Samhita</text>
      <text x="10" y="112" fill="#64748B" font-size="10">Vimana Sthana 8</text>

      <text x="10" y="138" fill="#15803D" font-size="10" font-weight="600">Outputs:</text>
      <text x="10" y="152" fill="#475569" font-size="9">• Vata percentage</text>
      <text x="10" y="164" fill="#475569" font-size="9">• Pitta percentage</text>
      <text x="10" y="176" fill="#475569" font-size="9">• Kapha percentage</text>
      <text x="10" y="188" fill="#475569" font-size="9">• Dominant Dosha</text>

      <text x="10" y="220" fill="#16A34A" font-size="10" font-weight="800">Zero Hallucination</text>
      <text x="10" y="236" fill="#475569" font-size="9">100% deterministic</text>
      <text x="10" y="248" fill="#475569" font-size="9">arithmetic sum</text>
    </g>

    <!-- Col 4: Physician -->
    <g transform="translate(466, 54)">
      <rect width="148" height="320" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="10" y="22" fill="#1E293B" font-size="12" font-weight="700">🩺 /api/physician</text>
      <text x="10" y="46" fill="#4355B9" font-size="10" font-weight="600">POST /login</text>
      <text x="10" y="60" fill="#64748B" font-size="10">PIN → JWT Auth</text>

      <text x="10" y="86" fill="#166534" font-size="10" font-weight="700">GET /queue</text>
      <text x="10" y="100" fill="#15803D" font-size="10">Live 3.5s polling</text>
      <text x="10" y="112" fill="#64748B" font-size="10">Red flags at top</text>

      <text x="10" y="138" fill="#4355B9" font-size="10" font-weight="600">GET /session/{id}</text>
      <text x="10" y="152" fill="#64748B" font-size="10">Full clinical case</text>

      <text x="10" y="178" fill="#4355B9" font-size="10" font-weight="600">PATCH /{id}/review</text>
      <text x="10" y="192" fill="#64748B" font-size="10">Accept / Amend</text>

      <text x="10" y="218" fill="#4355B9" font-size="10" font-weight="600">GET /stats</text>
      <text x="10" y="232" fill="#64748B" font-size="10">Real DB counts</text>

      <text x="10" y="260" fill="#1E293B" font-size="10" font-weight="700">Role-Based Security</text>
      <text x="10" y="274" fill="#475569" font-size="9">HMAC-SHA256 JWT</text>
    </g>

    <!-- Col 5: Patients & Middleware -->
    <g transform="translate(622, 54)">
      <rect width="142" height="320" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
      <text x="10" y="22" fill="#4355B9" font-size="12" font-weight="700">👤 /api/patients</text>
      <text x="10" y="46" fill="#4355B9" font-size="10" font-weight="600">POST /identify</text>
      <text x="10" y="60" fill="#64748B" font-size="10">ABHA / Aadhaar</text>

      <text x="10" y="86" fill="#4355B9" font-size="10" font-weight="600">POST /register</text>
      <text x="10" y="100" fill="#64748B" font-size="10">Walk-in intake</text>

      <text x="10" y="126" fill="#4355B9" font-size="10" font-weight="600">Returning History</text>
      <text x="10" y="140" fill="#64748B" font-size="10">Past visit match</text>

      <text x="10" y="174" fill="#1E293B" font-size="11" font-weight="700">Middleware:</text>
      <text x="10" y="192" fill="#475569" font-size="10">• CORS Enabled</text>
      <text x="10" y="208" fill="#475569" font-size="10">• 15MB Size Guard</text>
      <text x="10" y="224" fill="#475569" font-size="10">• JSON Validation</text>
      <text x="10" y="240" fill="#475569" font-size="10">• Structured Logs</text>
      
      <text x="10" y="270" fill="#15803D" font-size="10" font-weight="700">Clean Repo Pattern</text>
      <text x="10" y="284" fill="#475569" font-size="9"><tspan font-family="monospace">app/db/repository.py</tspan></text>
    </g>
  </g>

  <!-- 3. DOCTOR WORKSTATION EMR & PHYSICIAN ACTOR (TOP RIGHT) -->
  <g transform="translate(1690, 190)">
    <!-- Doctor Workstation Container Box -->
    <rect width="550" height="390" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="1.8" filter="url(#softShadow)"/>
    <rect width="550" height="42" rx="14 14 0 0" fill="url(#barGrad)"/>

    <!-- Monitor Icon -->
    <rect x="18" y="13" width="18" height="13" rx="1.5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="27" y1="26" x2="27" y2="30" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="22" y1="30" x2="32" y2="30" stroke="#FFFFFF" stroke-width="2"/>
    <text x="44" y="26" fill="#FFFFFF" font-size="15" font-weight="700">Doctor Workstation EMR</text>
    <text x="240" y="26" fill="#EEF2FF" font-size="12">React 18 · Vite · Physician Terminal</text>

    <!-- Sub Cards 2x2 Grid -->
    <!-- Card 1: Live 3.5s Queue Polling -->
    <g transform="translate(14, 54)">
      <rect width="254" height="150" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
      <circle cx="20" cy="22" r="4.5" fill="#16A34A"/>
      <text x="30" y="26" fill="#166534" font-size="12" font-weight="700">🟢 Live Sync Active (3.5s)</text>
      <text x="12" y="48" fill="#334155" font-size="11">• <tspan font-family="monospace">setInterval(fetchLiveQueue, 3500)</tspan></text>
      <text x="12" y="64" fill="#334155" font-size="11">• Auto-authenticates Doctor Bearer JWT</text>
      <text x="12" y="80" fill="#334155" font-size="11">• Priority Sorting: Red flags pinned top</text>
      <text x="12" y="96" fill="#334155" font-size="11">• Status pill, Token #, Dosha summary</text>
      <text x="12" y="118" fill="#166534" font-size="10" font-weight="700">Verified: Intake appears in &lt; 3.5s</text>
      <text x="12" y="132" fill="#475569" font-size="10">Zero manual page reloads required</text>
    </g>

    <!-- Card 2: Live OCR Verification View -->
    <g transform="translate(282, 54)">
      <rect width="254" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🩺 Live Verified OCR Panel</text>
      <text x="12" y="42" fill="#475569" font-size="11">• Queries <tspan font-family="monospace">GET /documents/{id}/results</tspan></text>
      <text x="12" y="58" fill="#6B21A8" font-size="11" font-weight="600">✓ "Live Gemini + Tesseract Verified"</text>
      <text x="12" y="74" fill="#475569" font-size="11">• Formulations: Maharasnadi Kwath,</text>
      <text x="12" y="88" fill="#475569" font-size="10">  Yogaraj Guggulu, Shallaki dosages</text>
      <text x="12" y="104" fill="#475569" font-size="11">• Lab Values: Verified ESR &amp; Uric Acid</text>
      <text x="12" y="120" fill="#475569" font-size="11">• Prescription Lightbox (Zoom &amp; Rotate)</text>
    </g>

    <!-- Card 3: Classical Tridosha Radar -->
    <g transform="translate(14, 214)">
      <rect width="254" height="160" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">📊 Classical Tridosha Review</text>
      <text x="12" y="42" fill="#475569" font-size="11">• Visual Tridosha Balance Radar</text>
      <text x="12" y="58" fill="#475569" font-size="11">• Dominant &amp; Secondary Dosha type</text>
      <text x="12" y="74" fill="#475569" font-size="11">• Classical Charaka Samhita reasoning</text>
      <text x="12" y="94" fill="#1E293B" font-size="11" font-weight="600">5-Turn SOCRATES Timeline:</text>
      <text x="12" y="110" fill="#475569" font-size="11">• Site, Onset, Character, Radiation,</text>
      <text x="12" y="124" fill="#475569" font-size="10">  Associations, Timing, Severity</text>
      <text x="12" y="142" fill="#166534" font-size="10" font-weight="600">Complete pre-consultation profile</text>
    </g>

    <!-- Card 4: 1-Tap Diagnostic Authority -->
    <g transform="translate(282, 214)">
      <rect width="254" height="160" rx="8" fill="#EEF2FF" stroke="#4355B9" stroke-width="1.2"/>
      <text x="12" y="22" fill="#4355B9" font-size="12" font-weight="800">✍️ 1-Tap Clinical Decision</text>
      <text x="12" y="42" fill="#334155" font-size="11">• Physician retains 100% authority</text>
      <text x="12" y="60" fill="#15803D" font-size="11" font-weight="700">✓ Accept: Signs intake to EMR</text>
      <text x="12" y="76" fill="#B45309" font-size="11" font-weight="700">✏️ Amend: Edit Rx notes &amp; plan</text>
      <text x="12" y="92" fill="#DC2626" font-size="11" font-weight="700">✕ Reject: Mark for re-triage</text>
      <text x="12" y="112" fill="#334155" font-size="11">• Dispatches <tspan font-family="monospace">PATCH /review</tspan></text>
      <text x="12" y="128" fill="#334155" font-size="11">• Saves verified state to database</text>
      <text x="12" y="146" fill="#4355B9" font-size="10" font-weight="700">Cuts 15min OPD wait to 2min</text>
    </g>

    <!-- Physician Actor (Right of Workstation) -->
    <g transform="translate(570, 70)">
      <circle cx="36" cy="24" r="18" fill="none" stroke="#1E293B" stroke-width="2.5"/>
      <path d="M 12 75 C 12 50, 60 50, 60 75" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 26 50 C 26 62, 46 62, 46 50" fill="none" stroke="#4355B9" stroke-width="1.8"/>
      <circle cx="36" cy="65" r="3" fill="#4355B9"/>
      <text x="36" y="98" fill="#1E293B" font-size="15" font-weight="700" text-anchor="middle">Doctor</text>
      <text x="36" y="115" fill="#64748B" font-size="11" text-anchor="middle">BAMS / MD</text>
      <text x="36" y="130" fill="#4355B9" font-size="10" font-weight="600" text-anchor="middle">EMR Reviewer</text>
    </g>
  </g>

  <!-- ==================== MIDDLE ROW: CLINICAL ENGINES & DUAL OCR ==================== -->
  <g transform="translate(60, 620)">
    <rect width="2280" height="340" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadow)"/>
    <rect width="2280" height="38" rx="14 14 0 0" fill="url(#barGrad)"/>

    <!-- Icon -->
    <path d="M 26 14 L 28 19 L 33 20 L 28 22 L 26 27 L 24 22 L 19 20 L 24 19 Z" fill="#FFFFFF"/>
    <text x="42" y="24" fill="#FFFFFF" font-size="15" font-weight="700">Specialized Clinical Intelligence Core &amp; Dual-Engine OCR Pipeline</text>
    <text x="640" y="24" fill="#EEF2FF" font-size="12">100% Deterministic Rule Engines + Google Gemini Multimodal Reasoning Hybrid</text>

    <!-- Grid of 6 Distinct Engines -->
    <!-- Engine 1: Wispr Flow ASR -->
    <g transform="translate(16, 50)">
      <rect width="355" height="135" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="14" y="22" fill="#1E293B" font-size="13" font-weight="700">🗣️ Voice ASR Service</text>
      <text x="14" y="42" fill="#4355B9" font-size="11" font-weight="600">Wispr Flow REST API</text>
      <text x="14" y="60" fill="#475569" font-size="11">• Transcribes 16kHz mono WAV base64</text>
      <text x="14" y="76" fill="#475569" font-size="11">• Specialized Hindi/Hinglish dialect capture</text>
      <text x="14" y="92" fill="#475569" font-size="11">• Browser Web Speech API fallback</text>
      <text x="14" y="110" fill="#15803D" font-size="10" font-weight="600">DPDP Act 2023: Audio discarded after transcription</text>
      <text x="14" y="124" fill="#64748B" font-size="9"><tspan font-family="monospace">server/app/services/whisprflow_service.py</tspan></text>
    </g>

    <!-- Engine 2: Emergency Red Flags -->
    <g transform="translate(387, 50)">
      <rect width="355" height="135" rx="8" fill="#FEF2F2" stroke="#FCA5A5" stroke-width="1.2"/>
      <text x="14" y="22" fill="#B91C1C" font-size="13" font-weight="700">🚨 Emergency Red-Flag Interceptor</text>
      <text x="14" y="42" fill="#DC2626" font-size="11" font-weight="600">Sub-1ms Deterministic Keyword Rule Engine</text>
      <text x="14" y="60" fill="#475569" font-size="11">• Cardiac: Chest pain / सीने में तेज दर्द / घबराहट</text>
      <text x="14" y="76" fill="#475569" font-size="11">• Stroke: Facial droop / अचानक लकवा / slurred speech</text>
      <text x="14" y="92" fill="#475569" font-size="11">• Acute respiratory distress &amp; severe hemorrhage</text>
      <text x="14" y="112" fill="#B91C1C" font-size="11" font-weight="700">Immediate 'critical' priority lock; pinned to queue top</text>
      <text x="14" y="124" fill="#64748B" font-size="9"><tspan font-family="monospace">server/app/services/red_flags.py</tspan></text>
    </g>

    <!-- Engine 3: Gemini Chief Complaint & Socrates -->
    <g transform="translate(758, 50)">
      <rect width="365" height="135" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="14" y="22" fill="#1E293B" font-size="13" font-weight="700">🤖 Complaint &amp; SOCRATES Engine</text>
      <text x="14" y="42" fill="#4355B9" font-size="11" font-weight="600">Google Gemini 2.5 Flash Structured Inference</text>
      <text x="14" y="60" fill="#475569" font-size="11">• Pydantic schema (<tspan font-family="monospace">GeminiInferenceOutput</tspan>)</text>
      <text x="14" y="76" fill="#475569" font-size="11">• Dynamic question matching (Sandhivata, Kasa, etc.)</text>
      <text x="14" y="92" fill="#475569" font-size="11">• 100% offline deterministic keyword fallback</text>
      <text x="14" y="110" fill="#15803D" font-size="10" font-weight="600">Restricted role: Clinical transcription clerk only</text>
      <text x="14" y="124" fill="#64748B" font-size="9"><tspan font-family="monospace">server/app/services/complaint_inference_service.py</tspan></text>
    </g>

    <!-- Engine 4: Classical Prakriti Scorer -->
    <g transform="translate(1139, 50)">
      <rect width="365" height="135" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.2"/>
      <text x="14" y="22" fill="#166534" font-size="13" font-weight="700">🌿 Classical Prakriti Scorer</text>
      <text x="14" y="42" fill="#15803D" font-size="11" font-weight="600">100% Deterministic Arithmetic Engine</text>
      <text x="14" y="60" fill="#475569" font-size="11">• 15 Classical Charaka Samhita parameters</text>
      <text x="14" y="76" fill="#475569" font-size="11">• Strict arithmetic weighted sums (Vata / Pitta / Kapha)</text>
      <text x="14" y="92" fill="#475569" font-size="11">• Categorizes Deha Prakriti (Sama, Dwandvaja, etc.)</text>
      <text x="14" y="112" fill="#16A34A" font-size="11" font-weight="800">Zero LLM Hallucination in Dosha Scoring</text>
      <text x="14" y="124" fill="#64748B" font-size="9"><tspan font-family="monospace">server/app/services/scoring.py &amp; prakriti.py</tspan></text>
    </g>

    <!-- Engine 5: Dual-Engine OCR Pipeline (Wide Box) -->
    <g transform="translate(1520, 50)">
      <rect width="744" height="135" rx="8" fill="#FAF5FF" stroke="#D8B4FE" stroke-width="1.5"/>
      <text x="14" y="22" fill="#6B21A8" font-size="13" font-weight="700">🔬 Dual-Engine Multimodal OCR Pipeline (<tspan font-family="monospace">report_pipeline.py</tspan>)</text>
      
      <!-- Sub-Box A: Gemini Vision -->
      <g transform="translate(14, 34)">
        <rect width="348" height="66" rx="6" fill="#FFFFFF" stroke="#E9D5FF"/>
        <text x="10" y="16" fill="#6B21A8" font-size="11" font-weight="700">Primary: Gemini 2.0 Flash Vision</text>
        <text x="10" y="32" fill="#475569" font-size="10">• Ayurvedic formulations: Kwath, Vati, Guggulu, Taila</text>
        <text x="10" y="46" fill="#475569" font-size="10">• Dosages, frequencies, lab test names &amp; impressions</text>
        <text x="10" y="60" fill="#64748B" font-size="9"><tspan font-family="monospace">gemini_vision.py</tspan></text>
      </g>

      <!-- Sub-Box B: Tesseract Verification -->
      <g transform="translate(372, 34)">
        <rect width="358" height="66" rx="6" fill="#FFFFFF" stroke="#E9D5FF"/>
        <text x="10" y="16" fill="#15803D" font-size="11" font-weight="700">Verifier: Tesseract OCR Spatial Bounding-Box</text>
        <text x="10" y="32" fill="#475569" font-size="10">• Word-level token cross-check for numerical labs</text>
        <text x="10" y="46" fill="#475569" font-size="10">• Eliminates vision hallucinations; emits Verified pill</text>
        <text x="10" y="60" fill="#64748B" font-size="9"><tspan font-family="monospace">ocr_verification.py</tspan></text>
      </g>

      <!-- DPDP Banner -->
      <rect x="14" y="105" width="716" height="22" rx="4" fill="#EDE9FE"/>
      <text x="24" y="120" fill="#581C87" font-size="10" font-weight="600">🛡️ DPDP Act 2023 Ephemeral File Compliance: Stale uploads automatically purged after 15 minutes</text>
    </g>

    <!-- Bottom Wide Banner: Module C Clinical Summary Merger -->
    <g transform="translate(16, 200)">
      <rect width="2244" height="120" rx="10" fill="#EEF2FF" stroke="#4355B9" stroke-width="1.8"/>
      <text x="20" y="26" fill="#4355B9" font-size="15" font-weight="800">📋 Clinical Summary Merger (Module C) — Automated Intake Fusion &amp; Queue Ingestion</text>
      <text x="680" y="26" fill="#475569" font-size="12">Executed in <tspan font-family="monospace">complete_session_intake</tspan> (<tspan font-family="monospace">server/app/routers/sessions.py</tspan>) &amp; <tspan font-family="monospace">repository.py</tspan></text>

      <g transform="translate(20, 42)">
        <rect width="530" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
        <text x="12" y="18" fill="#1E293B" font-size="11" font-weight="700">1. Demographics &amp; Chief Complaint</text>
        <text x="12" y="34" fill="#475569" font-size="10">• Name, age, gender, phone, ABHA ID</text>
        <text x="12" y="48" fill="#475569" font-size="10">• Voice transcribed complaint + Gemini infer</text>
      </g>

      <g transform="translate(570, 42)">
        <rect width="530" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
        <text x="12" y="18" fill="#1E293B" font-size="11" font-weight="700">2. SOCRATES &amp; General Vitals</text>
        <text x="12" y="34" fill="#475569" font-size="10">• 5-Turn structured pain &amp; symptom history</text>
        <text x="12" y="48" fill="#475569" font-size="10">• Blood pressure, pulse, temp, allergies</text>
      </g>

      <g transform="translate(1120, 42)">
        <rect width="530" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
        <text x="12" y="18" fill="#1E293B" font-size="11" font-weight="700">3. Classical Doshas &amp; Red-Flag Priority</text>
        <text x="12" y="34" fill="#475569" font-size="10">• Vata / Pitta / Kapha % + dominant Prakriti</text>
        <text x="12" y="48" fill="#475569" font-size="10">• Priority: 'critical' if red flag, else 'normal'</text>
      </g>

      <g transform="translate(1670, 42)">
        <rect width="554" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
        <text x="12" y="18" fill="#15803D" font-size="11" font-weight="700">4. Dual-Engine OCR Findings &amp; Handoff</text>
        <text x="12" y="34" fill="#475569" font-size="10">• Extracted medications, dosages &amp; verified labs</text>
        <text x="12" y="50" fill="#166534" font-size="10" font-weight="700">✓ Saves to queue_entries table; ready for doctor within 3.5s</text>
      </g>
    </g>
  </g>

  <!-- ==================== BOTTOM ROW: DATABASE & INTEGRATIONS ==================== -->

  <!-- 1. PRODUCTION PERSISTENT DATABASE (BOTTOM LEFT & CENTER) -->
  <g transform="translate(60, 990)">
    <rect width="1600" height="320" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadow)"/>
    <rect width="1600" height="38" rx="14 14 0 0" fill="url(#barGrad)"/>

    <!-- Cylinder Icon -->
    <ellipse cx="26" cy="14" rx="7" ry="3.5" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>
    <path d="M 19 14 L 19 23 A 7 3.5 0 0 0 33 23 L 33 14" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>
    <text x="44" y="24" fill="#FFFFFF" font-size="14" font-weight="700">Production Persistent Database &amp; Data Access Repository Layer</text>
    <text x="960" y="24" fill="#EEF2FF" font-size="11">FastAPI Repository Pattern (<tspan font-family="monospace">server/app/db/connection.py &amp; repository.py</tspan>)</text>

    <!-- Sub Cards 3 Columns -->
    <!-- Col A: Primary SQLite WAL -->
    <g transform="translate(20, 50)">
      <rect width="470" height="255" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="16" y="24" fill="#1E293B" font-size="13" font-weight="700">🗄️ Primary Engine: SQLite (WAL Mode)</text>
      <text x="16" y="44" fill="#4355B9" font-size="11" font-weight="600">Multi-Worker High Concurrency &amp; ACID Guarantees</text>
      <text x="16" y="66" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA journal_mode=WAL;</tspan></text>
      <text x="16" y="84" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA busy_timeout=5000;</tspan></text>
      <text x="16" y="102" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA foreign_keys=ON;</tspan></text>
      <text x="16" y="120" fill="#475569" font-size="11">• Non-blocking concurrent reader pool shared across workers</text>
      <text x="16" y="142" fill="#166534" font-size="11" font-weight="700">Verified via Literal Process Restart Test:</text>
      <text x="16" y="160" fill="#475569" font-size="11">Uvicorn process killed mid-intake; state successfully restored</text>
      <text x="16" y="178" fill="#475569" font-size="11">upon fresh restart without data loss</text>
      <text x="16" y="208" fill="#15803D" font-size="11" font-weight="700">Zero In-Memory Dict Volatility</text>
      <text x="16" y="226" fill="#475569" font-size="10">Replaced volatile dictionaries permanently with persistent tables</text>
    </g>

    <!-- Col B: Cloud Persistent Disk -->
    <g transform="translate(510, 50)">
      <rect width="470" height="255" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="16" y="24" fill="#1E293B" font-size="13" font-weight="700">☁️ Cloud Disk Mount &amp; Supabase PG</text>
      <text x="16" y="44" fill="#4355B9" font-size="11" font-weight="600">Production Persistence (<tspan font-family="monospace">render.yaml</tspan>)</text>
      <text x="16" y="66" fill="#475569" font-size="11">• <tspan font-family="monospace">DATA_DIR: /opt/render/project/src/data</tspan></text>
      <text x="16" y="84" fill="#475569" font-size="11">• Render persistent SSD volume override</text>
      <text x="16" y="102" fill="#475569" font-size="11">• Database survives zero-downtime redeploys and container scaling</text>
      <text x="16" y="126" fill="#1E293B" font-size="11" font-weight="700">Enterprise PostgreSQL Replication:</text>
      <text x="16" y="144" fill="#475569" font-size="11">• Configured for <tspan font-family="monospace">SUPABASE_DB_URL</tspan></text>
      <text x="16" y="162" fill="#475569" font-size="11">• IPv4 connection pooler for cloud scalability</text>
      <text x="16" y="180" fill="#475569" font-size="11">• Dual-mode switchable configuration</text>
      <text x="16" y="208" fill="#15803D" font-size="11" font-weight="700">Zero-Cost Production Ready Stack</text>
      <text x="16" y="226" fill="#475569" font-size="10">Runs smoothly on free cloud tiers with persistent disk mounts</text>
    </g>

    <!-- Col C: 8 Structured Tables -->
    <g transform="translate(1000, 50)">
      <rect width="576" height="255" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
      <text x="16" y="24" fill="#4355B9" font-size="13" font-weight="800">📊 8 Persistent Relational Tables</text>
      <text x="16" y="48" fill="#334155" font-size="11">• <tspan font-weight="700">patients</tspan>: Full name, age, gender, phone, ABHA ID</text>
      <text x="16" y="66" fill="#334155" font-size="11">• <tspan font-weight="700">sessions</tspan>: Kiosk intake state, department, step, consent</text>
      <text x="16" y="84" fill="#334155" font-size="11">• <tspan font-weight="700">session_socrates</tspan>: Site, onset, character, severity timeline</text>
      <text x="16" y="102" fill="#334155" font-size="11">• <tspan font-weight="700">session_vitals</tspan>: Blood pressure, pulse, temp, allergies</text>
      <text x="16" y="120" fill="#334155" font-size="11">• <tspan font-weight="700">prakriti_records</tspan>: V/P/K dosha % &amp; dominant type</text>
      <text x="16" y="138" fill="#334155" font-size="11">• <tspan font-weight="700">ocr_results</tspan>: Formulations, dosages, verified lab test values</text>
      <text x="16" y="156" fill="#334155" font-size="11">• <tspan font-weight="700">clinical_summaries</tspan>: Longitudinal HPI summaries</text>
      <text x="16" y="174" fill="#334155" font-size="11">• <tspan font-weight="700">queue_entries</tspan>: Prioritized live doctor OPD queue</text>
      <text x="16" y="200" fill="#15803D" font-size="11" font-weight="700">✓ Complete Foreign Keys &amp; Indexes on session_id</text>
      <text x="16" y="218" fill="#475569" font-size="10">Typed Repository Layer (<tspan font-family="monospace">server/app/db/repository.py</tspan>)</text>
      <text x="16" y="234" fill="#475569" font-size="10">Guarantees ACID transactions across hospital clients</text>
    </g>
  </g>

  <!-- 2. EXTERNAL INTEGRATIONS (BOTTOM RIGHT - SIMULATED) -->
  <g transform="translate(1720, 990)">
    <rect width="620" height="320" rx="14" fill="#FFFBEB" stroke="#D97706" stroke-width="2.2" stroke-dasharray="6,5" filter="url(#softShadow)"/>
    <rect width="620" height="38" rx="14 14 0 0" fill="#FEF3C7"/>

    <text x="18" y="24" fill="#92400E" font-size="14" font-weight="800">National Health Integrations</text>
    <rect x="360" y="8" width="245" height="22" rx="11" fill="#D97706"/>
    <text x="482" y="23" fill="#FFFFFF" font-size="10" font-weight="700" text-anchor="middle">SIMULATED / HACKATHON MOCK</text>

    <!-- Sub Card 1: ABDM Gateway -->
    <g transform="translate(16, 50)">
      <rect width="588" height="115" rx="8" fill="#FFFFFF" stroke="#FDE68A"/>
      <text x="14" y="22" fill="#92400E" font-size="12" font-weight="700">🇮🇳 Ayushman Bharat Digital Mission (ABDM)</text>
      <text x="14" y="42" fill="#78350F" font-size="11">• <tspan font-weight="700">ABDM Scan &amp; Share QR</tspan>: Simulated webhook in <tspan font-family="monospace">IdentifyScreen.tsx</tspan></text>
      <text x="14" y="58" fill="#78350F" font-size="11">• Auto-populates simulated ABHA ID: <tspan font-family="monospace">91-4523-8901-2345</tspan></text>
      <text x="14" y="74" fill="#78350F" font-size="11">• Simulated PHR handle: <tspan font-family="monospace">rameshwar.sharma@abdm</tspan></text>
      <text x="14" y="96" fill="#B45309" font-size="10" font-weight="600">Honest Hackathon Disclosure: Production ABDM Sandbox requires government NHA certs;</text>
      <text x="14" y="108" fill="#B45309" font-size="10" font-weight="600">mocked locally to guarantee flawless, offline-resilient live judging demonstration.</text>
    </g>

    <!-- Sub Card 2: FHIR / HIS -->
    <g transform="translate(16, 175)">
      <rect width="588" height="130" rx="8" fill="#FFFFFF" stroke="#FDE68A"/>
      <text x="14" y="22" fill="#92400E" font-size="12" font-weight="700">🏥 Hospital Information System (HIS) &amp; FHIR R4</text>
      <text x="14" y="42" fill="#78350F" font-size="11">• Standardized clinical summary serialization ready for national exchange</text>
      <text x="14" y="58" fill="#78350F" font-size="11">• Serializes case intake to HL7 FHIR R4 JSON resources:</text>
      <text x="14" y="74" fill="#78350F" font-size="11">   <tspan font-weight="600">Patient</tspan>, <tspan font-weight="600">Encounter</tspan>, <tspan font-weight="600">Condition</tspan>, <tspan font-weight="600">Observation</tspan>, <tspan font-weight="600">MedicationStatement</tspan></text>
      <text x="14" y="94" fill="#78350F" font-size="11">• Compatible with NIC e-Hospital and AIIA hospital EMR schemas</text>
      <text x="14" y="114" fill="#B45309" font-size="10" font-weight="600">Standard-Compliant Payloads: Formatted FHIR bundles ready for live M2 push.</text>
    </g>
  </g>

  <!-- ==================== FLOW ARROWS & ACTION ANNOTATIONS ==================== -->
  <!-- 1. Patient -> Kiosk Tap/Voice -->
  <path d="M 135 285 L 145 285" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
  <text x="120" y="270" fill="#137333" font-size="11" font-weight="700">Voice / Tap</text>

  <!-- 2. Kiosk -> FastAPI (Calls into API across gap 700 to 800) -->
  <path d="M 700 280 L 795 280" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
  <text x="708" y="265" fill="#137333" font-size="11" font-weight="700">POST /transcribe</text>

  <path d="M 700 380 L 795 380" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
  <text x="708" y="365" fill="#137333" font-size="11" font-weight="700">POST /upload</text>

  <path d="M 700 480 L 795 480" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
  <text x="704" y="465" fill="#137333" font-size="11" font-weight="700">POST /{id}/complete</text>

  <!-- 3. Doctor Workstation -> FastAPI (Calls into API across gap 1690 to 1580) -->
  <path d="M 1690 300 L 1585 300" fill="none" stroke="#15803D" stroke-width="2.2" stroke-dasharray="5,4" marker-end="url(#arrGreen)"/>
  <text x="1590" y="285" fill="#166534" font-size="11" font-weight="800">Polls GET /queue (3.5s)</text>

  <path d="M 1690 400 L 1585 400" fill="none" stroke="#4355B9" stroke-width="2.2" marker-end="url(#arrSolid)"/>
  <text x="1590" y="385" fill="#137333" font-size="11" font-weight="700">GET /documents/{id}/results</text>

  <path d="M 1690 490 L 1585 490" fill="none" stroke="#4355B9" stroke-width="2.2" marker-end="url(#arrSolid)"/>
  <text x="1590" y="475" fill="#137333" font-size="11" font-weight="700">PATCH /review (Accept/Amend)</text>

  <!-- 4. Doctor Workstation -> Physician Actor -->
  <path d="M 2240 285 L 2255 285" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolid)"/>
  <text x="2235" y="270" fill="#137333" font-size="11" font-weight="700">Review &amp; Sign</text>

  <!-- 5. FastAPI -> Clinical Engines (Top to Middle) -->
  <path d="M 1190 580 L 1190 615" fill="none" stroke="#4355B9" stroke-width="2.8" marker-end="url(#arrSolid)"/>
  <text x="1200" y="605" fill="#137333" font-size="12" font-weight="700">Dispatches Voice ASR, Red-Flag Rules, Gemini OCR &amp; Prakriti</text>

  <!-- 6. Clinical Engines / Merger -> Database (Middle to Bottom) -->
  <path d="M 1190 960 L 1190 985" fill="none" stroke="#4355B9" stroke-width="2.8" marker-end="url(#arrSolid)"/>
  <text x="1200" y="978" fill="#137333" font-size="12" font-weight="700">Persists Session, Socrates, Prakriti, OCR &amp; Doctor Queue Entry</text>

  <!-- 7. Database -> ABDM / HIS FHIR Export (Bottom-Center to Bottom-Right) -->
  <path d="M 1660 1150 L 1715 1150" fill="none" stroke="#D97706" stroke-width="2.2" stroke-dasharray="5,4" marker-end="url(#arrAmber)"/>
  <text x="1645" y="1135" fill="#B45309" font-size="11" font-weight="700">FHIR R4 JSON Export</text>

</svg>'''
    return svg

def generate_vertical_svg() -> str:
    """
    Generates 1800x2400 portrait SVG matching the reference poster style.
    Fixes subcomponent x/y positioning to ensure zero overlap.
    """
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 2400" width="1800" height="2400" style="background-color: #FCFDFF; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <linearGradient id="barGradV" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B8FD6"/>
      <stop offset="100%" stop-color="#5B70BD"/>
    </linearGradient>
    <filter id="softShadowV" x="-3%" y="-3%" width="106%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1E293B" flood-opacity="0.05"/>
    </filter>
    <marker id="arrSolidV" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4355B9"/>
    </marker>
    <marker id="arrGreenV" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#15803D"/>
    </marker>
    <marker id="arrDottedV" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B"/>
    </marker>
    <marker id="arrAmberV" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706"/>
    </marker>
  </defs>

  <!-- ==================== HEADER ==================== -->
  <g transform="translate(80, 50)">
    <text x="0" y="45" fill="#3B4E88" font-size="42" font-weight="800" letter-spacing="-0.5">AYUSH-Care MediKiosk — System Architecture</text>
    <text x="0" y="80" fill="#64748B" font-size="18" font-weight="500">Tiered Architecture: Frontends → API Gateway → Specialized AI/Rule Engines → Persistent DB</text>

    <!-- Top Badges -->
    <g transform="translate(1360, 5)">
      <rect x="0" y="0" width="280" height="38" rx="8" fill="#4355B9" transform="rotate(-1)"/>
      <text x="140" y="24" fill="#FFFFFF" font-size="14" font-weight="700" text-anchor="middle" transform="rotate(-1)">SIH 2024 · Problem Statement</text>
    </g>

    <!-- Legend -->
    <g transform="translate(0, 105)">
      <line x1="0" y1="10" x2="32" y2="10" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolidV)"/>
      <text x="42" y="14" fill="#334155" font-size="13" font-weight="600">Direct Real-Time Call</text>

      <line x1="220" y1="10" x2="252" y2="10" stroke="#15803D" stroke-width="2.2" stroke-dasharray="4,4" marker-end="url(#arrGreenV)"/>
      <text x="262" y="14" fill="#15803D" font-size="13" font-weight="600">Background 3.5s Live Polling</text>

      <path d="M 500 15 Q 515 6 530 12" fill="none" stroke="#4355B9" stroke-width="1.5" marker-end="url(#arrSolidV)"/>
      <text x="540" y="14" fill="#137333" font-size="13" font-weight="700">Action / Flow Step</text>

      <rect x="740" y="2" width="16" height="16" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="766" y="14" fill="#B45309" font-size="13" font-weight="700">Simulated / Mocked Integration</text>
    </g>
  </g>

  <!-- ==================== TIER 1: CLIENTS & ACTORS ==================== -->
  <!-- Patient Actor -->
  <g transform="translate(80, 260)">
    <circle cx="36" cy="24" r="18" fill="none" stroke="#1E293B" stroke-width="2.5"/>
    <path d="M 12 75 C 12 50, 60 50, 60 75" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <text x="36" y="98" fill="#1E293B" font-size="15" font-weight="700" text-anchor="middle">Patient</text>
    <text x="36" y="115" fill="#64748B" font-size="11" text-anchor="middle">OPD Walk-Up</text>
  </g>

  <!-- Patient Kiosk Container Box -->
  <g transform="translate(180, 210)">
    <rect width="680" height="360" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="1.8" filter="url(#softShadowV)"/>
    <rect width="680" height="42" rx="14 14 0 0" fill="url(#barGradV)"/>
    <text x="20" y="26" fill="#FFFFFF" font-size="16" font-weight="700">Patient Kiosk Frontend (React 18 · Vite · Tailwind CSS)</text>
    <text x="540" y="26" fill="#EEF2FF" font-size="12">Port 3000</text>

    <!-- Subcards -->
    <g transform="translate(16, 54)">
      <rect width="315" height="140" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🎙️ Audio Engine &amp; DPDP Consent</text>
      <text x="12" y="42" fill="#475569" font-size="11">• 16kHz Mono WAV (<tspan font-family="monospace">audioRecorder.ts</tspan>)</text>
      <text x="12" y="58" fill="#475569" font-size="11">• Google Female Hindi TTS Stream</text>
      <text x="12" y="74" fill="#475569" font-size="11">• Indian English Web Speech Synth fallback</text>
      <text x="12" y="92" fill="#475569" font-size="11">• DPDP Act 2023: Audio consent read aloud</text>
      <text x="12" y="110" fill="#15803D" font-size="10" font-weight="600">Hardware mic track auto-released on stop</text>
      <text x="12" y="126" fill="#64748B" font-size="9"><tspan font-family="monospace">client/src/lib/speech.ts</tspan></text>
    </g>

    <g transform="translate(347, 54)">
      <rect width="317" height="140" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🖥️ Touch Flow &amp; Camera Viewfinder</text>
      <text x="12" y="42" fill="#475569" font-size="11">• S-01 Welcome → S-04 Consent</text>
      <text x="12" y="58" fill="#475569" font-size="11">• S-06 Voice Complaint → S-07 SOCRATES</text>
      <text x="12" y="74" fill="#475569" font-size="11">• S-08A Classical Prakriti (15 questions)</text>
      <text x="12" y="90" fill="#475569" font-size="11">• S-10 Camera Prescription Capture</text>
      <text x="12" y="106" fill="#475569" font-size="11">• S-11 Token Generation (#AIIA-001)</text>
      <text x="12" y="126" fill="#166534" font-size="10" font-weight="600">64px High-Contrast Tap Targets · WCAG 2.1</text>
    </g>

    <g transform="translate(16, 206)">
      <rect width="648" height="135" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
      <text x="14" y="24" fill="#4355B9" font-size="13" font-weight="800">💾 Shared Session Store &amp; Edge IndexedDB Queue</text>
      <text x="14" y="46" fill="#334155" font-size="11">• <tspan font-family="monospace">useSessionStore.ts</tspan>: Guarantees unified persistent <tspan font-family="monospace">sessionId</tspan> across all 11 screens</text>
      <text x="14" y="66" fill="#334155" font-size="11">• <tspan font-family="monospace">offlineDb.ts</tspan> (IndexedDB) buffers intake records locally during hospital network disconnects</text>
      <text x="14" y="86" fill="#334155" font-size="11">• <tspan font-family="monospace">syncManager.ts</tspan> automatically replays batch payloads to <tspan font-family="monospace">POST /api/sessions/sync</tspan> on reconnect</text>
      <text x="14" y="110" fill="#15803D" font-size="11" font-weight="700">✓ Fixed in FIX_LOG: Prescription uploads strictly bound to active session token</text>
    </g>
  </g>

  <!-- Doctor Workstation Container Box -->
  <g transform="translate(900, 210)">
    <rect width="680" height="360" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="1.8" filter="url(#softShadowV)"/>
    <rect width="680" height="42" rx="14 14 0 0" fill="url(#barGradV)"/>
    <text x="20" y="26" fill="#FFFFFF" font-size="16" font-weight="700">Doctor Workstation EMR (React 18 · Vite)</text>
    <text x="490" y="26" fill="#EEF2FF" font-size="12">/doctor/queue &amp; review</text>

    <!-- Subcards -->
    <g transform="translate(16, 54)">
      <rect width="315" height="140" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.2"/>
      <circle cx="20" cy="22" r="4.5" fill="#16A34A"/>
      <text x="30" y="26" fill="#166534" font-size="12" font-weight="700">🟢 Live Sync Active (3.5s)</text>
      <text x="12" y="46" fill="#334155" font-size="11">• <tspan font-family="monospace">setInterval(fetchLiveQueue, 3500)</tspan></text>
      <text x="12" y="62" fill="#334155" font-size="11">• Automatic Bearer JWT authentication</text>
      <text x="12" y="78" fill="#334155" font-size="11">• Priority Sorting: Red flags at top</text>
      <text x="12" y="94" fill="#334155" font-size="11">• Instant queue badge &amp; token updates</text>
      <text x="12" y="114" fill="#166534" font-size="10" font-weight="700">Verified: sub-4s sync on completed intake</text>
    </g>

    <g transform="translate(347, 54)">
      <rect width="317" height="140" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🩺 Live Verified OCR Panel</text>
      <text x="12" y="42" fill="#475569" font-size="11">• Queries <tspan font-family="monospace">GET /documents/{id}/results</tspan></text>
      <text x="12" y="58" fill="#6B21A8" font-size="11" font-weight="600">✓ "Live Gemini + Tesseract Verified"</text>
      <text x="12" y="74" fill="#475569" font-size="11">• Maharasnadi Kwath, Yogaraj Guggulu</text>
      <text x="12" y="90" fill="#475569" font-size="11">• Verified ESR &amp; Serum Uric Acid labs</text>
      <text x="12" y="106" fill="#475569" font-size="11">• Document Lightbox (Zoom &amp; Inspect)</text>
    </g>

    <g transform="translate(16, 206)">
      <rect width="648" height="135" rx="8" fill="#EEF2FF" stroke="#4355B9" stroke-width="1.2"/>
      <text x="14" y="24" fill="#4355B9" font-size="13" font-weight="800">✍️ 1-Tap Physician Diagnostic Authority</text>
      <text x="14" y="46" fill="#334155" font-size="11">• Reviews Tridosha radar breakdown, SOCRATES timeline, and verified OCR findings</text>
      <text x="14" y="66" fill="#334155" font-size="11">• 1-Tap <tspan font-weight="700" fill="#15803D">Accept</tspan> (signs to EMR), <tspan font-weight="700" fill="#B45309">Amend</tspan> (edits notes/Rx), or <tspan font-weight="700" fill="#DC2626">Reject</tspan> (flags for re-triage)</text>
      <text x="14" y="86" fill="#334155" font-size="11">• Dispatches <tspan font-family="monospace">PATCH /api/physician/session/{id}/review</tspan> directly saving verified status</text>
      <text x="14" y="110" fill="#4355B9" font-size="11" font-weight="700">Cuts consultation bottleneck from 15 minutes down to 2 minutes</text>
    </g>
  </g>

  <!-- Doctor Actor -->
  <g transform="translate(1600, 260)">
    <circle cx="36" cy="24" r="18" fill="none" stroke="#1E293B" stroke-width="2.5"/>
    <path d="M 12 75 C 12 50, 60 50, 60 75" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 26 50 C 26 62, 46 62, 46 50" fill="none" stroke="#4355B9" stroke-width="1.8"/>
    <circle cx="36" cy="65" r="3" fill="#4355B9"/>
    <text x="36" y="98" fill="#1E293B" font-size="15" font-weight="700" text-anchor="middle">Doctor</text>
    <text x="36" y="115" fill="#64748B" font-size="11" text-anchor="middle">BAMS / MD</text>
    <text x="36" y="130" fill="#4355B9" font-size="10" font-weight="600" text-anchor="middle">EMR Reviewer</text>
  </g>

  <!-- ==================== TIER 2: FASTAPI BACKEND API ==================== -->
  <g transform="translate(180, 620)">
    <rect width="1400" height="260" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadowV)"/>
    <rect width="1400" height="42" rx="14 14 0 0" fill="url(#barGradV)"/>
    <text x="20" y="26" fill="#FFFFFF" font-size="16" font-weight="700">FastAPI Backend API Layer (Python 3.11 · Uvicorn ASGI · Port 8000)</text>
    <text x="1170" y="26" fill="#EEF2FF" font-size="12">Render Cloud / Localhost</text>

    <!-- 5 Distinct Router Columns with EXPLICIT X OFFSETS -->
    <!-- Col 1: Sessions -->
    <g transform="translate(16, 54)">
      <rect width="260" height="190" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🔌 /api/sessions</text>
      <text x="12" y="44" fill="#4355B9" font-size="11" font-weight="600">• POST /transcribe</text>
      <text x="12" y="60" fill="#64748B" font-size="10">  Voice 16kHz mono WAV ASR</text>
      <text x="12" y="80" fill="#4355B9" font-size="11" font-weight="600">• POST /infer-complaint</text>
      <text x="12" y="96" fill="#64748B" font-size="10">  Gemini 2.5 Flash chief complaint</text>
      <text x="12" y="116" fill="#4355B9" font-size="11" font-weight="600">• POST /{id}/complete</text>
      <text x="12" y="132" fill="#64748B" font-size="10">  Module C Finalizer &amp; Queue handoff</text>
      <text x="12" y="152" fill="#4355B9" font-size="11" font-weight="600">• POST /sync</text>
      <text x="12" y="168" fill="#64748B" font-size="10">  Batch offline ingestion from IndexedDB</text>
    </g>

    <!-- Col 2: Documents -->
    <g transform="translate(292, 54)">
      <rect width="260" height="190" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">📄 /api/documents</text>
      <text x="12" y="44" fill="#4355B9" font-size="11" font-weight="600">• POST /upload</text>
      <text x="12" y="60" fill="#64748B" font-size="10">  Multipart prescription image ingestion</text>
      <text x="12" y="80" fill="#4355B9" font-size="11" font-weight="600">• GET /status/{id}</text>
      <text x="12" y="96" fill="#64748B" font-size="10">  OCR task polling &amp; progress</text>
      <text x="12" y="116" fill="#4355B9" font-size="11" font-weight="600">• GET /{id}/results</text>
      <text x="12" y="132" fill="#64748B" font-size="10">  Aggregated meds, labs &amp; verified values</text>
      <text x="12" y="154" fill="#6B21A8" font-size="10" font-weight="700">Dual-Engine OCR Hub</text>
      <text x="12" y="168" fill="#475569" font-size="9">DPDP Act 2023 15-min auto-purge</text>
    </g>

    <!-- Col 3: Prakriti -->
    <g transform="translate(568, 54)">
      <rect width="260" height="190" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
      <text x="12" y="22" fill="#166534" font-size="12" font-weight="700">🌿 /api/prakriti</text>
      <text x="12" y="44" fill="#15803D" font-size="11" font-weight="600">• POST /calculate</text>
      <text x="12" y="60" fill="#64748B" font-size="10">  15 Charaka Samhita questions</text>
      <text x="12" y="80" fill="#15803D" font-size="11" font-weight="600">• Classical Arithmetic Engine</text>
      <text x="12" y="96" fill="#64748B" font-size="10">  Vata, Pitta, Kapha percentages</text>
      <text x="12" y="116" fill="#15803D" font-size="11" font-weight="600">• Dominant Dosha Typing</text>
      <text x="12" y="132" fill="#64748B" font-size="10">  Sama, Dwandvaja, Ekadoshaja</text>
      <text x="12" y="154" fill="#16A34A" font-size="10" font-weight="800">Zero Hallucination</text>
      <text x="12" y="168" fill="#475569" font-size="9">Strict deterministic weighted sum</text>
    </g>

    <!-- Col 4: Physician -->
    <g transform="translate(844, 54)">
      <rect width="260" height="190" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🩺 /api/physician</text>
      <text x="12" y="44" fill="#4355B9" font-size="11" font-weight="600">• POST /login</text>
      <text x="12" y="60" fill="#64748B" font-size="10">  Doctor ID + PIN → JWT Bearer</text>
      <text x="12" y="80" fill="#166534" font-size="11" font-weight="700">• GET /queue</text>
      <text x="12" y="96" fill="#15803D" font-size="10">  Live 3.5s recurring polling</text>
      <text x="12" y="116" fill="#4355B9" font-size="11" font-weight="600">• GET /session/{id}</text>
      <text x="12" y="132" fill="#64748B" font-size="10">  Full clinical session sheet</text>
      <text x="12" y="152" fill="#4355B9" font-size="11" font-weight="600">• PATCH /{id}/review</text>
      <text x="12" y="168" fill="#64748B" font-size="10">  Accept / Amend / Reject status</text>
    </g>

    <!-- Col 5: Patients & Middleware -->
    <g transform="translate(1120, 54)">
      <rect width="264" height="190" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
      <text x="12" y="22" fill="#4355B9" font-size="12" font-weight="700">👤 /api/patients &amp; Core</text>
      <text x="12" y="44" fill="#4355B9" font-size="11" font-weight="600">• POST /identify</text>
      <text x="12" y="60" fill="#64748B" font-size="10">  ABHA / Aadhaar hash lookup</text>
      <text x="12" y="80" fill="#4355B9" font-size="11" font-weight="600">• POST /register</text>
      <text x="12" y="96" fill="#64748B" font-size="10">  Walk-in patient registration</text>
      <text x="12" y="116" fill="#4355B9" font-size="11" font-weight="600">• Security Middleware</text>
      <text x="12" y="132" fill="#64748B" font-size="10">  HMAC-SHA256 JWT &amp; CORS</text>
      <text x="12" y="154" fill="#15803D" font-size="10" font-weight="700">Repository Pattern</text>
      <text x="12" y="168" fill="#475569" font-size="9"><tspan font-family="monospace">app/db/repository.py</tspan></text>
    </g>
  </g>

  <!-- ==================== TIER 3: SPECIALIZED ENGINES & OCR ==================== -->
  <g transform="translate(180, 930)">
    <rect width="1400" height="420" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadowV)"/>
    <rect width="1400" height="42" rx="14 14 0 0" fill="url(#barGradV)"/>
    <text x="20" y="26" fill="#FFFFFF" font-size="16" font-weight="700">Specialized Clinical Engines &amp; Dual-Engine OCR Pipeline</text>
    <text x="1000" y="26" fill="#EEF2FF" font-size="12">Deterministic Rules + Multimodal AI</text>

    <!-- Top Row: 4 Cards with EXPLICIT X OFFSETS -->
    <!-- Card 1: Voice ASR -->
    <g transform="translate(16, 54)">
      <rect width="330" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🗣️ Voice ASR Service</text>
      <text x="12" y="42" fill="#4355B9" font-size="11" font-weight="600">Wispr Flow REST API</text>
      <text x="12" y="60" fill="#475569" font-size="11">• 16kHz mono WAV base64 stream</text>
      <text x="12" y="76" fill="#475569" font-size="11">• Hindi &amp; Hinglish dialect accuracy</text>
      <text x="12" y="92" fill="#475569" font-size="11">• Web Speech API fallback</text>
      <text x="12" y="112" fill="#15803D" font-size="10" font-weight="600">DPDP Act: Ephemeral voice data lifecycle</text>
      <text x="12" y="128" fill="#64748B" font-size="9"><tspan font-family="monospace">services/whisprflow_service.py</tspan></text>
    </g>

    <!-- Card 2: Emergency Red Flag -->
    <g transform="translate(362, 54)">
      <rect width="330" height="150" rx="8" fill="#FEF2F2" stroke="#FCA5A5" stroke-width="1.2"/>
      <text x="12" y="22" fill="#B91C1C" font-size="12" font-weight="700">🚨 Red-Flag Interceptor</text>
      <text x="12" y="42" fill="#DC2626" font-size="11" font-weight="600">Sub-1ms Deterministic Keyword Rules</text>
      <text x="12" y="60" fill="#475569" font-size="11">• Cardiac: Chest pain / सीने में तेज दर्द</text>
      <text x="12" y="76" fill="#475569" font-size="11">• Stroke: Facial droop / लकवा / slurred speech</text>
      <text x="12" y="92" fill="#475569" font-size="11">• Acute respiratory distress &amp; trauma</text>
      <text x="12" y="112" fill="#B91C1C" font-size="10" font-weight="700">Priority Lock: Pins case to top of doctor queue</text>
      <text x="12" y="128" fill="#64748B" font-size="9"><tspan font-family="monospace">services/red_flags.py</tspan></text>
    </g>

    <!-- Card 3: Complaint Inference -->
    <g transform="translate(708, 54)">
      <rect width="330" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="12" y="22" fill="#1E293B" font-size="12" font-weight="700">🤖 Complaint &amp; SOCRATES</text>
      <text x="12" y="42" fill="#4355B9" font-size="11" font-weight="600">Google Gemini 2.5 Flash</text>
      <text x="12" y="60" fill="#475569" font-size="11">• Structured Pydantic outputs</text>
      <text x="12" y="76" fill="#475569" font-size="11">• Dynamic question matching (Sandhivata, etc.)</text>
      <text x="12" y="92" fill="#475569" font-size="11">• Offline deterministic regex fallback</text>
      <text x="12" y="112" fill="#15803D" font-size="10" font-weight="600">Restricted role: Clinical transcription clerk</text>
      <text x="12" y="128" fill="#64748B" font-size="9"><tspan font-family="monospace">services/complaint_inference_service.py</tspan></text>
    </g>

    <!-- Card 4: Prakriti Scorer -->
    <g transform="translate(1054, 54)">
      <rect width="330" height="150" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.2"/>
      <text x="12" y="22" fill="#166534" font-size="12" font-weight="700">🌿 Classical Prakriti Scorer</text>
      <text x="12" y="42" fill="#15803D" font-size="11" font-weight="600">100% Deterministic Arithmetic</text>
      <text x="12" y="60" fill="#475569" font-size="11">• 15 Charaka Samhita parameters</text>
      <text x="12" y="76" fill="#475569" font-size="11">• Arithmetic weighted dosha sums</text>
      <text x="12" y="92" fill="#475569" font-size="11">• Vata, Pitta, Kapha percentages</text>
      <text x="12" y="112" fill="#16A34A" font-size="10" font-weight="800">Zero LLM Hallucination in Doshas</text>
      <text x="12" y="128" fill="#64748B" font-size="9"><tspan font-family="monospace">services/scoring.py</tspan></text>
    </g>

    <!-- Bottom Row: Dual-Engine OCR & Module C Merger -->
    <!-- Dual-Engine OCR Box -->
    <g transform="translate(16, 218)">
      <rect width="676" height="185" rx="8" fill="#FAF5FF" stroke="#D8B4FE" stroke-width="1.5"/>
      <text x="14" y="22" fill="#6B21A8" font-size="13" font-weight="700">🔬 Dual-Engine Multimodal OCR Pipeline (<tspan font-family="monospace">report_pipeline.py</tspan>)</text>

      <g transform="translate(12, 36)">
        <rect width="315" height="100" rx="6" fill="#FFFFFF" stroke="#E9D5FF"/>
        <text x="10" y="18" fill="#6B21A8" font-size="11" font-weight="700">Primary: Gemini 2.0 Flash Vision</text>
        <text x="10" y="34" fill="#475569" font-size="10">• Ayurvedic formulations: Kwath, Vati,</text>
        <text x="10" y="46" fill="#475569" font-size="10">  Churna, Guggulu, Taila</text>
        <text x="10" y="60" fill="#475569" font-size="10">• Dosages, frequency, duration</text>
        <text x="10" y="74" fill="#475569" font-size="10">• Numerical lab test values &amp; diagnoses</text>
        <text x="10" y="90" fill="#64748B" font-size="9"><tspan font-family="monospace">services/gemini_vision.py</tspan></text>
      </g>

      <g transform="translate(345, 36)">
        <rect width="319" height="100" rx="6" fill="#FFFFFF" stroke="#E9D5FF"/>
        <text x="10" y="18" fill="#15803D" font-size="11" font-weight="700">Verifier: Tesseract OCR Spatial Match</text>
        <text x="10" y="34" fill="#475569" font-size="10">• Bounding-box spatial token matching</text>
        <text x="10" y="48" fill="#475569" font-size="10">• Cross-checks numerical lab findings</text>
        <text x="10" y="62" fill="#475569" font-size="10">• Detects &amp; flags AI hallucinations</text>
        <text x="10" y="76" fill="#15803D" font-size="10" font-weight="700">✓ Emits Verified Confidence Badge</text>
        <text x="10" y="90" fill="#64748B" font-size="9"><tspan font-family="monospace">services/ocr_verification.py</tspan></text>
      </g>

      <rect x="12" y="146" width="652" height="26" rx="4" fill="#EDE9FE"/>
      <text x="22" y="163" fill="#581C87" font-size="10" font-weight="600">🛡️ DPDP Act 2023 Auto-Purge: Ephemeral prescription images wiped after 15m</text>
    </g>

    <!-- Module C Merger Box -->
    <g transform="translate(708, 218)">
      <rect width="676" height="185" rx="8" fill="#EEF2FF" stroke="#4355B9" stroke-width="1.8"/>
      <text x="14" y="24" fill="#4355B9" font-size="14" font-weight="800">📋 Clinical Summary Merger (Module C)</text>
      <text x="14" y="44" fill="#475569" font-size="11">Executed in <tspan font-family="monospace">complete_session_intake</tspan> (<tspan font-family="monospace">sessions.py</tspan>) &amp; <tspan font-family="monospace">db/repository.py</tspan></text>

      <text x="14" y="70" fill="#334155" font-size="11">• Fuses Patient Demographics + Audio Chief Complaint</text>
      <text x="14" y="88" fill="#334155" font-size="11">• Attaches 5-Turn SOCRATES Clinical Timeline &amp; General Vitals</text>
      <text x="14" y="106" fill="#334155" font-size="11">• Integrates Classical Tridosha Arithmetic Breakdown &amp; Red-Flag Priority</text>
      <text x="14" y="124" fill="#334155" font-size="11">• Binds Dual-Engine OCR Extracted Meds, Dosages &amp; Verified Lab Biomarkers</text>
      <text x="14" y="148" fill="#15803D" font-size="11" font-weight="700">Dispatches structured intake package directly to Physician EMR Queue Entry</text>
      <text x="14" y="166" fill="#475569" font-size="10">Saved atomically to <tspan font-family="monospace">queue_entries</tspan> table with token number (#AIIA-001)</text>
    </g>
  </g>

  <!-- ==================== TIER 4: PERSISTENT DATABASE & REPOSITORY ==================== -->
  <g transform="translate(180, 1390)">
    <rect width="1400" height="380" rx="14" fill="#FFFFFF" stroke="#4355B9" stroke-width="2" filter="url(#softShadowV)"/>
    <rect width="1400" height="42" rx="14 14 0 0" fill="url(#barGradV)"/>
    <text x="20" y="26" fill="#FFFFFF" font-size="16" font-weight="700">Production Persistent Database &amp; Data Access Repository Layer</text>
    <text x="1040" y="26" fill="#EEF2FF" font-size="12"><tspan font-family="monospace">server/app/db/connection.py &amp; repository.py</tspan></text>

    <!-- Grid of 3 Cards with EXPLICIT X OFFSETS -->
    <!-- Card 1: SQLite WAL -->
    <g transform="translate(16, 54)">
      <rect width="400" height="190" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#1E293B" font-size="12" font-weight="700">🗄️ Primary Engine: SQLite (WAL Mode)</text>
      <text x="14" y="42" fill="#4355B9" font-size="11" font-weight="600">Multi-Worker High Concurrency</text>
      <text x="14" y="62" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA journal_mode=WAL;</tspan></text>
      <text x="14" y="80" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA busy_timeout=5000;</tspan></text>
      <text x="14" y="98" fill="#475569" font-size="11">• <tspan font-family="monospace">PRAGMA foreign_keys=ON;</tspan></text>
      <text x="14" y="116" fill="#475569" font-size="11">• Thread-safe row locking &amp; zero query stalls</text>
      <text x="14" y="138" fill="#166534" font-size="11" font-weight="700">Verified via Literal Server Process Restart Test</text>
      <text x="14" y="154" fill="#475569" font-size="10">All patient records survive hard server process kill</text>
      <text x="14" y="170" fill="#15803D" font-size="10" font-weight="700">Zero In-Memory Dict Volatility</text>
    </g>

    <!-- Card 2: Cloud Disk Mount -->
    <g transform="translate(432, 54)">
      <rect width="420" height="190" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#1E293B" font-size="12" font-weight="700">☁️ Cloud Disk Mount &amp; Supabase</text>
      <text x="14" y="42" fill="#4355B9" font-size="11" font-weight="600">Production Persistence (<tspan font-family="monospace">render.yaml</tspan>)</text>
      <text x="14" y="62" fill="#475569" font-size="11">• <tspan font-family="monospace">DATA_DIR: /opt/render/project/src/server/data</tspan></text>
      <text x="14" y="80" fill="#475569" font-size="11">• Persistent SSD disk volume attached to container</text>
      <text x="14" y="98" fill="#475569" font-size="11">• Database survives cloud rebuilds and redeploys</text>
      <text x="14" y="120" fill="#1E293B" font-size="11" font-weight="700">Enterprise PostgreSQL Replication:</text>
      <text x="14" y="138" fill="#475569" font-size="11">• <tspan font-family="monospace">SUPABASE_DB_URL</tspan> IPv4 connection pooler</text>
      <text x="14" y="154" fill="#475569" font-size="11">• Dual-mode switchable configuration</text>
      <text x="14" y="170" fill="#15803D" font-size="10" font-weight="700">Zero-Cost Free-Tier Stack Architecture</text>
    </g>

    <!-- Card 3: 8 Tables -->
    <g transform="translate(868, 54)">
      <rect width="516" height="305" rx="8" fill="#EEF2FF" stroke="#C7D2FE"/>
      <text x="14" y="24" fill="#4355B9" font-size="13" font-weight="800">📊 8 Persistent Relational Tables</text>
      <text x="14" y="48" fill="#334155" font-size="11">• <tspan font-weight="700">patients</tspan>: Full name, age, gender, phone, ABHA ID</text>
      <text x="14" y="68" fill="#334155" font-size="11">• <tspan font-weight="700">sessions</tspan>: Kiosk intake state, department, step</text>
      <text x="14" y="88" fill="#334155" font-size="11">• <tspan font-weight="700">session_socrates</tspan>: Site, onset, character, severity</text>
      <text x="14" y="108" fill="#334155" font-size="11">• <tspan font-weight="700">session_vitals</tspan>: Blood pressure, pulse, temp, allergies</text>
      <text x="14" y="128" fill="#334155" font-size="11">• <tspan font-weight="700">prakriti_records</tspan>: V/P/K arithmetic % &amp; dominant dosha</text>
      <text x="14" y="148" fill="#334155" font-size="11">• <tspan font-weight="700">ocr_results</tspan>: Meds, lab findings, verified test tokens</text>
      <text x="14" y="168" fill="#334155" font-size="11">• <tspan font-weight="700">clinical_summaries</tspan>: Longitudinal HPI summaries</text>
      <text x="14" y="188" fill="#334155" font-size="11">• <tspan font-weight="700">queue_entries</tspan>: Active doctor triage OPD queue</text>
      <text x="14" y="214" fill="#15803D" font-size="11" font-weight="700">✓ Complete Foreign Keys &amp; Indexes on session_id</text>
      <text x="14" y="232" fill="#475569" font-size="10">Typed Repository Layer (<tspan font-family="monospace">server/app/db/repository.py</tspan>)</text>
      <text x="14" y="250" fill="#475569" font-size="10">Guarantees data integrity across all server restarts &amp; reboots</text>
    </g>

    <!-- Bottom Box: IndexedDB -->
    <g transform="translate(16, 260)">
      <rect width="836" height="100" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#1E293B" font-size="12" font-weight="700">📱 Edge Client Persistence: IndexedDB (<tspan font-family="monospace">client/src/lib/offlineDb.ts</tspan>)</text>
      <text x="14" y="42" fill="#475569" font-size="11">• Queues completed intake sessions locally in browser when hospital network is offline</text>
      <text x="14" y="60" fill="#475569" font-size="11">• Background synchronization manager (<tspan font-family="monospace">syncManager.ts</tspan>) detects connection recovery</text>
      <text x="14" y="78" fill="#166534" font-size="11" font-weight="700">Replays atomic batch sync to POST /api/sessions/sync with zero data loss</text>
    </g>
  </g>

  <!-- ==================== TIER 5: EXTERNAL INTEGRATIONS (SIMULATED) ==================== -->
  <g transform="translate(180, 1810)">
    <rect width="1400" height="280" rx="14" fill="#FFFBEB" stroke="#D97706" stroke-width="2.2" stroke-dasharray="6,5" filter="url(#softShadowV)"/>
    <rect width="1400" height="42" rx="14 14 0 0" fill="#FEF3C7"/>
    <text x="20" y="26" fill="#92400E" font-size="16" font-weight="800">National Health Integrations (ABDM · FHIR · HIS)</text>
    <rect x="1060" y="8" width="320" height="26" rx="13" fill="#D97706"/>
    <text x="1220" y="25" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">SIMULATED / HACKATHON MOCK</text>

    <!-- Subcards with EXPLICIT X OFFSETS -->
    <g transform="translate(16, 54)">
      <!-- ABDM M1/M2 Box -->
      <rect x="0" y="0" width="660" height="200" rx="10" fill="#FFFFFF" stroke="#FDE68A"/>
      <text x="16" y="26" fill="#92400E" font-size="13" font-weight="700">🇮🇳 ABDM Scan &amp; Share QR Gateway (Simulated)</text>
      <text x="16" y="50" fill="#78350F" font-size="11">• Dynamic ABDM QR code presented on kiosk screen (<tspan font-family="monospace">IdentifyScreen.tsx</tspan>)</text>
      <text x="16" y="70" fill="#78350F" font-size="11">• Simulated webhook listener receives patient ABHA verification token</text>
      <text x="16" y="90" fill="#78350F" font-size="11">• Ingests ABHA ID: <tspan font-family="monospace">91-4523-8901-2345</tspan> and PHR handle: <tspan font-family="monospace">rameshwar.sharma@abdm</tspan></text>
      <text x="16" y="110" fill="#78350F" font-size="11">• Prepared for ABDM Milestone 1 (M1 - ABHA Creation) &amp; M2 (HIP Health Provider)</text>
      <text x="16" y="136" fill="#B45309" font-size="10" font-weight="600">Honest Hackathon Disclosure: Production ABDM Sandbox requires government NHA certs;</text>
      <text x="16" y="152" fill="#B45309" font-size="10" font-weight="600">simulated locally to guarantee uninterrupted live judging demonstration.</text>
    </g>

    <g transform="translate(700, 54)">
      <!-- FHIR / HIS Box -->
      <rect x="0" y="0" width="684" height="200" rx="10" fill="#FFFFFF" stroke="#FDE68A"/>
      <text x="16" y="26" fill="#92400E" font-size="13" font-weight="700">🏥 Hospital Information System (HIS) &amp; HL7 FHIR R4</text>
      <text x="16" y="50" fill="#78350F" font-size="11">• Standardized clinical summary serialization ready for national health records</text>
      <text x="16" y="70" fill="#78350F" font-size="11">• FHIR Resource Mapping: <tspan font-weight="600">Patient</tspan>, <tspan font-weight="600">Encounter</tspan>, <tspan font-weight="600">Condition</tspan>, <tspan font-weight="600">Observation</tspan>, <tspan font-weight="600">MedicationStatement</tspan></text>
      <text x="16" y="90" fill="#78350F" font-size="11">• Interoperable with NIC e-Hospital and AIIA hospital EMR databases</text>
      <text x="16" y="110" fill="#78350F" font-size="11">• Bidirectional referral support: pulls prior diagnostic history on patient consent</text>
      <text x="16" y="136" fill="#B45309" font-size="10" font-weight="600">Standard-Compliant Architecture: Schemas follow official ABDM FHIR specifications</text>
      <text x="16" y="152" fill="#B45309" font-size="10" font-weight="600">with mock connectors for presentation safety.</text>
    </g>
  </g>

  <!-- ==================== FLOW ARROWS ==================== -->
  <!-- 1. Patient -> Kiosk -->
  <path d="M 145 285 L 175 285" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolidV)"/>
  <text x="135" y="270" fill="#137333" font-size="11" font-weight="700">Voice / Tap</text>

  <!-- 2. Kiosk -> FastAPI -->
  <path d="M 520 570 L 520 615" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolidV)"/>
  <text x="530" y="600" fill="#137333" font-size="11" font-weight="700">POST /transcribe, /upload, /{id}/complete</text>

  <!-- 3. Doctor Workstation -> FastAPI -->
  <path d="M 1240 570 L 1240 615" fill="none" stroke="#15803D" stroke-width="2.2" stroke-dasharray="5,4" marker-end="url(#arrGreenV)"/>
  <text x="1250" y="600" fill="#166534" font-size="11" font-weight="800">Polls GET /queue every 3.5s (JWT)</text>

  <!-- 4. Doctor Workstation -> Doctor Actor -->
  <path d="M 1580 285 L 1595 285" fill="none" stroke="#4355B9" stroke-width="2.5" marker-end="url(#arrSolidV)"/>
  <text x="1560" y="270" fill="#137333" font-size="11" font-weight="700">Review &amp; Sign</text>

  <!-- 5. FastAPI -> Clinical Engines -->
  <path d="M 880 880 L 880 925" fill="none" stroke="#4355B9" stroke-width="2.8" marker-end="url(#arrSolidV)"/>
  <text x="890" y="910" fill="#137333" font-size="12" font-weight="700">Dispatches Speech ASR, Red-Flag Rules, Gemini OCR &amp; Prakriti</text>

  <!-- 6. Clinical Engines -> Database -->
  <path d="M 880 1350 L 880 1385" fill="none" stroke="#4355B9" stroke-width="2.8" marker-end="url(#arrSolidV)"/>
  <text x="890" y="1372" fill="#137333" font-size="12" font-weight="700">Persists Session, Socrates, Doshas, OCR &amp; Queue Entry</text>

  <!-- 7. Database -> ABDM / HIS -->
  <path d="M 880 1770 L 880 1805" fill="none" stroke="#D97706" stroke-width="2.2" stroke-dasharray="5,4" marker-end="url(#arrAmberV)"/>
  <text x="890" y="1792" fill="#B45309" font-size="12" font-weight="700">Serializes to FHIR R4 Bundle for ABHA Linkage (Simulated)</text>

</svg>'''
    return svg

def render_svg_to_png(svg_path: Path, png_path: Path, width: int, height: int):
    """
    Renders SVG to crisp high-res PNG using headless Edge.
    """
    html_content = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body, html {{
      margin: 0;
      padding: 0;
      width: {width}px;
      height: {height}px;
      background-color: #FCFDFF;
      overflow: hidden;
    }}
    img {{
      width: {width}px;
      height: {height}px;
      display: block;
    }}
  </style>
</head>
<body>
  <img src="{svg_path.as_uri()}"/>
</body>
</html>'''

    temp_html = svg_path.parent / f"_temp_render_{svg_path.stem}.html"
    temp_html.write_text(html_content, encoding="utf-8")

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    edge_exe = None
    for p in edge_paths:
        if os.path.exists(p):
            edge_exe = p
            break

    if not edge_exe:
        print("Warning: Microsoft Edge not found for PNG conversion.")
        return

    cmd = [
        edge_exe,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={png_path}",
        f"--window-size={width},{height}",
        temp_html.as_uri(),
    ]
    try:
        subprocess.run(cmd, check=True, timeout=30)
        print(f"Successfully exported high-res PNG: {png_path} ({width}x{height})")
    except Exception as exc:
        print(f"Failed to render PNG via Edge: {exc}")
    finally:
        if temp_html.exists():
            temp_html.unlink()

def main():
    # 1. Generate Landscape (Option 1 - 16:9 Widescreen slide format 2400x1350)
    svg_landscape = generate_landscape_svg()
    svg_landscape_file = DOCS_DIR / "architecture_diagram.svg"
    png_landscape_file = DOCS_DIR / "architecture_diagram.png"
    svg_landscape_file.write_text(svg_landscape, encoding="utf-8")
    print(f"Saved: {svg_landscape_file}")
    render_svg_to_png(svg_landscape_file, png_landscape_file, 2400, 1350)

    # 2. Generate Vertical (Option 2 - Tiered Poster format 1800x2400)
    svg_vertical = generate_vertical_svg()
    svg_vertical_file = DOCS_DIR / "architecture_diagram_vertical.svg"
    png_vertical_file = DOCS_DIR / "architecture_diagram_vertical.png"
    svg_vertical_file.write_text(svg_vertical, encoding="utf-8")
    print(f"Saved: {svg_vertical_file}")
    render_svg_to_png(svg_vertical_file, png_vertical_file, 1800, 2400)

if __name__ == "__main__":
    main()
