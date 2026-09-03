import json
import logging
import re
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import UploadFile

from backend.config import settings
from backend.models.schemas import (
    IndividualReportExtraction,
    IndividualReportOutput,
    OverallPatientHistory,
    PatientSessionOutput,
    ProcessReportsResponse,
    ReportFinding,
    ReportSummaryReference,
)
from backend.services.gemini_service import gemini_service
from backend.services.ocr_service import ocr_service
from backend.utils.file_validation import validate_and_read_image

logger = logging.getLogger("report_service")


class UploadedImageMetadata:
    def __init__(
        self,
        patient_session_id: str,
        report_id: str,
        page_number: int,
        original_filename: str,
        stored_filename: str,
        file_path: Path,
    ):
        self.patient_session_id = patient_session_id
        self.report_id = report_id
        self.page_number = page_number
        self.original_filename = original_filename
        self.stored_filename = stored_filename
        self.file_path = file_path

    def to_dict(self) -> dict:
        return {
            "patient_session_id": self.patient_session_id,
            "report_id": self.report_id,
            "page_number": self.page_number,
            "original_filename": self.original_filename,
            "stored_filename": self.stored_filename,
            "file_path": str(self.file_path),
        }


class ReportService:
    @property
    def uploads_dir(self) -> Path:
        return settings.uploads_dir

    @property
    def reports_dir(self) -> Path:
        return settings.reports_dir

    @property
    def results_dir(self) -> Path:
        return settings.results_dir

    def _parse_filename_grouping(self, filename: str, default_index: int) -> tuple[str, int]:
        """
        Parses filename patterns such as:
        - report_001_page_02.jpg -> ('report_001', 2)
        - blood_test_p1.png -> ('blood_test', 1)
        Default: ('report_{default_index:03d}', 1)
        """
        stem = Path(filename).stem

        # Pattern: (report_\w+?)_page_(\d+) or (\w+?)_page_(\d+)
        match = re.search(r"^(.*?)(?:_page_|_p)(\d+)$", stem, re.IGNORECASE)
        if match:
            group_name = match.group(1).strip("_")
            page_num = int(match.group(2))
            return group_name or f"report_{default_index:03d}", page_num

        return f"report_{default_index:03d}", 1

    async def save_uploaded_files_ephemeral(
        self,
        files: List[UploadFile],
        patient_session_id: str,
        grouping_spec: Optional[Dict[str, List[str]]] = None,
    ) -> tuple[Path, List[UploadedImageMetadata]]:
        """
        Validates and saves all uploaded files into an isolated ephemeral temporary directory.
        Returns the temp_dir Path and list of UploadedImageMetadata.
        """
        temp_dir = Path(tempfile.mkdtemp(prefix=f"kiosk_proc_{patient_session_id}_"))
        logger.info("Created ephemeral storage directory for session %s: %s", patient_session_id, temp_dir)

        metadata_list: List[UploadedImageMetadata] = []
        explicit_mapping: Dict[str, tuple[str, int]] = {}
        if grouping_spec:
            for rep_id, file_list in grouping_spec.items():
                for idx, fname in enumerate(file_list, start=1):
                    explicit_mapping[fname] = (rep_id, idx)

        for i, file in enumerate(files, start=1):
            raw_bytes, sanitized_name = await validate_and_read_image(file)

            if sanitized_name in explicit_mapping:
                report_id, page_number = explicit_mapping[sanitized_name]
            elif file.filename and file.filename in explicit_mapping:
                report_id, page_number = explicit_mapping[file.filename]
            else:
                report_id, page_number = self._parse_filename_grouping(sanitized_name, i)

            ext = Path(sanitized_name).suffix.lower()
            stored_filename = f"{patient_session_id}_{report_id}_page_{page_number:02d}_{uuid.uuid4().hex[:6]}{ext}"
            stored_path = temp_dir / stored_filename

            with open(stored_path, "wb") as f_out:
                f_out.write(raw_bytes)

            logger.info("Saved ephemeral image to %s", stored_path)

            meta = UploadedImageMetadata(
                patient_session_id=patient_session_id,
                report_id=report_id,
                page_number=page_number,
                original_filename=file.filename or sanitized_name,
                stored_filename=stored_filename,
                file_path=stored_path,
            )
            metadata_list.append(meta)

        return temp_dir, metadata_list

    async def save_uploaded_files(
        self,
        files: List[UploadFile],
        patient_session_id: str,
        grouping_spec: Optional[Dict[str, List[str]]] = None,
    ) -> List[UploadedImageMetadata]:
        """
        Validates and saves all uploaded files into storage/uploads/.
        Never overwrites existing files.
        Extracts metadata for report and page grouping.
        """
        metadata_list: List[UploadedImageMetadata] = []

        # If frontend explicitly passed grouping: filename -> (report_id, page_num)
        explicit_mapping: Dict[str, tuple[str, int]] = {}
        if grouping_spec:
            for rep_id, file_list in grouping_spec.items():
                for idx, fname in enumerate(file_list, start=1):
                    explicit_mapping[fname] = (rep_id, idx)

        for i, file in enumerate(files, start=1):
            raw_bytes, sanitized_name = await validate_and_read_image(file)

            # Determine report_id and page_number
            if sanitized_name in explicit_mapping:
                report_id, page_number = explicit_mapping[sanitized_name]
            elif file.filename and file.filename in explicit_mapping:
                report_id, page_number = explicit_mapping[file.filename]
            else:
                report_id, page_number = self._parse_filename_grouping(sanitized_name, i)

            # Construct safe stored filename that never overwrites previous uploads
            ext = Path(sanitized_name).suffix.lower()
            stored_filename = f"{patient_session_id}_{report_id}_page_{page_number:02d}_{uuid.uuid4().hex[:6]}{ext}"
            stored_path = self.uploads_dir / stored_filename

            # Save original image to disk
            with open(stored_path, "wb") as f_out:
                f_out.write(raw_bytes)

            logger.info("Saved original image to %s", stored_path)

            meta = UploadedImageMetadata(
                patient_session_id=patient_session_id,
                report_id=report_id,
                page_number=page_number,
                original_filename=file.filename or sanitized_name,
                stored_filename=stored_filename,
                file_path=stored_path,
            )
            metadata_list.append(meta)

        return metadata_list

    def group_images_by_report(
        self, metadata_list: List[UploadedImageMetadata]
    ) -> Dict[str, List[UploadedImageMetadata]]:
        """Groups image metadata by report_id and sorts by page_number."""
        groups: Dict[str, List[UploadedImageMetadata]] = {}
        for meta in metadata_list:
            if meta.report_id not in groups:
                groups[meta.report_id] = []
            groups[meta.report_id].append(meta)

        # Sort pages within each report
        for rep_id in groups:
            groups[rep_id].sort(key=lambda m: m.page_number)

        return groups

    def process_pipeline_and_cleanup(
        self,
        temp_dir: Optional[Path],
        image_metas: List[UploadedImageMetadata],
        patient_session_id: str,
    ) -> ProcessReportsResponse:
        """
        Executes report extraction, OCR verification, and synthesis.
        Guarantees deletion of the ephemeral temporary directory and all images in finally.
        """
        try:
            report_groups = self.group_images_by_report(image_metas)
            processed_reports: List[IndividualReportOutput] = []
            report_references: List[ReportSummaryReference] = []

            # 3. Process each report
            for rep_id, pages in report_groups.items():
                page_paths = [p.file_path for p in pages]
                source_page_names = [p.stored_filename for p in pages]

                logger.info("Processing report %s with %d pages", rep_id, len(page_paths))

                # A. Gemini Extraction
                try:
                    extraction: IndividualReportExtraction = gemini_service.extract_individual_report(
                        image_paths=page_paths,
                        report_hint=rep_id,
                    )
                except Exception as exc:
                    logger.error("Gemini analysis failed for report %s: %s", rep_id, exc)
                    # Fallback empty extraction with uncertainty note
                    extraction = IndividualReportExtraction(
                        report_type="Unspecified / Unclear",
                        summary="Automated extraction was incomplete due to processing error.",
                        uncertain_information=[f"Processing error: {str(exc)}"],
                    )

                # B. Tesseract Numerical Verification on ORIGINAL Images
                findings_dicts = [f.model_dump() for f in extraction.findings]
                try:
                    verifications, updated_findings_dicts = ocr_service.verify_report_findings(
                        findings=findings_dicts,
                        image_paths=page_paths,
                    )
                except Exception as exc:
                    logger.error("Tesseract verification encountered an error for report %s: %s", rep_id, exc)
                    verifications = []
                    updated_findings_dicts = findings_dicts

                # Update findings with verified final values
                final_findings = [ReportFinding(**f) for f in updated_findings_dicts]

                # C. Build Individual Report Output
                individual_output = IndividualReportOutput(
                    report_id=rep_id,
                    report_type=extraction.report_type,
                    medical_specialty=extraction.medical_specialty or "General Medicine",
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

                # D. Save Individual Report JSON
                report_file_name = f"{rep_id}.json"
                report_file_path = self.reports_dir / report_file_name
                with open(report_file_path, "w", encoding="utf-8") as f_rep:
                    json.dump(individual_output.model_dump(), f_rep, indent=2, ensure_ascii=False)

                logger.info("Saved individual report JSON to %s", report_file_path)
                processed_reports.append(individual_output)

                report_references.append(
                    ReportSummaryReference(
                        report_id=rep_id,
                        report_type=extraction.report_type,
                        medical_specialty=extraction.medical_specialty or "General Medicine",
                        report_summary_file=str(report_file_path).replace("\\", "/"),
                    )
                )

            # 4. Bundle reports by medical specialty/domain (e.g. Dental, Cardiology)
            reports_by_specialty: dict[str, List[ReportSummaryReference]] = {}
            for ref in report_references:
                spec = ref.medical_specialty or "General Medicine"
                if spec not in reports_by_specialty:
                    reports_by_specialty[spec] = []
                reports_by_specialty[spec].append(ref)

            # 5. Synthesize Overall Patient History across all reports
            logger.info("Synthesizing longitudinal patient history across %d report(s)", len(processed_reports))
            reports_for_synthesis = [r.model_dump() for r in processed_reports]

            try:
                overall_history: OverallPatientHistory = gemini_service.synthesize_patient_history(
                    individual_reports=reports_for_synthesis
                )
            except Exception as exc:
                logger.error("Gemini longitudinal history synthesis failed: %s", exc)
                overall_history = OverallPatientHistory(
                    past_medical_surgical_history="Not available in provided records.",
                    drug_allergy_history="Not available in provided records.",
                    family_history="Not available in provided records.",
                    personal_history="Not available in provided records.",
                    review_of_systems="Not available in provided records.",
                    prior_investigations_summary="Summaries generated for individual reports. See individual reports.",
                )

            # Aggregate uncertain information from all reports
            all_uncertainties = []
            for r in processed_reports:
                if r.uncertain_information:
                    all_uncertainties.extend(r.uncertain_information)

            patient_session_output = PatientSessionOutput(
                patient_session_id=patient_session_id,
                overall_summary=overall_history,
                reports=report_references,
                reports_by_specialty=reports_by_specialty,
                uncertain_information=all_uncertainties,
            )

            # 6. Save Overall Patient Session JSON
            session_file_name = f"patient_session_{patient_session_id}.json"
            session_file_path = self.results_dir / session_file_name
            with open(session_file_path, "w", encoding="utf-8") as f_sess:
                json.dump(patient_session_output.model_dump(), f_sess, indent=2, ensure_ascii=False)

            logger.info("Saved patient session JSON to %s", session_file_path)

            return ProcessReportsResponse(
                status="completed",
                patient_session_id=patient_session_id,
                reports_processed=len(processed_reports),
                result_file=str(session_file_path).replace("\\", "/"),
                message="Reports processed, verified, and saved successfully.",
            )
        finally:
            # Ephemeral Storage Auto-Purge: guaranteed cleanup of raw uploaded images
            if temp_dir and temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    logger.info("Ephemeral directory purged successfully: %s", temp_dir)
                except Exception as clean_err:
                    logger.warning("Failed to purge ephemeral directory %s: %s", temp_dir, clean_err)

    async def process_all_reports(
        self,
        files: List[UploadFile],
        grouping_json: Optional[str] = None,
        patient_session_id: Optional[str] = None,
    ) -> ProcessReportsResponse:
        """
        Executes the entire backend pipeline synchronously:
        1. Generates a patient session ID (if not provided)
        2. Saves images to ephemeral temp directory
        3. Groups images into reports
        4. Calls Gemini for extractions & Tesseract for verification
        5. Persists report JSONs and patient summary JSON to storage/results/
        6. Guarantees complete deletion of the temporary directory and raw images
        7. Returns ProcessReportsResponse
        """
        if not files:
            raise ValueError("No files provided for processing.")

        if not patient_session_id:
            patient_session_id = f"session_{uuid.uuid4().hex[:10]}"

        logger.info("Starting processing pipeline for patient session: %s", patient_session_id)

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


report_service = ReportService()
