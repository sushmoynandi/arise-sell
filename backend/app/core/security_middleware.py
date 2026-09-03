"""Security headers and rate limiting middlewares for FastAPI backend."""
from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    OWASP Recommended Security Headers:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security (HSTS)
    - Referrer-Policy: strict-origin-when-cross-origin
    - Permissions-Policy: camera=(), microphone=(), geolocation=()
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response: Response = await call_next(request)
        headers = response.headers
        headers["X-Content-Type-Options"] = "nosniff"
        headers["X-Frame-Options"] = "DENY"
        headers["X-XSS-Protection"] = "1; mode=block"
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # HSTS in production or HTTPS
        if settings.is_production or request.url.scheme == "https":
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        return response


class SimpleRateLimiter:
    """
    Sliding window in-memory rate limiter to protect sensitive auth endpoints
    against credential stuffing and brute-force attacks.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # client_ip -> list of timestamps
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, client_key: str) -> tuple[bool, int]:
        """
        Returns (is_allowed, retry_after_seconds).
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old timestamps
        timestamps = [ts for ts in self.requests[client_key] if ts > window_start]
        self.requests[client_key] = timestamps

        if len(timestamps) >= self.max_requests:
            oldest_timestamp = timestamps[0]
            retry_after = int(self.window_seconds - (now - oldest_timestamp)) + 1
            return False, max(retry_after, 1)

        self.requests[client_key].append(now)
        return True, 0


# Global limiters
# Login limiter: max 8 attempts per minute per IP
auth_login_limiter = SimpleRateLimiter(max_requests=8, window_seconds=60)

# Register limiter: max 5 registrations per minute per IP
auth_register_limiter = SimpleRateLimiter(max_requests=5, window_seconds=60)

# Admin 2FA limiter: max 5 attempts per minute
admin_2fa_limiter = SimpleRateLimiter(max_requests=5, window_seconds=60)

# Password reset limiter: max 3 requests per minute per IP
forgot_password_limiter = SimpleRateLimiter(max_requests=3, window_seconds=60)

# Google OAuth token exchange limiter: max 10 requests per minute per IP
auth_google_limiter = SimpleRateLimiter(max_requests=10, window_seconds=60)


def get_client_ip(request: Request) -> str:
    """Extract real client IP considering reverse proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

