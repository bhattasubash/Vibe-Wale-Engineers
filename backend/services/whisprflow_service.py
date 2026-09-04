import logging
import httpx
from typing import Optional, Dict, Any

from backend.config import settings

logger = logging.getLogger("whisprflow_service")


class WhisprFlowService:
    def __init__(self):
        self.api_url = settings.WISPRFLOW_API_URL

    def is_configured(self) -> bool:
        """Checks if WISPRFLOW_API_KEY is configured in settings."""
        key = (settings.WISPRFLOW_API_KEY or "").strip()
        return bool(key and key != "your_wisprflow_api_key_here")

    async def transcribe_audio_base64(
        self,
        audio_base64: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes base64-encoded 16kHz WAV audio using Wispr Flow REST API.
        
        Endpoint: https://platform-api.wisprflow.ai/api/v1/dash/api
        Requires header: Authorization: Bearer <WISPRFLOW_API_KEY>
        Body: { "audio": "<base64_audio>", "properties": { ... } }
        """
        if not self.is_configured():
            logger.warning("WISPRFLOW_API_KEY is not configured in .env")
            return {
                "success": False,
                "text": "",
                "error": "WISPRFLOW_API_KEY is not configured. Please provide a key in .env or use fallback.",
                "source": "whisprflow",
            }

        headers = {
            "Authorization": f"Bearer {settings.WISPRFLOW_API_KEY.strip()}",
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
                    # Wispr Flow returns transcribed text in 'text', 'transcription', or 'result'
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
