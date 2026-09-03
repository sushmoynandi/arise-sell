"""Authentication endpoints: Register, Login, Refresh, Me."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password, verify_token
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, UserBrief

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
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
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    clean_email = req.email.strip().lower()
    stmt = select(User).where(User.email == clean_email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact support.")

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
