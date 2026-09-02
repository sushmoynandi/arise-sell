"""Authentication request/response schemas."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    """New user registration payload."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    password2: str = Field(..., description="Must match password")
    first_name: str
    last_name: str

    @model_validator(mode="after")
    def check_passwords_match(self) -> RegisterRequest:
        if self.password != self.password2:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    """Login credentials."""
    email: EmailStr
    password: str


class UserBrief(BaseModel):
    """Minimal user information returned with tokens."""
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_verified: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token pair with user info."""
    access: str
    refresh: str
    user: UserBrief


class RefreshRequest(BaseModel):
    """Refresh token exchange."""
    refresh: str


class GoogleAuthRequest(BaseModel):
    """Google OAuth ID token."""
    credential: str
