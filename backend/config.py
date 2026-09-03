import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    TESSERACT_CONFIDENCE_THRESHOLD: float = 80.0
    TESSERACT_CMD: str = ""
    RAPIDFUZZ_SIMILARITY_THRESHOLD: float = 80.0
    MAX_UPLOAD_SIZE: int = 15 * 1024 * 1024  # 15 MB
    STORAGE_DIR: str = "storage"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def uploads_dir(self) -> Path:
        p = Path(self.STORAGE_DIR) / "uploads"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def reports_dir(self) -> Path:
        p = Path(self.STORAGE_DIR) / "results" / "reports"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def results_dir(self) -> Path:
        p = Path(self.STORAGE_DIR) / "results"
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
