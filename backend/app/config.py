from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized typed application settings loaded from environment or .env file."""

    app_name: str = "Masal AI Lead Assistant"
    app_version: str = "0.1.0"
    debug: bool = False

    # Gemini configuration (used in Phase 5+)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Database configuration (used in Phase 4+)
    database_url: str = "sqlite:///./leads.db"

    # CORS configuration for local React/Vite development
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_cors_origins(self) -> List[str]:
        """Return CORS origins as a trimmed list of strings."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance to avoid re-reading .env on every call."""
    return Settings()
