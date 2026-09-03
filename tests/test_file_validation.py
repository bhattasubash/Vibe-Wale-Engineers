import io
import pytest
from fastapi import HTTPException, UploadFile
from PIL import Image

from backend.utils.file_validation import sanitize_filename, validate_and_read_image


def create_test_image_bytes(format="JPEG", size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color="white")
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    return buffer.getvalue()


def test_sanitize_filename():
    assert sanitize_filename("../../../malicious.jpg") == "malicious.jpg"
    assert sanitize_filename("report#1 space!.png") == "report_1_space_.png"
    assert sanitize_filename("normal_file.jpg") == "normal_file.jpg"


@pytest.mark.asyncio
async def test_validate_and_read_valid_image():
    img_bytes = create_test_image_bytes(format="JPEG")
    upload = UploadFile(
        filename="test_report.jpg",
        file=io.BytesIO(img_bytes),
        headers={"content-type": "image/jpeg"},
    )
    content, filename = await validate_and_read_image(upload)
    assert content == img_bytes
    assert filename == "test_report.jpg"


@pytest.mark.asyncio
async def test_validate_unsupported_extension():
    upload = UploadFile(
        filename="notes.txt",
        file=io.BytesIO(b"some notes"),
        headers={"content-type": "text/plain"},
    )
    with pytest.raises(HTTPException) as exc_info:
        await validate_and_read_image(upload)
    assert exc_info.value.status_code == 400
    assert "Unsupported file extension" in exc_info.value.detail


@pytest.mark.asyncio
async def test_validate_corrupted_image():
    upload = UploadFile(
        filename="corrupt.png",
        file=io.BytesIO(b"\x89PNG\r\n\x1a\ncorrupted bytes"),
        headers={"content-type": "image/png"},
    )
    with pytest.raises(HTTPException) as exc_info:
        await validate_and_read_image(upload)
    assert exc_info.value.status_code == 400
    assert "Corrupted or unreadable" in exc_info.value.detail
