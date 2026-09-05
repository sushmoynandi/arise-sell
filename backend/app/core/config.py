"""Application configuration loaded from environment variables."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_PATHS = [
    _BACKEND_DIR / ".env",
    _BACKEND_DIR.parent / ".env",
    Path.cwd() / ".env",
    Path.cwd() / "backend" / ".env",
]


class Settings(BaseSettings):
    """Central configuration — all values come from .env or environment."""

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/arisesell"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/arisesell"

    # ── Redis ──
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ──
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Meta / Facebook ──
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_VERIFY_TOKEN: str = ""
    META_PAGE_ACCESS_TOKEN: str = ""

    # ── WhatsApp Cloud API ──
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_WABA_ID: str = ""

    # ── AI Providers ──
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: str = "800991434441-8tl7rr6qp1ko6frqe7c1ovr964jtt18g.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "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"

    # ── Email ──
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@alapai.app"

    # ── S3 / Cloud Storage ──
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "arisesell-uploads"
    AWS_REGION: str = "ap-southeast-1"

    # ── Courier APIs ──
    STEADFAST_API_KEY: str = ""
    STEADFAST_SECRET_KEY: str = ""
    PATHAO_CLIENT_ID: str = ""
    PATHAO_CLIENT_SECRET: str = ""

    # ── Payment Gateways ──
    BKASH_APP_KEY: str = ""
    BKASH_APP_SECRET: str = ""
    BKASH_USERNAME: str = ""
    BKASH_PASSWORD: str = ""
    COURIER_WEBHOOK_SECRET: str = ""
    SSLCOMMERZ_STORE_ID: str = ""
    SSLCOMMERZ_STORE_PASSWORD: str = ""

    # ── Application ──
    APP_NAME: str = "AriseSell"
    APP_ENV: str = "development"
    CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000","http://192.168.0.103:3000","https://alapai.app"]'
    ADMIN_2FA_SECRET: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS JSON string into a list."""
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        try:
            val = json.loads(self.CORS_ORIGINS)
            if isinstance(val, list):
                return val
            if isinstance(val, str):
                return [val]
        except (json.JSONDecodeError, TypeError):
            pass
        if "," in self.CORS_ORIGINS:
            return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
        return ["*"]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    model_config = SettingsConfigDict(
        env_file=_ENV_PATHS,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
