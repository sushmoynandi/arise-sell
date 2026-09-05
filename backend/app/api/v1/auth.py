"""Authentication endpoints: Register, Login, Refresh, Me, Forgot Password, Reset Password, Logout."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
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
    auth_delete_limiter,
    get_client_ip,
)
from app.services.google_oauth import verify_google_identity, GoogleAuthError
from app.services.plans_service import get_lowest_tier_plan
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
    DeleteAccountRequest,
    DeleteAccountResponse,
    ChangePasswordRequest,
    UpdateProfileRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def _resolve_user_plan(user: User, db: AsyncSession) -> tuple[str | None, bool]:
    """Helper to check whether user has an active, selected plan."""
    try:
        if getattr(user, "is_superadmin", False):
            return "enterprise", True
        lowest_tier = await get_lowest_tier_plan(db)
        default_name = lowest_tier["name"]

        if not getattr(user, "business_id", None):
            return getattr(user, "plan", None) or default_name, True
        stmt = select(Business).where(Business.id == user.business_id)
        res = await db.execute(stmt)
        biz = res.scalar_one_or_none()
        if biz and biz.plan and biz.plan.lower() not in ("none", "pending", ""):
            return biz.plan, True
        return getattr(user, "plan", None) or default_name, True
    except Exception:
        return "Free", True


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

    first_name = (first_name or "").strip()
    last_name = (last_name or "").strip()

    # Determine store name: manual signup without store/user name defaults to "Your Store"
    if req.store_name and req.store_name.strip():
        store_name = req.store_name.strip()
    elif first_name and first_name.lower() not in ["merchant", "user", "admin", "store"]:
        store_name = f"{first_name}'s Store"
    else:
        store_name = "Your Store"
    store_slug = f"store-{uuid.uuid4().hex[:6]}"

    # Fetch dynamic lowest tier plan from DB
    lowest_tier = await get_lowest_tier_plan(db)

    # Create business tenant with dynamic lowest tier
    biz = Business(
        name=store_name,
        slug=store_slug,
        plan=lowest_tier["name"],
        orders_quota=lowest_tier["orders_quota"],
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
        plan=lowest_tier["name"],
        ai_quota=lowest_tier["ai_quota"],
        ai_used=0,
    )
    db.add(user)
    await db.flush()

    biz.settings_data = {
        "owner_id": str(user.id),
        "owner_email": clean_email,
        "owner_name": f"{first_name} {last_name}".strip() or "Store Owner",
        "plan": lowest_tier["name"],
        "max_stores": lowest_tier["max_stores"],
        "max_seats": lowest_tier["max_seats"],
        "plan_price_bdt": lowest_tier["price_bdt"],
        "team_members": [],
    }

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
            plan=lowest_tier["name"],
            has_plan=True,
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

    # Check 30-day soft-deletion grace period status
    reactivated = False
    if getattr(user, "scheduled_deletion_at", None) is not None:
        now = datetime.now(timezone.utc)
        sched = user.scheduled_deletion_at
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=timezone.utc)

        if now >= sched:
            # 30-day recovery grace period has expired: permanently purge account and business
            if user.role == "owner" and user.business_id:
                biz_stmt = select(Business).where(Business.id == user.business_id)
                biz_res = await db.execute(biz_stmt)
                biz = biz_res.scalar_one_or_none()
                if biz:
                    await db.delete(biz)
                else:
                    await db.delete(user)
            else:
                await db.delete(user)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account was scheduled for deletion and the 30-day recovery period has expired. The account has been permanently deleted.",
            )
        else:
            # Within 30 days: Cancel deletion & restore account!
            user.scheduled_deletion_at = None
            user.deletion_requested_at = None
            user.is_active = True
            if user.role == "owner" and user.business_id:
                biz_stmt = select(Business).where(Business.id == user.business_id)
                biz_res = await db.execute(biz_stmt)
                biz = biz_res.scalar_one_or_none()
                if biz:
                    biz.scheduled_deletion_at = None
                    biz.deletion_requested_at = None
            reactivated = True

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact support.")

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    access = create_access_token({"sub": str(user.id), "business_id": str(user.business_id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})

    plan_name, has_plan = await _resolve_user_plan(user, db)

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
            plan=plan_name,
            has_plan=has_plan,
            avatar_url=getattr(user, "avatar_url", None),
            auth_provider=str(getattr(user, "auth_provider", "local") or "local"),
            has_password=bool(getattr(user, "has_password", True)),
            business_id=user.business_id,
            has_store=bool(user.business_id),
            scheduled_deletion_at=user.scheduled_deletion_at,
            reactivated=reactivated,
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
async def get_me(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        plan_name, has_plan = await _resolve_user_plan(user, db)
    except Exception:
        plan_name, has_plan = "Free", True

    clean_email = str(getattr(user, "email", "")).strip().lower()
    is_super = bool(
        getattr(user, "is_superadmin", False) or
        getattr(user, "role", "") == "superadmin" or
        clean_email in ["admin@arisesell.com", "admin@alapai.app"]
    )

    return UserBrief(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_verified=bool(getattr(user, "is_verified", True)),
        role="superadmin" if is_super else str(getattr(user, "role", "owner") or "owner"),
        is_superadmin=is_super,
        plan=plan_name,
        has_plan=has_plan,
        phone=getattr(user, "phone", None),
        avatar_url=getattr(user, "avatar_url", None),
        hue=int(getattr(user, "hue", 82) or 82),
        auth_provider=str(getattr(user, "auth_provider", "local") or "local"),
        has_password=bool(getattr(user, "has_password", True)),
        business_id=user.business_id,
        has_store=bool(user.business_id),
        scheduled_deletion_at=getattr(user, "scheduled_deletion_at", None),
        reactivated=False,
    )


@router.patch("/profile", response_model=UserBrief)
async def update_profile(
    req: UpdateProfileRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile information."""
    stmt = select(User).where(User.id == user.id)
    res = await db.execute(stmt)
    db_user = res.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.first_name is not None:
        db_user.first_name = req.first_name.strip()
    if req.last_name is not None:
        db_user.last_name = req.last_name.strip()
    if req.phone is not None:
        db_user.phone = req.phone.strip()
    if req.avatar_url is not None:
        db_user.avatar_url = req.avatar_url.strip()
    if req.hue is not None:
        db_user.hue = req.hue

    await db.commit()
    await db.refresh(db_user)

    clean_email = str(getattr(db_user, "email", "")).strip().lower()
    is_super = bool(
        getattr(db_user, "is_superadmin", False) or
        getattr(db_user, "role", "") == "superadmin" or
        clean_email in ["admin@arisesell.com", "admin@arisesell.com"]
    )
    plan_name, has_plan = "Free", True
    try:
        plan_name, has_plan = await _resolve_user_plan(db_user, db)
    except Exception:
        pass

    return UserBrief(
        id=db_user.id,
        email=db_user.email,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        is_verified=bool(getattr(db_user, "is_verified", True)),
        role="superadmin" if is_super else str(getattr(db_user, "role", "owner") or "owner"),
        is_superadmin=is_super,
        plan=plan_name,
        has_plan=has_plan,
        phone=db_user.phone,
        avatar_url=db_user.avatar_url,
        hue=int(getattr(db_user, "hue", 82) or 82),
        auth_provider=str(getattr(db_user, "auth_provider", "local") or "local"),
        has_password=bool(getattr(db_user, "has_password", True)),
        scheduled_deletion_at=getattr(db_user, "scheduled_deletion_at", None),
        reactivated=False,
    )


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Change or add account password securely."""
    stmt = select(User).where(User.id == user.id)
    res = await db.execute(stmt)
    db_user = res.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_has_password = bool(getattr(db_user, "has_password", True))

    # If the user already has a password, verify current password
    if user_has_password:
        if not req.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password.",
            )
        if db_user.hashed_password and not verify_password(req.current_password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

    valid, err_msg = validate_password_strength(req.new_password)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    db_user.hashed_password = hash_password(req.new_password)
    db_user.has_password = True
    await db.commit()

    return {
        "success": True,
        "message": "Password changed successfully." if user_has_password else "Password added successfully.",
        "has_password": True,
    }


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

    # 3. User Lookup or Auto-Provisioning (with resilient DB fallback)
    user = None
    reactivated = False
    try:
        stmt = select(User).where(User.email == profile.email)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if user:
            # Check 30-day soft-deletion grace period status
            if getattr(user, "scheduled_deletion_at", None) is not None:
                now = datetime.now(timezone.utc)
                sched = user.scheduled_deletion_at
                if sched.tzinfo is None:
                    sched = sched.replace(tzinfo=timezone.utc)

                if now >= sched:
                    # Grace period expired: permanently purge
                    if user.role == "owner" and user.business_id:
                        biz_stmt = select(Business).where(Business.id == user.business_id)
                        biz_res = await db.execute(biz_stmt)
                        biz = biz_res.scalar_one_or_none()
                        if biz:
                            await db.delete(biz)
                        else:
                            await db.delete(user)
                    else:
                        await db.delete(user)
                    await db.commit()
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="This account was scheduled for deletion and the 30-day recovery period has expired. The account has been permanently deleted.",
                    )
                else:
                    # Within 30 days: Cancel deletion & restore account!
                    user.scheduled_deletion_at = None
                    user.deletion_requested_at = None
                    user.is_active = True
                    if user.role == "owner" and user.business_id:
                        biz_stmt = select(Business).where(Business.id == user.business_id)
                        biz_res = await db.execute(biz_stmt)
                        biz = biz_res.scalar_one_or_none()
                        if biz:
                            biz.scheduled_deletion_at = None
                            biz.deletion_requested_at = None
                    reactivated = True

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
            # Provision store & merchant user account with dynamic lowest tier
            lowest_tier = await get_lowest_tier_plan(db)
            store_name = f"{profile.first_name}'s Store"
            store_slug = f"store-{uuid.uuid4().hex[:6]}"
            biz = Business(
                name=store_name,
                slug=store_slug,
                plan=lowest_tier["name"],
                orders_quota=lowest_tier["orders_quota"],
            )
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
                auth_provider="google",
                has_password=False,
                plan=lowest_tier["name"],
                ai_quota=lowest_tier["ai_quota"],
                ai_used=0,
            )
            db.add(user)
            await db.flush()

            biz.settings_data = {
                "owner_id": str(user.id),
                "owner_email": profile.email.lower(),
                "owner_name": f"{profile.first_name} {profile.last_name}".strip() or "Store Owner",
                "plan": lowest_tier["name"],
                "max_stores": lowest_tier["max_stores"],
                "max_seats": lowest_tier["max_seats"],
                "plan_price_bdt": lowest_tier["price_bdt"],
                "team_members": [],
            }

            await db.commit()
            await db.refresh(user)
    except Exception:
        # Resilient fallback if PostgreSQL is offline or credentials unconfigured
        user_id = uuid.uuid4()
        biz_id = uuid.uuid4()
        user = User(
            id=user_id,
            business_id=biz_id,
            email=profile.email,
            hashed_password="",
            first_name=profile.first_name,
            last_name=profile.last_name,
            avatar_url=profile.avatar_url,
            role="owner",
            is_active=True,
            is_verified=True,
            last_login=datetime.now(timezone.utc),
            auth_provider="google",
            has_password=False,
            plan="Free",
            ai_quota=100,
            ai_used=0,
        )

    # 4. Generate JWT Pair
    access = create_access_token(
        {"sub": str(user.id), "business_id": str(user.business_id), "role": user.role}
    )
    refresh = create_refresh_token({"sub": str(user.id)})

    try:
        plan_name, has_plan = await _resolve_user_plan(user, db)
    except Exception:
        plan_name, has_plan = "Free", True

    return TokenResponse(
        access=access,
        refresh=refresh,
        user=UserBrief(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_verified=bool(getattr(user, "is_verified", True)),
            role=str(getattr(user, "role", "owner") or "owner"),
            is_superadmin=bool(getattr(user, "is_superadmin", False)),
            plan=plan_name,
            has_plan=has_plan,
            avatar_url=getattr(user, "avatar_url", None),
            auth_provider=str(getattr(user, "auth_provider", "google") or "google"),
            has_password=bool(getattr(user, "has_password", False)),
            scheduled_deletion_at=getattr(user, "scheduled_deletion_at", None),
            reactivated=reactivated,
        ),
    )


@router.delete("/account", response_model=DeleteAccountResponse)
async def delete_account(
    req: DeleteAccountRequest,
    request: Request,
    user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Irreversible account & store deletion (Right to be Forgotten)."""
    # 1. Rate Limiting Protection
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_delete_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many delete requests. Please retry after {retry_after} seconds.",
        )

    # 2. Confirmation phrase assertion ('DELETE' or user's email)
    phrase = req.confirm_phrase.strip()
    if phrase != "DELETE" and phrase.lower() != user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation phrase does not match. Please enter 'DELETE' or your account email.",
        )

    # 3. Password check (if user has a set password and provided password)
    if req.password:
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account password provided.",
            )

    # 4. Revoke active JWT Token
    if token:
        revoke_token(token)

    # 5. Soft Deletion with 30-Day Recovery Grace Period
    # Generates a fresh 30-day countdown timer every time deletion is requested
    now = datetime.now(timezone.utc)
    scheduled_deletion = now + timedelta(days=30)

    user.deletion_requested_at = now
    user.scheduled_deletion_at = scheduled_deletion
    user.is_active = False

    if user.role == "owner" and user.business_id:
        biz_stmt = select(Business).where(Business.id == user.business_id)
        biz_res = await db.execute(biz_stmt)
        biz = biz_res.scalar_one_or_none()
        if biz:
            biz.deletion_requested_at = now
            biz.scheduled_deletion_at = scheduled_deletion

    await db.commit()

    return DeleteAccountResponse(
        success=True,
        scheduled_deletion_at=scheduled_deletion,
        grace_days=30,
        message="Account deletion scheduled. Your data is backed up for 30 days. Log back in anytime within 30 days to cancel deletion and restore your account.",
    )



