"""Application configuration loaded from environment variables."""
from __future__ import annotations

import json
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration — all values come from .env or environment."""

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://nextproduct:nextproduct@localhost:5432/nextproduct"
    DATABASE_URL_SYNC: str = "postgresql://nextproduct:nextproduct@localhost:5432/nextproduct"

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
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # ── Email ──
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@alapai.app"

    # ── S3 / Cloud Storage ──
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "nextproduct-uploads"
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
    APP_NAME: str = "NextProduct AI"
    APP_ENV: str = "development"
    CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000","http://192.168.0.103:3000","https://alapai.app"]'
    ADMIN_2FA_SECRET: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS JSON string into a list."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:3000", "http://127.0.0.1:3000"]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
