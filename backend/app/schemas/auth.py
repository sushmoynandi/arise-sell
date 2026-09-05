"""Authentication request/response schemas."""
from __future__ import annotations

from datetime import datetime
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
    phone: str | None = None
    avatar_url: str | None = None
    hue: int = 82
    auth_provider: str = "local"
    has_password: bool = True
    business_id: UUID | None = None
    has_store: bool = True
    scheduled_deletion_at: datetime | None = None
    reactivated: bool = False

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    """Change password payload."""
    current_password: str | None = None
    new_password: str = Field(..., min_length=8)
    confirm_password: str | None = None

    @model_validator(mode="after")
    def check_passwords_match(self) -> ChangePasswordRequest:
        if self.confirm_password is not None and self.new_password != self.confirm_password:
            raise ValueError("New passwords do not match")
        return self


class UpdateProfileRequest(BaseModel):
    """Update profile information payload."""
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    hue: int | None = None


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


class PlanReconciliationPayload(BaseModel):
    """Payload to resolve capacity conflicts when downgrading a plan."""
    keep_store_ids: list[str] = Field(default_factory=list, description="IDs of stores to keep active; unselected will be frozen")
    keep_team_member_ids: list[str] = Field(default_factory=list, description="IDs of team members to retain; unselected will be removed")


class SelectPlanRequest(BaseModel):
    """Payload to select or upgrade/downgrade subscription plan."""
    plan_id: str = Field(..., description="Plan identifier: free, basic, growth, pro, scale")
    billing_period: str = Field("monthly", description="Billing frequency: monthly or yearly")
    reconciliation: PlanReconciliationPayload | None = Field(None, description="Optional reconciliation for downgrades")


class SelectPlanResponse(BaseModel):
    """Response after selecting a subscription plan."""
    success: bool = True
    plan: str
    orders_quota: int
    message: str
    active_stores: list[str] = Field(default_factory=list)
    frozen_stores: list[str] = Field(default_factory=list)


class CheckPlanSwitchRequest(BaseModel):
    """Payload to check whether switching to a plan requires capacity reconciliation."""
    plan_id: str


class StoreConflictItem(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool
    is_frozen: bool


class TeammateConflictItem(BaseModel):
    id: str
    name: str
    email: str
    role: str


class CheckPlanSwitchResponse(BaseModel):
    can_switch_directly: bool
    requires_reconciliation: bool
    current_plan: str
    target_plan: str
    target_max_stores: int
    target_max_seats: int
    target_teammates_allowed: int
    stores_conflict: bool
    seats_conflict: bool
    owned_stores: list[StoreConflictItem]
    active_stores_count: int
    team_members: list[TeammateConflictItem]
    current_teammates_count: int


class DeleteAccountRequest(BaseModel):
    """Payload to confirm irreversible account deletion."""
    password: str | None = Field(None, description="Account password if set")
    confirm_phrase: str = Field(..., description="Confirmation phrase: must be 'DELETE' or user's email")


class DeleteAccountResponse(BaseModel):
    """Response confirming account deletion scheduling."""
    success: bool = True
    scheduled_deletion_at: datetime | None = None
    grace_days: int = 30
    message: str = "Account deletion scheduled. You have 30 days to log back in to cancel deletion and restore your account."


