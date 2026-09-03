# Pre-Medical Report Summarizer (Backend MVP)

An accurate, production-style backend MVP for clinical document summarization and independent numeric verification. The service ingests multiple medical report images (e.g. lab results, radiology findings, discharge summaries), performs multimodal clinical data extraction using Gemini, independently verifies extracted numerical values against the original uploaded images using Tesseract OCR, and stores structured outputs locally for downstream database ingestion.

---

## 1. Architecture Overview

```
                          Frontend Client
                                 │
                                 ▼ (multipart/form-data)
                      FastAPI Backend Router
                     [POST /api/process-reports]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Original Image Storage           Report & Page Grouping
      [storage/uploads/*.jpg]                    │
                 │                               ▼
                 │                    Gemini Multimodal Analysis
                 │                    - Level 1 Report Extraction
                 │                    - Strict medical accuracy rules
                 │                               │
                 │                               ▼
                 │                     Gemini Structured Output
                 │                     [Report Findings & Tests]
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                     Tesseract OCR Verification
                     (Runs on ORIGINAL uploaded images)
                     - RapidFuzz alias matching
                     - Spatial row search (±1.5x height, +400px)
                     - Tesseract confidence >= 80 threshold
                     - Comparison vs Gemini extracted value
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        Values Consistent & Conf >= 80     Mismatch, Conf < 80, or Not Found
              [status: verified]              [status: mismatch / unclear / not_found]
            [final_value: unchanged]                 [final_value: "unclear"]
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                    Individual Report JSON Files
                 [storage/results/reports/*.json]
                                 │
                                 ▼
                     Gemini Synthesis Engine
                 - Level 2 Longitudinal History
                                 │
                                 ▼
                   Patient Session JSON File
             [storage/results/patient_session_<id>.json]
                                 │
                                 ▼
                       FastAPI Client Response
             {status, patient_session_id, reports_processed, result_file}
```

---

## 2. Key Features

1. **Native Multimodal Image Input**:
   Uses the official Google GenAI SDK (`google-genai`) with native multimodal image support. The images are passed directly to Gemini for clinical comprehension without losing document visual layout.
2. **Independent Tesseract OCR Numeric Verification**:
   Tesseract does **not** interpret or summarize the report. Instead, it inspects the **original uploaded image** to independently verify numerical test values extracted by Gemini:
   - Locates test labels using rapid fuzzy matching (`rapidfuzz.fuzz.partial_ratio`) against medical alias dictionaries (e.g., *Hb*, *HGB*, *Haemoglobin*).
   - Searches bounding box windows on the same row (up to +400px horizontally, ±1.5× label height vertically) and immediate wrapped lines.
   - Evaluates OCR confidence (`TESSERACT_CONFIDENCE_THRESHOLD`, default `80`).
   - Compares the OCR value against Gemini's value. If consistent and confident, marks `verified`. If mismatched, low confidence, or missing, safely assigns `"unclear"`.
3. **Medical Safety & Conservative Rules**:
   - Never hallucinates or converts abnormal test values into medical diagnoses.
   - Unclear, obscured, or ambiguous numbers are explicitly set to `"unclear"`.
   - Never crashes on OCR token misses or uninstalled Tesseract; degrades gracefully to `"unclear"` / `"not_found"`.
4. **Decoupled File-Based Backend**:
   Generated results and original images are saved locally to disk. Downstream database or pipeline teams can consume the JSON files at their convenience.

---

## 3. Directory Structure

```
.
├── backend/
│   ├── config.py                 # Pydantic settings & environment configuration
│   ├── main.py                   # FastAPI app, CORS, routes & exception handlers
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py            # Pydantic schemas (Extraction, Findings, Verification, Session)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_service.py     # Gemini multimodal extraction & longitudinal synthesis
│   │   ├── ocr_service.py        # Tesseract bounding box search, fuzzy match & verification
│   │   └── report_service.py     # Orchestration, grouping, verification & JSON persistence
│   └── utils/
│       ├── __init__.py
│       ├── aliases.py            # Medical test alias dictionary & numeric normalizers
│       └── file_validation.py    # MIME validation, Pillow corruption check & sanitization
├── storage/
│   ├── uploads/                  # Preserved original uploaded images
│   └── results/
│       ├── reports/              # Level 1: Individual report structured JSONs
│       └── patient_session_*.json# Level 2: Overall longitudinal patient history JSONs
├── tests/
│   ├── test_api_flow.py          # End-to-end FastAPI integration & pipeline tests
│   ├── test_file_validation.py   # File validation, size limits & corruption tests
│   ├── test_ocr_verification.py  # Fuzzy alias matching & OCR bounding box logic tests
│   └── test_schemas.py           # Pydantic schema validation tests
├── .env                          # Local environment settings
├── .env.example                  # Environment configuration template
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Project dependencies
└── README.md                     # Documentation
```

---

## 4. Requirements & Prerequisites

- **Python**: 3.10 to 3.14 recommended.
- **Gemini API Key**: A Google AI Studio API key.
  > **Note**: Gemini API usage is separate from consumer Google Gemini applications. You must obtain an API key from [Google AI Studio](https://aistudio.google.com/).
- **Tesseract OCR**:
  - **Windows**: Install via UB-Mannheim installer or set `TESSERACT_CMD` in `.env`.
    - Standard install path: `C:\Program Files\Tesseract-OCR\tesseract.exe`.
  - **macOS**: `brew install tesseract`
  - **Ubuntu / Debian**: `sudo apt-get install tesseract-ocr`
  *(Note: If Tesseract is not installed, the backend continues running safely, marking unverified values as `not_found` / `unclear`)*.

---

## 5. Installation & Setup

1. **Clone or Navigate to the Directory**:
   ```bash
   cd "take1"
   ```

2. **Create and Activate Virtual Environment**:
   - Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - Linux / macOS:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your API key:
   ```env
   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.6-flash

   # Tesseract OCR Verification Configuration
   TESSERACT_CONFIDENCE_THRESHOLD=80
   # Optional custom path if tesseract is not in PATH:
   # TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   TESSERACT_CMD=

   # RapidFuzz similarity threshold (0 - 100)
   RAPIDFUZZ_SIMILARITY_THRESHOLD=80

   # Upload size limit in bytes (15 MB default)
   MAX_UPLOAD_SIZE=15728640

   # Storage directory
   STORAGE_DIR=storage
   ```

---

## 6. Running the Server

Start the FastAPI application with Uvicorn:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Once running:
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

---

## 7. API Reference

### Health Check
`GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "tesseract_ocr_available": true,
  "gemini_api_configured": true,
  "gemini_model": "gemini-3.6-flash",
  "confidence_threshold": 80.0,
  "storage_uploads_dir": "storage\\uploads",
  "storage_results_dir": "storage\\results"
}
```

---

### Process Medical Reports
`POST /api/process-reports`

Content-Type: `multipart/form-data`

#### Parameters:
- `files`: Multiple image files (`image/jpeg`, `image/png`, `image/webp`, `image/tiff`).
- `report_grouping` *(Optional form field)*: JSON string mapping report IDs to uploaded filenames.

#### Report Grouping Logic:
1. **Explicit Grouping**: If `report_grouping` is provided:
   ```json
   {
     "report_001": ["page1.jpg", "page2.jpg"],
     "report_002": ["page3.jpg"]
   }
   ```
2. **Filename Convention**: If filenames contain patterns like `report_001_page_01.jpg`, `report_001_page_02.jpg`, or `cbc_p1.png`, the backend automatically groups them by prefix and orders them by page.
3. **Fallback**: Each individual uploaded image is treated as a separate single-page report (`report_001`, `report_002`, ...).

#### Example Request (`curl`):
```bash
curl -X POST "http://localhost:8000/api/process-reports" \
  -F "files=@storage/sample/report_001_page_01.jpg" \
  -F "files=@storage/sample/report_001_page_02.jpg"
```

#### Example Response:
```json
{
  "status": "completed",
  "patient_session_id": "session_a8b9c0d1e2",
  "reports_processed": 1,
  "result_file": "storage/results/patient_session_session_a8b9c0d1e2.json",
  "message": "Reports processed, verified, and saved successfully."
}
```

---

## 8. Stored JSON Schemas (For Database Team)

All processing outputs are persisted on disk so downstream teams can consume them asynchronously.

### A. Individual Report JSON (`storage/results/reports/<report_id>.json`)
```json
{
  "report_id": "report_001",
  "report_type": "Dental Radiographic Examination (IOPA)",
  "medical_specialty": "Dental",
  "report_date": "2026-08-20",
  "facility_name": "Metro Dental Clinic",
  "source_pages": [
    "session_a8b9c0d1e2_report_001_page_01_a1b2c3.jpg"
  ],
  "summary": "The IOPA radiograph shows coronal radiolucency and PDL widening on tooth 6.",
  "findings": [
    {
      "test_name": "IOPA Radiograph - Upper Right Tooth 6",
      "value": "Coronal radiolucency with PDL widening",
      "unit": null,
      "reference_range": null,
      "status": "ABNORMAL",
      "explanation": "Indicates dental decay extending into dentin with periapical ligament widening."
    }
  ],
  "observations": [
    "Coronal radiolucency involving enamel and dentin."
  ],
  "impression": "Apical periodontitis wrt upper right 6.",
  "doctor_remarks": "Refer to Endodontics.",
  "diagnoses": [
    "Apical periodontitis"
  ],
  "medications": [],
  "clinical_history": [],
  "uncertain_information": [],
  "value_verification": []
}
```

### B. Patient Session Longitudinal Summary (`storage/results/patient_session_<id>.json`)
```json
{
  "patient_session_id": "session_a8b9c0d1e2",
  "overall_summary": {
    "past_medical_surgical_history": "History of dental restoration on tooth 36. Non-contributory medical history.",
    "drug_allergy_history": "Not documented in the provided records.",
    "family_history": "Not documented in the provided records.",
    "personal_history": "Not documented in the provided records.",
    "review_of_systems": "Reports decayed lower back teeth with food lodgement.",
    "prior_investigations_summary": "IOPA radiographs showed apical periodontitis on upper right 6 and dentinal caries on 7."
  },
  "reports": [
    {
      "report_id": "report_001",
      "report_type": "Dental Radiographic Examination (IOPA)",
      "medical_specialty": "Dental",
      "report_summary_file": "storage/results/reports/report_001.json"
    }
  ],
  "reports_by_specialty": {
    "Dental": [
      {
        "report_id": "report_001",
        "report_type": "Dental Radiographic Examination (IOPA)",
        "medical_specialty": "Dental",
        "report_summary_file": "storage/results/reports/report_001.json"
      }
    ]
  },
  "uncertain_information": [],
  "disclaimer": "This system summarizes information contained in uploaded medical records and does not provide a medical diagnosis or treatment recommendation."
}
```
  "disclaimer": "This system summarizes information contained in uploaded medical records and does not provide a medical diagnosis or treatment recommendation."
}
```

### Downstream Ingestion Guidance:
1. Parse the session file at `storage/results/patient_session_<id>.json`.
2. For each entry in `reports`, read the detailed report JSON at `report_summary_file`.
3. Ingest `findings` and `value_verification` rows into relational tables using `patient_session_id` and `report_id` as foreign keys.
4. Link `source_pages` to the stored images located in `storage/uploads/`.

---

## 9. Testing & Quality Assurance

Run the automated test suite:

```powershell
.venv\Scripts\pytest.exe -v
```

All 16 unit and integration test cases cover:
- Pydantic schema validation & verification states
- File validation (MIME types, size limits, corruption detection, path sanitization)
- Tesseract spatial window bounding-box search and fuzzy alias matching
- Confidence thresholds and mismatch handling
- End-to-end FastAPI endpoint execution with multi-page grouping
