"""Super Admin Authentication and 2FA TOTP Verification (Production Database Backed)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_totp_token,
)
from app.core.security_middleware import (
    auth_login_limiter,
    admin_2fa_limiter,
    get_client_ip,
)
from app.models.user import User
from app.models.tenant import Business

router = APIRouter(prefix="/admin/auth", tags=["Super Admin Authentication"])


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class Admin2FARequest(BaseModel):
    email: EmailStr
    totp_code: str


class AdminAuthResponse(BaseModel):
    access: str
    refresh: str
    requires_2fa: bool = False
    user: dict


@router.post("/login", response_model=AdminAuthResponse)
async def admin_login(req: AdminLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Rate Limiting Protection (Max 8 attempts/min per IP)
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_login_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many admin login attempts. Please retry after {retry_after} seconds.",
        )

    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email, User.is_superadmin == True)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Development auto-provisioning for initial developer setup
    if not user and not settings.is_production:
        is_dev_admin = (
            (clean_email == "admin@nextproduct.ai" and req.password in ["MasterAdmin@2026", "SuperAdmin123!"]) or
            (clean_email == "farhana@nokshi.co" and req.password in ["DemoPass123!", "SuperAdmin123!"]) or
            (clean_email == "admin@alapai.app" and req.password == "SuperAdmin123!")
        )
        if is_dev_admin:
            # Provision or promote in DB
            biz_stmt = select(Business).limit(1)
            biz_res = await db.execute(biz_stmt)
            biz = biz_res.scalar_one_or_none()
            if not biz:
                biz = Business(name="Platform Superadmin HQ", slug="admin-hq", plan="vip-scale")
                db.add(biz)
                await db.flush()

            user = User(
                business_id=biz.id,
                email=clean_email,
                hashed_password=hash_password(req.password),
                first_name="Platform",
                last_name="Superadmin",
                role="owner",
                is_active=True,
                is_verified=True,
                is_superadmin=True,
                last_login=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    if not user.is_active or not user.is_superadmin:
        raise HTTPException(status_code=403, detail="Superadmin authorization denied")

    return AdminAuthResponse(
        access="",
        refresh="",
        requires_2fa=True,
        user={"email": user.email, "role": "superadmin"},
    )


@router.post("/verify-2fa", response_model=AdminAuthResponse)
async def admin_verify_2fa(req: Admin2FARequest, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Rate Limiting Protection (Max 5 attempts/min per IP)
    client_ip = get_client_ip(request)
    allowed, retry_after = admin_2fa_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many 2FA verification attempts. Please retry after {retry_after} seconds.",
        )

    # 2. TOTP Verification
    is_valid_totp = False
    if not settings.is_production and req.totp_code == "123456":
        is_valid_totp = True
    elif settings.ADMIN_2FA_SECRET:
        is_valid_totp = verify_totp_token(settings.ADMIN_2FA_SECRET, req.totp_code)

    if not is_valid_totp:
        raise HTTPException(status_code=401, detail="Invalid 2FA verification code")

    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email, User.is_superadmin == True)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Superadmin privileges required")

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    access = create_access_token({
        "sub": str(user.id),
        "business_id": str(user.business_id),
        "role": "superadmin",
        "is_superadmin": True,
    })
    refresh = create_refresh_token({"sub": str(user.id)})

    return AdminAuthResponse(
        access=access,
        refresh=refresh,
        requires_2fa=False,
        user={
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": "superadmin",
            "is_superadmin": True,
        },
    )
