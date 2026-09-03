"""Authentication endpoints: Register, Login, Refresh, Me, Forgot Password, Reset Password, Logout."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
    validate_password_strength,
    create_password_reset_token,
    verify_password_reset_token,
    revoke_token,
)
from app.core.security_middleware import (
    auth_login_limiter,
    auth_register_limiter,
    forgot_password_limiter,
    auth_google_limiter,
    get_client_ip,
)
from app.services.google_oauth import verify_google_identity, GoogleAuthError
from app.core.deps import get_current_active_user, oauth2_scheme
from app.models.user import User
from app.models.tenant import Business
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    RefreshRequest,
    UserBrief,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    LogoutResponse,
    GoogleAuthRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Rate Limiting Protection
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_register_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many registration attempts. Please retry after {retry_after} seconds.",
        )

    # 2. Password Strength Validation
    valid, err_msg = validate_password_strength(req.password)
    if not valid:
        raise HTTPException(status_code=400, detail=err_msg)

    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This email is already registered. Please sign in.")

    # Determine first and last name
    first_name = req.first_name
    last_name = req.last_name
    if not first_name and req.full_name:
        parts = req.full_name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    first_name = (first_name or "Merchant").strip()
    last_name = (last_name or "").strip()

    # Determine store name
    store_name = (req.store_name or f"{first_name}'s Store").strip()
    store_slug = f"store-{uuid.uuid4().hex[:6]}"

    # Create business tenant with default commercial "Free" plan
    biz = Business(
        name=store_name,
        slug=store_slug,
        plan="Free",
    )
    db.add(biz)
    await db.flush()

    user = User(
        business_id=biz.id,
        email=clean_email,
        hashed_password=hash_password(req.password),
        first_name=first_name,
        last_name=last_name,
        role="owner",
        is_active=True,
        is_verified=True,
        last_login=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access = create_access_token({"sub": str(user.id), "business_id": str(biz.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access=access,
        refresh=refresh,
        user=UserBrief(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_verified=user.is_verified,
            role=user.role,
            is_superadmin=user.is_superadmin,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Rate Limiting / Brute-force defense
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_login_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please retry after {retry_after} seconds.",
        )

    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact support.")

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    access = create_access_token({"sub": str(user.id), "business_id": str(user.business_id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access=access,
        refresh=refresh,
        user=UserBrief(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_verified=user.is_verified,
            role=user.role,
            is_superadmin=user.is_superadmin,
        ),
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(req: RefreshRequest):
    try:
        payload = verify_token(req.refresh, expected_type="refresh")
        user_id = payload.get("sub")
        new_access = create_access_token({"sub": user_id})
        return {"access": new_access}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.get("/me", response_model=UserBrief)
async def get_me(user: User = Depends(get_current_active_user)):
    return UserBrief(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_verified=user.is_verified,
        role=user.role,
        is_superadmin=user.is_superadmin,
    )


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Initiate password reset flow."""
    client_ip = get_client_ip(request)
    allowed, retry_after = forgot_password_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many password reset requests. Please retry after {retry_after} seconds.",
        )

    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Return standard message to prevent email enumeration attack
    if not user:
        return {
            "success": True,
            "message": "If an account exists with this email, password reset instructions have been dispatched.",
        }

    reset_token = create_password_reset_token(clean_email, expires_minutes=15)
    return {
        "success": True,
        "message": "If an account exists with this email, password reset instructions have been dispatched.",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Confirm password reset with cryptographically signed token."""
    try:
        email = verify_password_reset_token(req.token)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    valid, err_msg = validate_password_strength(req.new_password)
    if not valid:
        raise HTTPException(status_code=400, detail=err_msg)

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    user.hashed_password = hash_password(req.new_password)
    revoke_token(req.token)  # Invalidate reset token once used
    await db.commit()

    return {"success": True, "message": "Password updated successfully. Please sign in with your new password."}


@router.post("/logout", response_model=LogoutResponse)
async def logout(token: str = Depends(oauth2_scheme)):
    """Revoke session token on the server side."""
    revoke_token(token)
    return LogoutResponse(success=True, message="Session logged out successfully")


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    req: GoogleAuthRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Google Sign-In / OAuth exchange with rate limiting and cryptographic identity verification."""
    # 1. Rate Limiting Protection (max 10 requests per minute per IP)
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_google_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many Google authentication attempts. Please retry after {retry_after} seconds.",
        )

    # 2. Cryptographic Token Verification & Profile Extraction
    try:
        profile = await verify_google_identity(
            credential=req.credential,
            access_token=req.access_token,
        )
    except GoogleAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    # 3. User Lookup or Auto-Provisioning
    stmt = select(User).where(User.email == profile.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support.",
            )
        user.last_login = datetime.now(timezone.utc)
        if profile.avatar_url and not user.avatar_url:
            user.avatar_url = profile.avatar_url
        await db.commit()
    else:
        # Provision store & merchant user account
        store_name = f"{profile.first_name}'s Store"
        store_slug = f"store-{uuid.uuid4().hex[:6]}"
        biz = Business(name=store_name, slug=store_slug, plan="growth")
        db.add(biz)
        await db.flush()

        random_pw = uuid.uuid4().hex + uuid.uuid4().hex
        user = User(
            business_id=biz.id,
            email=profile.email,
            hashed_password=hash_password(random_pw),
            first_name=profile.first_name,
            last_name=profile.last_name,
            avatar_url=profile.avatar_url,
            role="owner",
            is_active=True,
            is_verified=True,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # 4. Generate JWT Pair
    access = create_access_token(
        {"sub": str(user.id), "business_id": str(user.business_id), "role": user.role}
    )
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access=access,
        refresh=refresh,
        user=UserBrief(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_verified=user.is_verified,
            role=user.role,
            is_superadmin=user.is_superadmin,
        ),
    )


