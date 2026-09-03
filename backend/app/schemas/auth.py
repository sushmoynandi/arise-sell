"""Authentication request/response schemas."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    """New user registration payload."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    password2: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    store_name: str | None = None

    @model_validator(mode="after")
    def check_passwords_match_and_complexity(self) -> RegisterRequest:
        if self.password2 is not None and self.password != self.password2:
            raise ValueError("Passwords do not match")
        if len(self.password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return self


class LoginRequest(BaseModel):
    """Login credentials."""
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Password reset request payload."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Confirm password reset payload."""
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str | None = None

    @model_validator(mode="after")
    def check_passwords_match(self) -> ResetPasswordRequest:
        if self.confirm_password is not None and self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LogoutResponse(BaseModel):
    """Logout confirmation."""
    success: bool = True
    message: str = "Logged out successfully"


class UserBrief(BaseModel):
    """Minimal user information returned with tokens."""
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_verified: bool = True
    role: str = "owner"
    is_superadmin: bool = False
    plan: str | None = None
    has_plan: bool = False

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
    """Google OAuth ID token or Access token."""
    credential: str | None = None
    access_token: str | None = None


class SelectPlanRequest(BaseModel):
    """Payload to select or upgrade subscription plan."""
    plan_id: str = Field(..., description="Plan identifier: free, basic, growth, pro, scale")
    billing_period: str = Field("monthly", description="Billing frequency: monthly or yearly")


class SelectPlanResponse(BaseModel):
    """Response after selecting a subscription plan."""
    success: bool = True
    plan: str
    orders_quota: int
    message: str


class DeleteAccountRequest(BaseModel):
    """Payload to confirm irreversible account deletion."""
    password: str | None = Field(None, description="Account password if set")
    confirm_phrase: str = Field(..., description="Confirmation phrase: must be 'DELETE' or user's email")


class DeleteAccountResponse(BaseModel):
    """Response confirming account deletion."""
    success: bool = True
    message: str = "Account and associated data have been permanently deleted."


