"""
Audio Transcription Service for AYUSH-Care MediKiosk.
Dual-Engine architecture:
1. Gemini Multimodal Audio Transcription (High accuracy on Hindi, English, and Hinglish via official google-genai SDK).
2. Wispr Flow REST API (when WISPRFLOW_API_KEY is configured).
Compliant with DPDP Act 2023 ephemeral data lifecycle guidelines.
"""

import base64
import logging
import os
from typing import Any, Dict, Optional
import httpx

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

logger = logging.getLogger("whisprflow_service")

WISPRFLOW_API_URL = os.getenv(
    "WISPRFLOW_API_URL",
    "https://platform-api.wisprflow.ai/api/v1/dash/api"
)
WISPRFLOW_WS_URL = os.getenv(
    "WISPRFLOW_WS_URL",
    "wss://platform-api.wisprflow.ai/api/v1/dash/client_ws"
)
WISPRFLOW_API_KEY = os.getenv("WISPRFLOW_API_KEY", "")


class WhisprFlowService:
    def __init__(self):
        self.api_url = WISPRFLOW_API_URL
        self.ws_url = WISPRFLOW_WS_URL
        self._gemini_client = None

    def get_api_key(self) -> str:
        """Resolves API key or client key from environment, stripping duplicate Bearer prefixes."""
        key = os.getenv("WISPRFLOW_API_KEY", "").strip() or os.getenv("WISPRFLOW_CLIENT_KEY", "").strip()
        if key.startswith("Bearer "):
            key = key[7:].strip()
        return key

    def is_configured(self) -> bool:
        """Checks if WISPRFLOW_API_KEY or WISPRFLOW_CLIENT_KEY is configured in environment."""
        key = self.get_api_key()
        return bool(key and key != "your_wisprflow_api_key_here" and key != "<CLIENT_KEY>")

    def _get_gemini_client(self) -> Optional[Any]:
        if self._gemini_client is not None:
            return self._gemini_client

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or api_key == "your_gemini_api_key_here" or genai is None:
            return None

        try:
            self._gemini_client = genai.Client(api_key=api_key)
            return self._gemini_client
        except Exception as exc:
            logger.warning("Could not initialize Google GenAI Client for audio: %s", exc)
            return None

    def get_ws_url(self) -> str:
        """Returns the fully qualified streaming WebSocket endpoint with auth client_key."""
        key = self.get_api_key()
        if not key or not self.is_configured():
            return ""
        return f"{self.ws_url}?client_key=Bearer%20{key}"

    async def transcribe_with_gemini(
        self,
        audio_base64: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes patient audio using Google Gemini Multimodal Audio understanding.
        High accuracy for Hindi (Devanagari/Romanized), Indian English, and Hinglish.
        """
        client = self._get_gemini_client()
        if not client or types is None:
            return {
                "success": False,
                "text": "",
                "error": "Gemini client unavailable or GEMINI_API_KEY not configured.",
                "source": "gemini",
            }

        try:
            # Strip data URL header if present (e.g. data:audio/wav;base64,...)
            clean_b64 = audio_base64
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",", 1)[1]
            clean_b64 = clean_b64.strip()

            wav_bytes = base64.b64decode(clean_b64)
            if len(wav_bytes) < 100:
                return {
                    "success": False,
                    "text": "",
                    "error": "Audio data too short.",
                    "source": "gemini",
                }

            preferred_lang = (properties or {}).get("language", "hi")
            lang_prompt = "Hindi" if preferred_lang == "hi" else "English"

            prompt_text = (
                f"You are a medical speech-to-text transcriber for an Indian hospital kiosk (AYUSH-Care). "
                f"The patient is speaking in {lang_prompt} (or mixed Hindi/English/Hinglish). "
                "Transcribe the patient's spoken words verbatim. "
                "Output ONLY the transcribed words. "
                "Do NOT add introductory notes, quotes, or explanations. "
                "If the audio contains silence, pure tone, or unintelligible static, output nothing."
            )

            # Try primary fast model, then fallback models
            models_to_try = [
                os.getenv("LLM_MODEL", "gemini-2.5-flash"),
                "gemini-2.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.7-flash",
                "gemini-3.6-flash",
            ]

            last_error = None
            for model_name in models_to_try:
                try:
                    logger.info("Transcribing audio using Gemini model %s...", model_name)
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[
                            types.Part.from_bytes(data=wav_bytes, mime_type="audio/wav"),
                            prompt_text,
                        ],
                    )
                    transcription = (response.text or "").strip()
                    # Filter out silence indicator tokens
                    if transcription in ("[tone/silence]", "silence", "[silence]", "[noise]", "noise"):
                        transcription = ""

                    logger.info("Gemini transcription succeeded (%d chars): %s", len(transcription), transcription[:60])
                    return {
                        "success": True,
                        "text": transcription,
                        "error": None,
                        "source": "gemini",
                    }
                except Exception as model_err:
                    last_error = model_err
                    logger.warning("Model %s failed audio transcription: %s", model_name, model_err)
                    continue

            return {
                "success": False,
                "text": "",
                "error": f"Gemini audio transcription failed across all models: {str(last_error)}",
                "source": "gemini",
            }

        except Exception as exc:
            logger.exception("Error decoding or transcribing audio with Gemini: %s", exc)
            return {
                "success": False,
                "text": "",
                "error": f"Audio processing error: {str(exc)}",
                "source": "gemini",
            }

    async def transcribe_audio_base64(
        self,
        audio_base64: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes base64-encoded audio using Wispr Flow API if configured,
        or automatically routes to Google Gemini Multimodal Audio Transcription.
        """
        if not audio_base64 or not audio_base64.strip():
            return {
                "success": False,
                "text": "",
                "error": "Empty audio payload received.",
                "source": "transcribe_service",
            }

        # Size check: 15MB base64 string safety boundary
        if len(audio_base64) > 15 * 1024 * 1024:
            return {
                "success": False,
                "text": "",
                "error": "Audio payload exceeds maximum 15MB safety limit.",
                "source": "transcribe_service",
            }

        # If Wispr Flow is not configured, seamlessly use Gemini Multimodal Audio
        if not self.is_configured():
            logger.info("Wispr Flow is not configured. Transcribing with Gemini Multimodal Audio Engine...")
            return await self.transcribe_with_gemini(audio_base64, properties)

        # Attempt Wispr Flow first if configured
        api_key = self.get_api_key()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "audio": audio_base64,
            "properties": properties or {},
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                logger.info("Calling Wispr Flow API for voice transcription...")
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                )

                if response.status_code == 200:
                    data = response.json()
                    transcription = (
                        data.get("text")
                        or data.get("transcription")
                        or data.get("result")
                        or data.get("transcript")
                        or ""
                    )
                    return {
                        "success": True,
                        "text": transcription.strip(),
                        "error": None,
                        "raw_response": data,
                        "source": "whisprflow",
                    }
                else:
                    logger.warning(
                        "Wispr Flow returned HTTP %d. Falling back to Gemini Multimodal Audio...",
                        response.status_code
                    )
                    return await self.transcribe_with_gemini(audio_base64, properties)

        except Exception as exc:
            logger.warning("Wispr Flow error: %s. Falling back to Gemini Multimodal Audio...", exc)
            return await self.transcribe_with_gemini(audio_base64, properties)


whisprflow_service = WhisprFlowService()
