"""
JWT token creation and verification.
Password hashing with bcrypt.

Security decisions:
- Access tokens: short-lived (15 min), signed HS256 JWT
- Refresh tokens: long-lived (30 days), stored as HttpOnly cookie on web,
  SecureStore on mobile (handled by client)
- Passwords: hashed with bcrypt, work factor 12
- Tokens never logged
"""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


# ---------------------------------------------------------------------------
# Password
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def create_access_token(
    subject: str,
    *,
    extra_claims: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token. Subject is user UUID."""
    expire = datetime.now(UTC) + (
        expires_delta
        or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """Create a signed JWT refresh token with longer expiry."""
    expire = datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "type": "refresh",
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """
    Decode and validate a JWT. Raises JWTError on failure.
    Always call this on every authenticated request.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        raise

    if payload.get("type") != expected_type:
        raise JWTError(f"Expected token type '{expected_type}'")

    return payload


def generate_verification_token() -> str:
    """Generate a URL-safe token for email verification / password reset."""
    return secrets.token_urlsafe(32)
