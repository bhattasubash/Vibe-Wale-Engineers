"""
Text-to-Speech (TTS) Gateway Router.
Provides high-fidelity spoken audio in Hindi and English for the AYUSH-Care MediKiosk.
Uses gTTS with in-memory binary caching for sub-millisecond repeated phrase responses.
Complies with GIGW & DPDP Act 2023 security guidelines.
"""

import hashlib
import io
import logging
from typing import Dict
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel, Field
from gtts import gTTS

logger = logging.getLogger("tts_router")

router = APIRouter(prefix="/api/tts", tags=["Text to Speech"])

# In-memory LRU-style cache for audio MP3 bytes: MD5(lang + text) -> bytes
_TTS_CACHE: Dict[str, bytes] = {}
_MAX_CACHE_ENTRIES = 500


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="Text to synthesize")
    lang: str = Field("hi", description="Language code ('hi' or 'en')")


def _get_cache_key(lang: str, text: str) -> str:
    combined = f"{lang.lower().strip()}:{text.strip()}"
    return hashlib.md5(combined.encode("utf-8")).hexdigest()


def _generate_mp3_bytes(text: str, lang: str) -> bytes:
    clean_text = text.strip()
    clean_lang = "hi" if lang.startswith("hi") else "en"

    cache_key = _get_cache_key(clean_lang, clean_text)
    if cache_key in _TTS_CACHE:
        return _TTS_CACHE[cache_key]

    buf = io.BytesIO()
    tts = gTTS(text=clean_text, lang=clean_lang, slow=False)
    tts.write_to_fp(buf)
    audio_bytes = buf.getvalue()

    # Cache evict oldest if capacity exceeded
    if len(_TTS_CACHE) >= _MAX_CACHE_ENTRIES:
        keys_to_remove = list(_TTS_CACHE.keys())[:100]
        for k in keys_to_remove:
            _TTS_CACHE.pop(k, None)

    _TTS_CACHE[cache_key] = audio_bytes
    return audio_bytes


@router.get("", status_code=status.HTTP_200_OK)
async def stream_tts_audio_get(
    text: str = Query(..., min_length=1, max_length=1000, description="Text to speak aloud"),
    lang: str = Query("hi", description="Language code ('hi' or 'en')"),
):
    """
    Synthesizes and streams MP3 audio for kiosk prompter and questions.
    Returns audio/mpeg stream directly playable by browser HTML5 Audio.
    """
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text parameter cannot be empty."
        )

    try:
        audio_bytes = _generate_mp3_bytes(text=text, lang=lang)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=86400",
                "Accept-Ranges": "bytes",
            }
        )
    except Exception as exc:
        logger.exception("Error synthesizing audio with gTTS: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis error: {str(exc)}"
        )


@router.post("", status_code=status.HTTP_200_OK)
async def stream_tts_audio_post(payload: TTSRequest):
    """
    POST variant for long or complex prompt text synthesis.
    """
    return await stream_tts_audio_get(text=payload.text, lang=payload.lang)
