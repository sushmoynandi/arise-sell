"""Script to inspect and synchronize database schema across all declared models."""
import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.core.database import engine, Base
import app.models  # Load all models into Base.metadata


async def sync_database():
    print("Connecting to database via SQLAlchemy engine...")
    async with engine.begin() as conn:
        res = await conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            )
        )
        existing_tables = [r[0] for r in res.fetchall()]
        print(f"Existing tables count: {len(existing_tables)}")
        print("Existing tables:", existing_tables)

        print("\nCreating missing SQLAlchemy tables (Base.metadata.create_all)...")
        await conn.run_sync(Base.metadata.create_all)

        print("\nEnsuring 'festival_offers' table exists...")
        await conn.execute(
            text(
                """
            CREATE TABLE IF NOT EXISTS festival_offers (
                id VARCHAR(128) PRIMARY KEY,
                festival_name VARCHAR(255) NOT NULL,
                festival_name_bn VARCHAR(255),
                coupon_code VARCHAR(64) NOT NULL,
                discount_percent INTEGER DEFAULT 20,
                bonus_messages INTEGER DEFAULT 0,
                validity VARCHAR(128) DEFAULT 'Limited Time Offer',
                active BOOLEAN DEFAULT TRUE,
                applicable_plan VARCHAR(100) DEFAULT 'all',
                applicable_plan_name VARCHAR(100) DEFAULT 'All Plans',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """
            )
        )

        res2 = await conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            )
        )
        updated_tables = [r[0] for r in res2.fetchall()]
        print(f"\nUpdated tables count: {len(updated_tables)}")
        print("Updated tables:", updated_tables)

        # Check if enterprise_contracts and festival_offers and subscription_plans exist
        key_tables = ["enterprise_contracts", "festival_offers", "subscription_plans", "businesses", "users", "invoices"]
        for t in key_tables:
            status = "EXISTS" if t in updated_tables else "MISSING"
            print(f" - Table '{t}': {status}")


if __name__ == "__main__":
    asyncio.run(sync_database())
