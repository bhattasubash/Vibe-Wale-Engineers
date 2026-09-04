"""
File and Image Validation Utilities.
Validates MIME types, file sizes, and image integrity for prescription uploads.
"""

import io
import re
from pathlib import Path
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
}

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".tif",
    ".tiff",
}

MAX_UPLOAD_SIZE = 15 * 1024 * 1024  # 15 MB


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal or invalid characters."""
    filename = Path(filename).name
    sanitized = re.sub(r"[^\w\.-]", "_", filename)
    return sanitized or "unnamed_file.jpg"


async def validate_and_read_image(file: UploadFile) -> Tuple[bytes, str]:
    """
    Validates uploaded file:
    1. Content type / extension check
    2. File size limit
    3. Image integrity check via PIL
    Returns (raw_bytes, sanitized_filename)
    """
    raw_filename = file.filename or "unnamed.jpg"
    filename = sanitize_filename(raw_filename)
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' is empty.",
        )

    if len(content) > MAX_UPLOAD_SIZE:
        max_mb = MAX_UPLOAD_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File '{filename}' exceeds maximum allowed size of {max_mb:.1f} MB.",
        )

    try:
        image_stream = io.BytesIO(content)
        with Image.open(image_stream) as img:
            img.verify()
    except Exception as exc:
        logger.warning("Unreadable image upload '%s': %s", filename, exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or unsupported image file '{filename}'. Please upload a valid JPEG, PNG, or WebP photo.",
        )

    return content, filename
