"""
Whispr Flow Voice Transcription Service.
Processes base64-encoded 16kHz mono WAV microphone input for rapid clinical intake.
Compliant with DPDP Act 2023 ephemeral data lifecycle guidelines.
"""

import logging
import os
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("whisprflow_service")

WISPRFLOW_API_URL = os.getenv(
    "WISPRFLOW_API_URL",
    "https://platform-api.wisprflow.ai/api/v1/dash/api"
)
WISPRFLOW_API_KEY = os.getenv("WISPRFLOW_API_KEY", "")


class WhisprFlowService:
    def __init__(self):
        self.api_url = WISPRFLOW_API_URL

    def is_configured(self) -> bool:
        """Checks if WISPRFLOW_API_KEY is configured in environment."""
        key = os.getenv("WISPRFLOW_API_KEY", "").strip()
        return bool(key and key != "your_wisprflow_api_key_here")

    async def transcribe_audio_base64(
        self,
        audio_base64: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes base64-encoded 16kHz WAV audio using Wispr Flow REST API.
        Enforces 15MB payload safety limit.
        """
        if not audio_base64 or not audio_base64.strip():
            return {
                "success": False,
                "text": "",
                "error": "Empty audio payload received.",
                "source": "whisprflow",
            }

        # Size check: 15MB base64 string safety boundary
        if len(audio_base64) > 15 * 1024 * 1024:
            return {
                "success": False,
                "text": "",
                "error": "Audio payload exceeds maximum 15MB safety limit.",
                "source": "whisprflow",
            }

        if not self.is_configured():
            logger.info("WISPRFLOW_API_KEY is not configured. Returning fallback notice.")
            return {
                "success": False,
                "text": "",
                "error": "WISPRFLOW_API_KEY is not configured on server. Falling back to browser speech recognition.",
                "source": "whisprflow",
            }

        api_key = os.getenv("WISPRFLOW_API_KEY", "").strip()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "audio": audio_base64,
            "properties": properties or {},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
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
                    logger.info("Wispr Flow transcription successful: %s", transcription[:60])
                    return {
                        "success": True,
                        "text": transcription.strip(),
                        "error": None,
                        "raw_response": data,
                        "source": "whisprflow",
                    }
                else:
                    logger.error(
                        "Wispr Flow API returned error status %d: %s",
                        response.status_code,
                        response.text,
                    )
                    return {
                        "success": False,
                        "text": "",
                        "error": f"Wispr Flow returned HTTP {response.status_code}: {response.text[:200]}",
                        "source": "whisprflow",
                    }

        except httpx.RequestError as exc:
            logger.exception("Wispr Flow network connection error: %s", exc)
            return {
                "success": False,
                "text": "",
                "error": f"Wispr Flow network request error: {str(exc)}",
                "source": "whisprflow",
            }
        except Exception as exc:
            logger.exception("Unexpected error during Wispr Flow transcription: %s", exc)
            return {
                "success": False,
                "text": "",
                "error": f"Internal transcription error: {str(exc)}",
                "source": "whisprflow",
            }


whisprflow_service = WhisprFlowService()
