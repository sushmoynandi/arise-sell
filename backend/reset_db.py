"""Database Reset and Seeding Script for Arise-Sell.

Wipes all existing tables, recreates schema cleanly,
and seeds the official subscription plans and superadmin account.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text

# Import all models so Base.metadata contains all tables
import app.models  # noqa: F401
from app.core.database import Base, async_session_factory, engine
from app.core.security import hash_password
from app.models.billing import SubscriptionPlan
from app.models.user import User


async def reset_database() -> None:
    print("Connecting to PostgreSQL to reset schema...")

    async with engine.begin() as conn:
        print("Wiping existing public schema...")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        try:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector;'))
            print("pgvector extension created.")
        except Exception as e:
            print(f"Warning: Could not create vector extension: {e}")
        print("Re-creating all tables from SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)
        print("Schema and tables created successfully.")

    plans_path = os.path.join(os.path.dirname(__file__), "data", "plans.json")
    if os.path.exists(plans_path):
        with open(plans_path, "r", encoding="utf-8") as f:
            plans_data = json.load(f)
    else:
        plans_data = []

    async with async_session_factory() as session:
        print(f"Seeding {len(plans_data)} subscription plans...")
        for p in plans_data:
            plan = SubscriptionPlan(
                plan_code=p["id"],
                name=p["name"],
                name_bn=p.get("nameBn"),
                tagline=p.get("tagline"),
                price_bdt=float(p.get("priceBDT", 0)),
                yearly_price_bdt=float(p.get("yearlyPriceBDT", 0)) if p.get("yearlyPriceBDT") is not None else None,
                yearly_discount_percent=int(p.get("yearlyDiscountPercent", 17)),
                billing_period=p.get("billingPeriod", "both"),
                message_limit=int(p.get("messageLimit", 200)),
                max_stores=int(p.get("maxStores", 1)),
                max_seats=int(p.get("maxSeats", 1)),
                catalog_limit=int(p.get("catalogLimit", 250)),
                courier_channels=int(p.get("courierChannels", 2)),
                features=p.get("features", []),
                badge=p.get("badge"),
                popular=bool(p.get("popular", False)),
                active_merchants=0,
                status=p.get("status", "active"),
                show_on_home=bool(p.get("showOnHome", True)),
            )
            session.add(plan)

        print("Seeding default Super Admin account...")
        admin_user = User(
            email="admin@arisesell.com",
            hashed_password=hash_password("AdminPass123!"),
            first_name="Super",
            last_name="Admin",
            role="owner",
            is_active=True,
            is_verified=True,
            is_superadmin=True,
            auth_provider="local",
            has_password=True,
            business_id=None,
            plan="Business",
            ai_quota=100000,
            ai_used=0,
        )
        session.add(admin_user)

        await session.commit()
        print("Database reset & seeding completed successfully!")
        print("Super Admin credentials: admin@arisesell.com / AdminPass123!")


if __name__ == "__main__":
    asyncio.run(reset_database())
