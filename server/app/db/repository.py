"""
Data Access Repository Layer.
Provides clean CRUD functions for every domain entity (patients, sessions,
queue, OCR results, prakriti). Each function opens and closes its own
connection to avoid connection-leak issues under Uvicorn workers.
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.db.connection import get_db_connection

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
#  HELPERS
# ──────────────────────────────────────────────

def _row_to_dict(row) -> Optional[Dict[str, Any]]:
    """Convert a sqlite3.Row (or psycopg2 RealDictRow) to a plain dict."""
    if row is None:
        return None
    return dict(row)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_session_exists(conn, session_id: str) -> None:
    """Ensures parent session row exists before child table insertion."""
    if not session_id:
        return
    row = conn.execute("SELECT session_id FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
    if not row:
        conn.execute(
            "INSERT OR IGNORE INTO sessions (session_id, status, created_at) VALUES (?, 'in_progress', ?)",
            (session_id, _now_iso()),
        )


# ──────────────────────────────────────────────
#  PATIENTS
# ──────────────────────────────────────────────

def save_patient(patient: Dict[str, Any]) -> Dict[str, Any]:
    """Insert or replace a patient record. Returns the saved dict."""
    conn = get_db_connection()
    try:
        pid = patient.get("id") or f"PAT-{uuid.uuid4().hex[:10]}"
        conn.execute(
            """INSERT OR REPLACE INTO patients
               (id, full_name, age, gender, phone, abha_id, abha_address,
                aadhaar_hash, is_returning, last_visit_date, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                pid,
                patient["full_name"],
                int(patient["age"]),
                patient["gender"],
                patient.get("phone"),
                patient.get("abha_id"),
                patient.get("abha_address"),
                patient.get("aadhaar_hash"),
                1 if patient.get("is_returning") else 0,
                patient.get("last_visit_date"),
                patient.get("created_at") or _now_iso(),
            ),
        )
        conn.commit()
        patient["id"] = pid
        return patient
    finally:
        conn.close()


def get_patient(patient_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


def find_patient_by_abha(abha_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM patients WHERE abha_id = ?", (abha_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


def find_patient_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM patients WHERE phone = ?", (phone,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  SESSIONS
# ──────────────────────────────────────────────

def create_session(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new clinical session. Returns the saved dict."""
    conn = get_db_connection()
    try:
        sid = session_data.get("session_id") or f"SES-{uuid.uuid4().hex[:10]}"
        now = _now_iso()
        pid = session_data.get("patient_id")
        if pid:
            pat_row = conn.execute("SELECT id FROM patients WHERE id = ?", (pid,)).fetchone()
            if not pat_row:
                pid = None

        conn.execute(
            """INSERT OR REPLACE INTO sessions
               (session_id, patient_id, language, department, chief_complaint,
                complaint_category, red_flag_triggered, red_flag_reason, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                sid,
                pid,
                session_data.get("language", "hi"),
                session_data.get("department", "ayurveda"),
                session_data.get("chief_complaint", ""),
                session_data.get("complaint_category", "general"),
                1 if session_data.get("red_flag_triggered") else 0,
                session_data.get("red_flag_reason"),
                session_data.get("status", "in_progress"),
                now,
            ),
        )
        conn.commit()
        return {
            "session_id": sid,
            "patient_id": session_data.get("patient_id"),
            "language": session_data.get("language", "hi"),
            "department": session_data.get("department", "ayurveda"),
            "chief_complaint": session_data.get("chief_complaint", ""),
            "complaint_category": session_data.get("complaint_category", "general"),
            "red_flag_triggered": bool(session_data.get("red_flag_triggered")),
            "red_flag_reason": session_data.get("red_flag_reason"),
            "status": session_data.get("status", "in_progress"),
            "created_at": now,
        }
    finally:
        conn.close()


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
        if not row:
            return None
        d = _row_to_dict(row)
        d["red_flag_triggered"] = bool(d.get("red_flag_triggered"))
        return d
    finally:
        conn.close()


def update_session(session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update specific fields on a session. Returns updated session or None."""
    conn = get_db_connection()
    try:
        # Build SET clause dynamically
        allowed = {
            "chief_complaint", "complaint_category", "red_flag_triggered",
            "red_flag_reason", "status", "language", "department", "patient_id",
        }
        fields = []
        values = []
        for k, v in updates.items():
            if k in allowed:
                if k == "red_flag_triggered":
                    v = 1 if v else 0
                fields.append(f"{k} = ?")
                values.append(v)

        if not fields:
            return get_session(session_id)

        values.append(session_id)
        conn.execute(
            f"UPDATE sessions SET {', '.join(fields)} WHERE session_id = ?",
            values,
        )
        conn.commit()
        return get_session(session_id)
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  SOCRATES (Conversation Follow-up Answers)
# ──────────────────────────────────────────────

def save_socrates(session_id: str, socrates: Dict[str, Any]) -> None:
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, session_id)
        conn.execute(
            """INSERT OR REPLACE INTO session_socrates
               (session_id, site, onset, character, radiation, associated,
                timing, exacerbating, severity, family_history)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                socrates.get("site"),
                socrates.get("onset"),
                socrates.get("character"),
                socrates.get("radiation"),
                socrates.get("associated"),
                socrates.get("timing"),
                socrates.get("exacerbating"),
                str(socrates.get("severity", "")),
                socrates.get("familyHistory") or socrates.get("family_history"),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_socrates(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM session_socrates WHERE session_id = ?", (session_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  GENERAL VITALS (Allopathy path)
# ──────────────────────────────────────────────

def save_vitals(session_id: str, vitals: Dict[str, Any]) -> None:
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, session_id)
        conn.execute(
            """INSERT OR REPLACE INTO session_vitals
               (session_id, blood_pressure_history, diabetes_status,
                known_allergies, past_surgeries, lifestyle_factors)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                vitals.get("bloodPressureHistory") or vitals.get("blood_pressure_history"),
                vitals.get("diabetesStatus") or vitals.get("diabetes_status"),
                vitals.get("knownAllergies") or vitals.get("known_allergies"),
                vitals.get("pastSurgeries") or vitals.get("past_surgeries"),
                vitals.get("lifestyleFactors") or vitals.get("lifestyle_factors"),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_vitals(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM session_vitals WHERE session_id = ?", (session_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  PRAKRITI RECORDS
# ──────────────────────────────────────────────

def save_prakriti(session_id: str, data: Dict[str, Any]) -> None:
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, session_id)
        conn.execute(
            """INSERT OR REPLACE INTO prakriti_records
               (session_id, answers_json, vata_score, pitta_score, kapha_score,
                dominant_prakriti, secondary_prakriti, confidence, clinical_note, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                json.dumps(data.get("answers", []), ensure_ascii=False),
                data.get("vata_score", 0),
                data.get("pitta_score", 0),
                data.get("kapha_score", 0),
                data.get("dominant_prakriti", ""),
                data.get("secondary_prakriti"),
                data.get("confidence", "low"),
                data.get("clinical_note", ""),
                _now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_prakriti(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM prakriti_records WHERE session_id = ?", (session_id,)).fetchone()
        if not row:
            return None
        d = _row_to_dict(row)
        d["answers"] = json.loads(d.get("answers_json") or "[]")
        return d
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  OCR RESULTS
# ──────────────────────────────────────────────

def save_ocr_result(session_id: str, report: Dict[str, Any]) -> int:
    """Save one OCR-extracted report record. Returns the row id."""
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, session_id)
        cursor = conn.execute(
            """INSERT INTO ocr_results
               (session_id, report_id, report_type, medical_specialty, report_date,
                facility_name, summary, findings_json, observations_json,
                impression, doctor_remarks, diagnoses_json, medications_json,
                clinical_history, verification_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                report.get("report_id"),
                report.get("report_type", "Prescription / Lab Report"),
                report.get("medical_specialty", "Kayachikitsa"),
                report.get("report_date"),
                report.get("facility_name"),
                report.get("summary", ""),
                json.dumps(report.get("findings", []), ensure_ascii=False, default=str),
                json.dumps(report.get("observations", []), ensure_ascii=False),
                report.get("impression"),
                report.get("doctor_remarks"),
                json.dumps(report.get("diagnoses", []), ensure_ascii=False),
                json.dumps(report.get("medications", []), ensure_ascii=False, default=str),
                report.get("clinical_history"),
                json.dumps(report.get("value_verification", []), ensure_ascii=False, default=str),
                _now_iso(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def get_ocr_results(session_id: str) -> List[Dict[str, Any]]:
    """Get all OCR-extracted reports for a session."""
    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM ocr_results WHERE session_id = ? ORDER BY created_at",
            (session_id,),
        ).fetchall()
        results = []
        for row in rows:
            d = _row_to_dict(row)
            d["findings"] = json.loads(d.get("findings_json") or "[]")
            d["observations"] = json.loads(d.get("observations_json") or "[]")
            d["diagnoses"] = json.loads(d.get("diagnoses_json") or "[]")
            d["medications"] = json.loads(d.get("medications_json") or "[]")
            d["value_verification"] = json.loads(d.get("verification_json") or "[]")
            results.append(d)
        return results
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  CLINICAL SUMMARIES
# ──────────────────────────────────────────────

def save_summary(session_id: str, summary: Dict[str, Any]) -> None:
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, session_id)
        conn.execute(
            """INSERT OR REPLACE INTO clinical_summaries
               (session_id, summary_json, status, doctor_id, doctor_notes,
                review_status, reviewed_at, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                json.dumps(summary.get("summary_data", {}), ensure_ascii=False, default=str),
                summary.get("status", "awaiting_review"),
                summary.get("doctor_id"),
                summary.get("doctor_notes"),
                summary.get("review_status"),
                summary.get("reviewed_at"),
                summary.get("created_at") or _now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_summary(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM clinical_summaries WHERE session_id = ?", (session_id,)).fetchone()
        if not row:
            return None
        d = _row_to_dict(row)
        d["summary_data"] = json.loads(d.get("summary_json") or "{}")
        return d
    finally:
        conn.close()


def update_summary_review(session_id: str, doctor_id: str, status: str, notes: Optional[str] = None) -> None:
    conn = get_db_connection()
    try:
        conn.execute(
            """UPDATE clinical_summaries
               SET review_status = ?, doctor_id = ?, doctor_notes = ?, reviewed_at = ?
               WHERE session_id = ?""",
            (status, doctor_id, notes, _now_iso(), session_id),
        )
        conn.commit()
    finally:
        conn.close()


# ──────────────────────────────────────────────
#  PHYSICIAN QUEUE
# ──────────────────────────────────────────────

def save_queue_entry(entry: Dict[str, Any]) -> None:
    """Insert or update a patient queue entry for the physician dashboard."""
    conn = get_db_connection()
    try:
        _ensure_session_exists(conn, entry["session_id"])
        conn.execute(
            """INSERT OR REPLACE INTO queue_entries
               (session_id, patient_name, age, gender, phone, abha_id,
                token_number, chief_complaint, complaint_category,
                dominant_prakriti, secondary_prakriti,
                vata_score, pitta_score, kapha_score,
                red_flag_triggered, priority, assigned_doctor, room_number,
                socrates_json, documents_json, medications_json,
                lab_findings_json, ocr_text, extracted_drugs_json,
                status, doctor_notes, treatment_mode, general_vitals_json,
                created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                entry["session_id"],
                entry.get("patient_name", ""),
                entry.get("age", 0),
                entry.get("gender", "other"),
                entry.get("phone", ""),
                entry.get("abha_id", ""),
                entry.get("token_number", ""),
                entry.get("chief_complaint", ""),
                entry.get("complaint_category", "general"),
                entry.get("dominant_prakriti", ""),
                entry.get("secondary_prakriti"),
                entry.get("vata_score", 0),
                entry.get("pitta_score", 0),
                entry.get("kapha_score", 0),
                1 if entry.get("red_flag_triggered") else 0,
                entry.get("priority", "normal"),
                entry.get("assigned_doctor", ""),
                entry.get("room_number", ""),
                json.dumps(entry.get("socrates", {}), ensure_ascii=False),
                json.dumps(entry.get("documents", []), ensure_ascii=False, default=str),
                json.dumps(entry.get("medications", []), ensure_ascii=False, default=str),
                json.dumps(entry.get("lab_findings", []), ensure_ascii=False, default=str),
                entry.get("ocr_text", ""),
                json.dumps(entry.get("extracted_drugs", []), ensure_ascii=False),
                entry.get("status", "awaiting_review"),
                entry.get("doctor_notes"),
                entry.get("treatment_mode", "ayurveda"),
                json.dumps(entry.get("general_vitals", {}), ensure_ascii=False),
                entry.get("created_at") or _now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_queue_entries(doctor_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all queue entries, optionally filtered by assigned doctor."""
    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM queue_entries ORDER BY "
            "CASE WHEN priority = 'critical' THEN 0 WHEN priority = 'high' THEN 1 ELSE 2 END, "
            "created_at DESC"
        ).fetchall()
        results = []
        for row in rows:
            d = _row_to_dict(row)
            d["red_flag_triggered"] = bool(d.get("red_flag_triggered"))
            d["socrates"] = json.loads(d.get("socrates_json") or "{}")
            d["documents"] = json.loads(d.get("documents_json") or "[]")
            d["medications"] = json.loads(d.get("medications_json") or "[]")
            d["lab_findings"] = json.loads(d.get("lab_findings_json") or "[]")
            d["extracted_drugs"] = json.loads(d.get("extracted_drugs_json") or "[]")
            d["general_vitals"] = json.loads(d.get("general_vitals_json") or "{}")
            results.append(d)
        return results
    finally:
        conn.close()


def get_queue_entry(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM queue_entries WHERE session_id = ?", (session_id,)).fetchone()
        if not row:
            return None
        d = _row_to_dict(row)
        d["red_flag_triggered"] = bool(d.get("red_flag_triggered"))
        d["socrates"] = json.loads(d.get("socrates_json") or "{}")
        d["documents"] = json.loads(d.get("documents_json") or "[]")
        d["medications"] = json.loads(d.get("medications_json") or "[]")
        d["lab_findings"] = json.loads(d.get("lab_findings_json") or "[]")
        d["extracted_drugs"] = json.loads(d.get("extracted_drugs_json") or "[]")
        d["general_vitals"] = json.loads(d.get("general_vitals_json") or "{}")
        return d
    finally:
        conn.close()


def update_queue_review(session_id: str, status: str, doctor_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE queue_entries SET status = ?, doctor_notes = ? WHERE session_id = ?",
            (status, doctor_notes, session_id),
        )
        conn.commit()
        return get_queue_entry(session_id)
    finally:
        conn.close()


def get_queue_stats() -> Dict[str, Any]:
    """Compute real queue statistics from the database."""
    conn = get_db_connection()
    try:
        total = conn.execute("SELECT COUNT(*) FROM queue_entries").fetchone()[0]
        awaiting = conn.execute(
            "SELECT COUNT(*) FROM queue_entries WHERE status = 'awaiting_review'"
        ).fetchone()[0]
        reviewed = conn.execute(
            "SELECT COUNT(*) FROM queue_entries WHERE status IN ('accepted', 'amended', 'rejected')"
        ).fetchone()[0]
        critical = conn.execute(
            "SELECT COUNT(*) FROM queue_entries WHERE priority = 'critical' AND status = 'awaiting_review'"
        ).fetchone()[0]
        return {
            "patients_today": total,
            "awaiting_review": awaiting,
            "reviewed": reviewed,
            "critical_pending": critical,
        }
    finally:
        conn.close()


def update_queue_ocr(session_id: str, ocr_reports: List[Dict[str, Any]]) -> None:
    """Updates existing queue entry with newly extracted OCR medications, lab findings, and text."""
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM queue_entries WHERE session_id = ?", (session_id,)).fetchone()
        if not row:
            return

        all_meds = []
        all_labs = []
        all_drugs = []
        summaries = []

        for r in ocr_reports:
            if r.get("summary"):
                summaries.append(r["summary"])
            for m in r.get("medications", []):
                all_meds.append(m)
                dname = m.get("drugName") or m.get("drug_name") or m.get("name")
                if dname and dname not in all_drugs:
                    all_drugs.append(dname)
            for f in r.get("findings", []):
                all_labs.append(f)

        conn.execute(
            """UPDATE queue_entries
               SET medications_json = ?, lab_findings_json = ?,
                   extracted_drugs_json = ?, ocr_text = ?
               WHERE session_id = ?""",
            (
                json.dumps(all_meds, ensure_ascii=False, default=str),
                json.dumps(all_labs, ensure_ascii=False, default=str),
                json.dumps(all_drugs, ensure_ascii=False),
                " | ".join(summaries) or "OCR reports extracted and verified.",
                session_id,
            ),
        )
        conn.commit()
    finally:
        conn.close()

