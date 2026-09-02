"""Security, Authentication, Cryptography, and Token Management."""
from __future__ import annotations

import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import pyotp
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Generate a signed JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """Decode and validate a JWT token payload."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        token_type = payload.get("type")
        if token_type != expected_type:
            raise ValueError(f"Invalid token type: expected {expected_type}, got {token_type}")
        return payload
    except JWTError as exc:
        raise ValueError("Could not validate credentials") from exc


decode_token = verify_token


def verify_webhook_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    """
    Validate HMAC-SHA256 signature for Meta / Facebook / WhatsApp webhooks.
    Header format: sha256=<hash>
    """
    if not signature_header or not secret:
        return False
    try:
        if signature_header.startswith("sha256="):
            signature_header = signature_header[7:]
        expected_sig = hmac.new(
            secret.encode("utf-8"),
            msg=payload,
            digestmod=hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header)
    except Exception:
        return False


def generate_totp_secret() -> str:
    """Generate a new base32 TOTP secret for 2FA."""
    return pyotp.random_base32()


def verify_totp_token(secret: str, token: str) -> bool:
    """Verify a 6-digit TOTP token against a secret (with 1-step drift window)."""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)
