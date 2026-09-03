import io
import re
from pathlib import Path
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image

from backend.config import settings

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


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal or invalid characters."""
    filename = Path(filename).name
    # Keep alphanumeric, dot, underscore, dash
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
            detail=f"Unsupported file extension '{ext}' for file '{filename}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{content_type}' for file '{filename}'. Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
        )

    # Read bytes
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' is empty."
        )

    if len(content) > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File '{filename}' exceeds maximum allowed size of {max_mb:.1f} MB."
        )

    # Verify image integrity
    try:
        image_stream = io.BytesIO(content)
        with Image.open(image_stream) as img:
            img.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or unreadable image file '{filename}': {str(exc)}"
        )

    return content, filename
