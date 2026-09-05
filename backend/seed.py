"""Database Seeding Script for AriseSell (Fully Idempotent)."""
from __future__ import annotations

import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.core.database import async_session_factory, Base, engine
from app.core.security import hash_password

# Import models
from app.models.tenant import Organization, Business
from app.models.user import User
from app.models.channel import ConnectedChannel
from app.models.product import Product, Variant
from app.models.ai_config import AIPersona, Guardrail
from app.models.admin import AIProviderKey, CourierGateway


async def seed_database():
    """Seed comprehensive initial dataset into PostgreSQL safely and idempotently."""
    print("🌱 Starting AriseSell Database Seeding...")

    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        except Exception as e:
            print(f"⚠️ Notice on pgvector extension: {e}")
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # 1. Organization
        org_res = await db.execute(select(Organization).where(Organization.slug == "nokshi-group"))
        org = org_res.scalar_one_or_none()
        if not org:
            org = Organization(id=uuid.uuid4(), name="Nokshi Group", slug="nokshi-group")
            db.add(org)
            await db.flush()
            print("✅ Created Organization: Nokshi Group")
        else:
            print("ℹ️ Reusing existing Organization: Nokshi Group")

        # 2. Business Tenant
        biz_res = await db.execute(select(Business).where(Business.slug == "nokshi-co"))
        biz = biz_res.scalar_one_or_none()
        if not biz:
            biz = Business(
                id=uuid.uuid4(),
                org_id=org.id,
                name="Nokshi & Co.",
                name_bn="নকশী অ্যান্ড কোং",
                kind="Handloom, home & lifestyle · Dhaka",
                slug="nokshi-co",
                plan="karkhana",
                orders_used=1043,
                orders_quota=1500,
                logo_hue=82,
                currency="BDT",
                timezone="Asia/Dhaka",
            )
            db.add(biz)
            await db.flush()
            print("✅ Created Business: Nokshi & Co.")
        else:
            print("ℹ️ Reusing existing Business: Nokshi & Co.")

        # 3. Users / Superadmin & Team
        async def upsert_user(email: str, password_raw: str, first_name: str, last_name: str, role: str, is_superadmin: bool = False, biz_id = None):
            res = await db.execute(select(User).where(User.email == email.strip().lower()))
            existing = res.scalar_one_or_none()
            if existing:
                existing.hashed_password = hash_password(password_raw)
                existing.is_superadmin = is_superadmin
                existing.is_active = True
                existing.is_verified = True
                if biz_id and not existing.business_id:
                    existing.business_id = biz_id
                print(f"🔄 Updated user credentials: {email}")
            else:
                new_u = User(
                    id=uuid.uuid4(),
                    business_id=biz_id,
                    email=email.strip().lower(),
                    hashed_password=hash_password(password_raw),
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    is_active=True,
                    is_verified=True,
                    is_superadmin=is_superadmin,
                    platforms=["facebook", "instagram", "whatsapp"],
                    hue=82,
                )
                db.add(new_u)
                print(f"✅ Created user: {email}")

        # Super Admin
        await upsert_user("admin@arisesell.com", "MasterAdmin@2026!", "Super", "Admin", "superadmin", is_superadmin=True, biz_id=biz.id)
        # Merchants
        await upsert_user("farhana@nokshi.co", "DemoPass123!", "Farhana", "Rahman", "owner", is_superadmin=False, biz_id=biz.id)
        await upsert_user("merchant@nokshi.com.bd", "DemoPass123!", "Nokshi", "Merchant", "owner", is_superadmin=False, biz_id=biz.id)
        # Ops Staff
        await upsert_user("imran@nokshi.co", "DemoPass123!", "Imran", "Kabir", "admin", is_superadmin=False, biz_id=biz.id)

        # 4. Channels
        ch_wa = await db.execute(select(ConnectedChannel).where(ConnectedChannel.business_id == biz.id, ConnectedChannel.channel_type == "whatsapp"))
        if not ch_wa.scalar_one_or_none():
            db.add(ConnectedChannel(
                business_id=biz.id,
                channel_type="whatsapp",
                label="WhatsApp",
                detail="Cloud API · +880 1710-XXXX",
                is_live=True,
                traffic_share=46,
            ))
        ch_ms = await db.execute(select(ConnectedChannel).where(ConnectedChannel.business_id == biz.id, ConnectedChannel.channel_type == "messenger"))
        if not ch_ms.scalar_one_or_none():
            db.add(ConnectedChannel(
                business_id=biz.id,
                channel_type="messenger",
                label="Messenger",
                detail="3 pages connected",
                is_live=True,
                traffic_share=28,
            ))

        # 5. Products & Variants
        prod_res = await db.execute(select(Product).where(Product.business_id == biz.id, Product.name == "Jamdani Handloom Saree · Indigo"))
        p1 = prod_res.scalar_one_or_none()
        if not p1:
            p1 = Product(
                id=uuid.uuid4(),
                business_id=biz.id,
                name="Jamdani Handloom Saree · Indigo",
                name_bn="নীল জামদানি হাতে বোনা শাড়ি",
                category="Apparel",
                blurb="Authentic 84-count fine cotton woven in Rupganj.",
                price=6850.0,
                compare_at=7500.0,
                image_url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
                tags=["saree", "handloom", "eid", "indigo"],
                vision_indexed=True,
                sold_this_week=42,
            )
            db.add(p1)
            await db.flush()

            db.add(Variant(
                product_id=p1.id,
                sku="JD-IND",
                label="Indigo · Free Size",
                price=6850.0,
                stock=19,
            ))

        # 6. AIPersona & Guardrails
        pers_res = await db.execute(select(AIPersona).where(AIPersona.business_id == biz.id))
        if not pers_res.scalar_one_or_none():
            db.add(AIPersona(
                business_id=biz.id,
                voice="Warm, unhurried, uses আপনি. Bangla script by default; mirrors Banglish if the customer writes it.",
                signature="নকশী থেকে 🌾",
                reply_window="Answers within 4 seconds, batches messages sent inside 8 seconds.",
                emoji_budget="At most one emoji per message.",
            ))

        guard_res = await db.execute(select(Guardrail).where(Guardrail.business_id == biz.id, Guardrail.label == "Stock honesty"))
        if not guard_res.scalar_one_or_none():
            db.add(Guardrail(
                business_id=biz.id,
                rule="Never claim stock the catalog does not show",
                severity="hard",
                label="Stock honesty",
                fire_count=214,
                is_active=True,
            ))

        # 7. Admin AI Provider Keys
        ai_res = await db.execute(select(AIProviderKey).where(AIProviderKey.provider == "google"))
        if not ai_res.scalar_one_or_none():
            db.add(AIProviderKey(
                provider="google",
                provider_name="Google Gemini",
                model="gemini-2.0-flash",
                key_masked="AIzaSyD...9kX2",
                role="primary",
                status="active",
                latency_ms=380,
                requests_24h=24800,
                tokens_consumed=14200000,
                cost_usd=4.82,
                cost_bdt=580.0,
                last_ping="Just now (Operational)",
            ))

        # 8. Courier Gateways
        cg_res = await db.execute(select(CourierGateway).where(CourierGateway.code == "steadfast"))
        if not cg_res.scalar_one_or_none():
            db.add(CourierGateway(
                courier_name="Steadfast Courier Ltd",
                code="steadfast",
                api_key_masked="stdf_live_...98x",
                secret_masked="sec_...44k",
                status="active",
                default_coverage="Nationwide (Outside Dhaka + Sub-districts)",
                auto_routing_rule="Route all Outside Dhaka & Cash-On-Delivery to Steadfast",
                avg_latency_ms=410,
                total_bookings=21480,
                success_rate=98.8,
            ))

        await db.commit()
        print("✅ Database Seeding & Verification Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
