r"""
Convenience CLI script to process local medical report images directly 
without needing to open a browser or web UI.

Usage:
1. Drop your report images into the `sample_reports` folder (or specify any folder).
2. Run:
   .venv\Scripts\python.exe process_local.py
"""

import asyncio
import io
import sys
from pathlib import Path
from fastapi import UploadFile

from backend.services.report_service import report_service


async def process_folder(folder_path: str = "sample_reports"):
    folder = Path(folder_path)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
        print(f"Created folder: '{folder.resolve()}'")
        print("Please drop your report images (.jpg, .png, etc.) inside that folder and run this script again.")
        return

    # Find image files
    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
    image_files = [f for f in folder.iterdir() if f.suffix.lower() in image_extensions]

    if not image_files:
        print(f"No image files found in '{folder.resolve()}'.")
        print("Please paste some .jpg or .png medical report images into that folder and rerun.")
        return

    print(f"Found {len(image_files)} image(s) to process:")
    for img in image_files:
        print(f"  - {img.name}")

    # Wrap files as FastAPI UploadFiles
    upload_files = []
    for img_path in image_files:
        data = img_path.read_bytes()
        upload = UploadFile(
            filename=img_path.name,
            file=io.BytesIO(data),
        )
        upload_files.append(upload)

    print("\nProcessing with Gemini multimodal analysis and Tesseract OCR verification...")
    try:
        response = await report_service.process_all_reports(files=upload_files)
        print("\nSUCCESS!")
        print(f"Patient Session ID: {response.patient_session_id}")
        print(f"Reports Processed:  {response.reports_processed}")
        print(f"Session Result File: {response.result_file}")
        print("\nYou can find your generated JSON files in:")
        print("  - Individual reports: storage/results/reports/")
        print("  - Overall summary:    storage/results/")
    except Exception as exc:
        print(f"\nProcessing failed: {exc}")
        print("Please ensure your GEMINI_API_KEY is configured in the .env file.")


if __name__ == "__main__":
    folder_arg = sys.argv[1] if len(sys.argv) > 1 else "sample_reports"
    asyncio.run(process_folder(folder_arg))
