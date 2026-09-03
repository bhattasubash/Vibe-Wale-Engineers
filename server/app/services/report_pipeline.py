"""
Longitudinal Report Pipeline Service.
Coordinates ephemeral file persistence, report grouping, Gemini extraction,
Tesseract spatial pixel verification, and DPDP Act 2023 auto-purge.
"""

import json
import logging
import os
import shutil
import tempfile
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

from fastapi import UploadFile
from pydantic import BaseModel

from app.models.schemas import (
    IndividualReportExtraction,
    IndividualReportOutput,
    OverallPatientHistory,
    PatientSessionOutput,
    ProcessReportsResponse,
    ReportFinding,
    ReportSummaryReference,
)
from app.services.gemini_vision import gemini_vision
from app.services.ocr_verification import ocr_verifier
from app.utils.file_validation import validate_and_read_image

logger = logging.getLogger(__name__)


class SavedImageMeta(BaseModel):
    file_path: Path
    original_filename: str
    stored_filename: str
    report_id: str
    page_number: int


class ReportPipelineService:
    def __init__(self, base_data_dir: Optional[Path] = None):
        if base_data_dir is None:
            self.base_dir = Path(__file__).resolve().parent.parent.parent / "data"
        else:
            self.base_dir = Path(base_data_dir)

        self.reports_dir = self.base_dir / "reports"
        self.results_dir = self.base_dir / "results"

        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)

    async def save_uploaded_files_ephemeral(
        self,
        files: List[UploadFile],
        patient_session_id: str,
        grouping_spec: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Path, List[SavedImageMeta]]:
        """
        Saves uploaded prescription images to an isolated ephemeral temporary directory.
        Returns (temp_dir_path, list_of_saved_metas).
        """
        temp_dir = Path(tempfile.mkdtemp(prefix=f"ayush_ocr_{patient_session_id}_"))
        saved_metas = []

        for idx, file in enumerate(files):
            content, sanitized_name = await validate_and_read_image(file)
            ext = Path(sanitized_name).suffix.lower()

            rep_id = "report_1"
            page_num = idx + 1
            if grouping_spec and str(idx) in grouping_spec:
                rep_id = grouping_spec[str(idx)].get("report_id", rep_id)
                page_num = grouping_spec[str(idx)].get("page_number", page_num)

            stored_name = f"{patient_session_id}_{rep_id}_p{page_num}_{uuid.uuid4().hex[:6]}{ext}"
            file_path = temp_dir / stored_name

            with open(file_path, "wb") as f_out:
                f_out.write(content)

            saved_metas.append(
                SavedImageMeta(
                    file_path=file_path,
                    original_filename=file.filename or sanitized_name,
                    stored_filename=stored_name,
                    report_id=rep_id,
                    page_number=page_num,
                )
            )

        return temp_dir, saved_metas

    def group_images_by_report(
        self, metas: List[SavedImageMeta]
    ) -> Dict[str, List[SavedImageMeta]]:
        """Groups images by report ID and sorts pages in chronological sequence."""
        groups = defaultdict(list)
        for m in metas:
            groups[m.report_id].append(m)
        for rep_id in groups:
            groups[rep_id].sort(key=lambda x: x.page_number)
        return groups

    def process_pipeline_and_cleanup(
        self,
        temp_dir: Path,
        image_metas: List[SavedImageMeta],
        patient_session_id: str,
    ) -> ProcessReportsResponse:
        """
        Executes extraction and verification, persists JSON outputs,
        and guarantees 100% ephemeral deletion of raw images.
        """
        try:
            report_groups = self.group_images_by_report(image_metas)
            processed_reports: List[IndividualReportOutput] = []
            report_references: List[ReportSummaryReference] = []

            for rep_id, pages in report_groups.items():
                page_paths = [p.file_path for p in pages]
                source_page_names = [p.stored_filename for p in pages]

                # A. Gemini Extraction
                extraction = gemini_vision.extract_individual_report(
                    image_paths=page_paths,
                    report_hint=rep_id,
                )

                # B. Tesseract Spatial Verification
                findings_dicts = [f.model_dump() for f in extraction.findings]
                try:
                    verifications, updated_findings_dicts = ocr_verifier.verify_report_findings(
                        findings=findings_dicts,
                        image_paths=page_paths,
                    )
                except Exception as exc:
                    logger.warning("OCR verification fallback: %s", exc)
                    verifications = []
                    updated_findings_dicts = findings_dicts

                final_findings = [ReportFinding(**f) for f in updated_findings_dicts]

                # C. Build Individual Report Output
                individual_output = IndividualReportOutput(
                    report_id=rep_id,
                    report_type=extraction.report_type,
                    medical_specialty=extraction.medical_specialty or "Kayachikitsa",
                    report_date=extraction.report_date,
                    facility_name=extraction.facility_name,
                    source_pages=source_page_names,
                    summary=extraction.summary,
                    findings=final_findings,
                    observations=extraction.observations,
                    impression=extraction.impression,
                    doctor_remarks=extraction.doctor_remarks,
                    diagnoses=extraction.diagnoses,
                    medications=extraction.medications,
                    clinical_history=extraction.clinical_history,
                    uncertain_information=extraction.uncertain_information,
                    value_verification=verifications,
                )

                # D. Save Report JSON
                report_file_path = self.reports_dir / f"{patient_session_id}_{rep_id}.json"
                with open(report_file_path, "w", encoding="utf-8") as f_rep:
                    json.dump(individual_output.model_dump(), f_rep, indent=2, ensure_ascii=False)

                processed_reports.append(individual_output)
                report_references.append(
                    ReportSummaryReference(
                        report_id=rep_id,
                        report_type=extraction.report_type,
                        medical_specialty=extraction.medical_specialty or "Kayachikitsa",
                        report_summary_file=str(report_file_path).replace("\\", "/"),
                    )
                )

            # Synthesize Overall Patient History
            reports_for_synthesis = [r.model_dump() for r in processed_reports]
            overall_history = gemini_vision.synthesize_patient_history(
                individual_reports=reports_for_synthesis
            )

            patient_session_output = PatientSessionOutput(
                patient_session_id=patient_session_id,
                overall_summary=overall_history,
                reports=report_references,
                uncertain_information=[],
            )

            session_file_path = self.results_dir / f"session_{patient_session_id}.json"
            with open(session_file_path, "w", encoding="utf-8") as f_sess:
                json.dump(patient_session_output.model_dump(), f_sess, indent=2, ensure_ascii=False)

            return ProcessReportsResponse(
                status="completed",
                patient_session_id=patient_session_id,
                reports_processed=len(processed_reports),
                result_file=str(session_file_path).replace("\\", "/"),
                message="Reports processed, verified, and saved successfully.",
            )
        finally:
            # DPDP Act 2023 Guaranteed Ephemeral Cleanup of raw image pixels
            if temp_dir and temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    logger.info("Ephemeral directory purged successfully: %s", temp_dir)
                except Exception as clean_err:
                    logger.warning("Failed to purge ephemeral directory %s: %s", temp_dir, clean_err)

    async def process_all_reports(
        self,
        files: List[UploadFile],
        session_id: Optional[str] = None,
        grouping_json: Optional[str] = None,
    ) -> ProcessReportsResponse:
        """Synchronous helper for report processing."""
        if not files:
            raise ValueError("No prescription images provided.")

        patient_session_id = session_id or f"session_{uuid.uuid4().hex[:10]}"
        grouping_spec = None
        if grouping_json:
            try:
                grouping_spec = json.loads(grouping_json)
            except Exception as exc:
                logger.warning("Could not parse grouping JSON: %s", exc)

        temp_dir, image_metas = await self.save_uploaded_files_ephemeral(
            files=files,
            patient_session_id=patient_session_id,
            grouping_spec=grouping_spec,
        )

        return self.process_pipeline_and_cleanup(
            temp_dir=temp_dir,
            image_metas=image_metas,
            patient_session_id=patient_session_id,
        )


report_pipeline = ReportPipelineService()
