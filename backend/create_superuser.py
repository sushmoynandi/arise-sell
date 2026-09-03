"""CLI Script to Create or Promote a Superuser for AriseSell Admin Panel."""
from __future__ import annotations

import argparse
import asyncio
import getpass
import sys
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.models.tenant import Business
from app.models.user import User


async def create_or_promote_superuser(
    email: str,
    password: str | None = None,
    first_name: str = "Admin",
    last_name: str = "Superuser",
    store_name: str = "Platform Admin HQ",
) -> None:
    clean_email = email.strip().lower()

    async with async_session_factory() as db:
        stmt = select(User).where(User.email == clean_email)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if user:
            print(f"👤 Found existing user account: {user.email}")
            user.is_superadmin = True
            user.is_active = True
            user.is_verified = True
            if password:
                user.hashed_password = hash_password(password)
                print("🔑 Password updated successfully.")
            await db.commit()
            await db.refresh(user)
            print(f"✅ SUCCESS: User '{user.email}' is now a SUPERADMIN!")
            return

        if not password:
            print("❌ Error: Password is required to create a new superuser.")
            sys.exit(1)

        # Ensure a platform tenant/business exists
        biz_stmt = select(Business).where(Business.slug == "admin-hq")
        biz_res = await db.execute(biz_stmt)
        biz = biz_res.scalar_one_or_none()

        if not biz:
            # Fallback to any business or create new
            any_biz_stmt = select(Business).limit(1)
            any_biz_res = await db.execute(any_biz_stmt)
            biz = any_biz_res.scalar_one_or_none()

        if not biz:
            biz = Business(
                name=store_name,
                slug="admin-hq",
                plan="enterprise",
                orders_quota=999999,
            )
            db.add(biz)
            await db.flush()

        new_user = User(
            business_id=biz.id,
            email=clean_email,
            hashed_password=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role="owner",
            is_active=True,
            is_verified=True,
            is_superadmin=True,
            last_login=datetime.now(timezone.utc),
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        print(f"✅ SUCCESS: Superuser '{new_user.email}' created successfully!")


def main():
    parser = argparse.ArgumentParser(description="Create or promote a superuser for AriseSell Admin Panel.")
    parser.add_argument("--email", "-e", help="Superuser email address")
    parser.add_argument("--password", "-p", help="Superuser password")
    parser.add_argument("--first-name", default="Admin", help="First name")
    parser.add_argument("--last-name", default="Superuser", help="Last name")

    args = parser.parse_args()

    email = args.email
    password = args.password

    if not email:
        email = input("Superuser Email: ").strip()
    if not password:
        password = getpass.getpass("Superuser Password: ").strip()

    if not email:
        print("❌ Error: Email cannot be empty.")
        sys.exit(1)

    asyncio.run(
        create_or_promote_superuser(
            email=email,
            password=password if password else None,
            first_name=args.first_name,
            last_name=args.last_name,
        )
    )


if __name__ == "__main__":
    main()

