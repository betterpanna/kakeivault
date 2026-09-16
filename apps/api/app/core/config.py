"""
Application configuration loaded from environment variables.

All secrets are expected from env vars; never hardcoded.
Refer to .env.example at the repo root for all required variables.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # App
    # ------------------------------------------------------------------
    app_name: str = "KakeiVault API"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    database_url: str  # postgresql+psycopg://user:pass@host:5432/db

    # ------------------------------------------------------------------
    # Redis / ARQ
    # ------------------------------------------------------------------
    redis_url: str = "redis://localhost:6379/0"

    # ------------------------------------------------------------------
    # JWT Authentication
    # ------------------------------------------------------------------
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 30

    # ------------------------------------------------------------------
    # Cookies (web)
    # ------------------------------------------------------------------
    cookie_domain: str | None = None
    cookie_secure: bool = True  # False in local dev
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    cors_origins: list[AnyHttpUrl] = []

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # S3-compatible storage
    # ------------------------------------------------------------------
    storage_endpoint_url: str  # e.g. http://minio:9000 for local
    storage_access_key_id: str
    storage_secret_access_key: str
    storage_bucket_name: str = "kakeivault"
    storage_region: str = "ap-northeast-1"
    storage_presign_expiry_seconds: int = 900  # 15 min

    # ------------------------------------------------------------------
    # Email
    # ------------------------------------------------------------------
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@kakeivault.app"
    smtp_from_name: str = "KakeiVault"
    smtp_tls: bool = True

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------
    rate_limit_auth_per_hour: int = 10
    rate_limit_upload_per_hour: int = 30
    rate_limit_ocr_per_hour: int = 20

    # ------------------------------------------------------------------
    # OCR
    # ------------------------------------------------------------------
    # Set to "google_vision" or "azure" once a provider is configured.
    # Leave empty to use the stub provider in development.
    ocr_provider: str = "stub"
    google_vision_credentials_json: str = ""  # path or JSON content
    ocr_temp_retention_seconds: int = 3600

    # ------------------------------------------------------------------
    # Frontend URLs (for email links)
    # ------------------------------------------------------------------
    web_base_url: AnyHttpUrl = AnyHttpUrl("http://localhost:3000")


@lru_cache
def get_settings() -> Settings:
    return Settings()
