"""Security, Authentication, Cryptography, and Token Management."""
from __future__ import annotations

import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import pyotp
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (truncated to 72 bytes)."""
    pw_bytes = password[:72].encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    try:
        pw_bytes = plain_password[:72].encode("utf-8")
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


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


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets minimum security standards:
    - Minimum 8 characters
    - At least one lowercase character
    - At least one uppercase character or digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter."
    if not (any(c.isupper() for c in password) or any(c.isdigit() for c in password)):
        return False, "Password must contain at least one uppercase letter or number."
    return True, ""


# In-memory token revocation blacklist (token_jti or token_string -> expiry timestamp)
_REVOKED_TOKENS: set[str] = set()


def revoke_token(token: str) -> None:
    """Mark a token as revoked."""
    if token:
        _REVOKED_TOKENS.add(token)


def is_token_revoked(token: str) -> bool:
    """Check whether a token has been revoked."""
    return token in _REVOKED_TOKENS


def create_password_reset_token(email: str, expires_minutes: int = 15) -> str:
    """Generate a cryptographically signed password reset token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_password_reset_token(token: str) -> str:
    """Decode and validate a password reset token. Returns user email."""
    payload = verify_token(token, expected_type="password_reset")
    email = payload.get("sub")
    if not email:
        raise ValueError("Invalid password reset token: email missing")
    if is_token_revoked(token):
        raise ValueError("Password reset token has already been used or revoked")
    return str(email)

