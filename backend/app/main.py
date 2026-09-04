"""NextProduct AI - Production FastAPI Multi-Tenant Backend Application."""
from __future__ import annotations

from contextlib import asynccontextmanager
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security_middleware import SecurityHeadersMiddleware

# Import API Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.threads import router as threads_router
from app.api.v1.orders import router as orders_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.comments import router as comments_router
from app.api.v1.pipeline import router as pipeline_router
from app.api.v1.campaigns import router as campaigns_router
from app.api.v1.automations import router as automations_router
from app.api.v1.brain import router as brain_router
from app.api.v1.ai_playground import router as playground_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.merchants import router as merchants_router
from app.api.v1.billing import router as billing_router
from app.api.v1.analytics import router as analytics_router

# Import Admin Routers
from app.api.v1.admin.auth import router as admin_auth_router
from app.api.v1.admin.dashboard import router as admin_dashboard_router
from app.api.v1.admin.subscriptions import router as admin_subscriptions_router
from app.api.v1.admin.fraud import router as admin_fraud_router
from app.api.v1.admin.merchants import router as admin_merchants_router
from app.api.v1.admin.plans import router as admin_plans_router
from app.api.v1.admin.ai_gateway import router as admin_ai_gateway_router
from app.api.v1.admin.couriers import router as admin_couriers_router
from app.api.v1.admin.meta_apps import router as admin_meta_apps_router
from app.api.v1.admin.support import router as admin_support_router
from app.api.v1.admin.system import router as admin_system_router
from app.api.v1.admin.backups import router as admin_backups_router
from app.api.v1.admin.settings import router as admin_settings_router

# Import Webhook Routers
from app.api.webhooks.meta import router as meta_webhook_router
from app.api.webhooks.whatsapp import router as whatsapp_webhook_router
from app.api.webhooks.couriers import router as courier_webhook_router
from app.api.webhooks.payments import router as payment_webhook_router


from sqlalchemy import text
from app.core.database import async_session_factory


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    print("🚀 NextProduct AI FastAPI Backend Starting...")
    try:
        async with async_session_factory() as session:
            await session.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS settings_data JSON DEFAULT '{}'::json;"))
            await session.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;"))
            await session.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMP WITH TIME ZONE;"))
            await session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local';"))
            await session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE;"))
            await session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;"))
            await session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMP WITH TIME ZONE;"))
            await session.execute(text("ALTER TABLE connected_channels ADD COLUMN IF NOT EXISTS access_token TEXT;"))
            await session.execute(text("ALTER TABLE connected_channels ALTER COLUMN config DROP NOT NULL;"))
            await session.execute(text("ALTER TABLE users ALTER COLUMN business_id DROP NOT NULL;"))
            await session.commit()
            print("✅ Auto-migration: businesses, channels & users store-isolation columns ensured.")
    except Exception as e:
        print(f"⚠️ Auto-migration note: {e}")
    yield
    print("🛑 NextProduct AI FastAPI Backend Stopping...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production Multi-Tenant API for Omnichannel Conversational Commerce & Bangladeshi Logistics Automation",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OWASP Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# Mount Tenant API Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(threads_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(catalog_router, prefix="/api/v1")
app.include_router(comments_router, prefix="/api/v1")
app.include_router(pipeline_router, prefix="/api/v1")
app.include_router(campaigns_router, prefix="/api/v1")
app.include_router(automations_router, prefix="/api/v1")
app.include_router(brain_router, prefix="/api/v1")
app.include_router(playground_router, prefix="/api/v1")
app.include_router(integrations_router, prefix="/api/v1")
app.include_router(merchants_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")


@app.get("/api/v1/plans", tags=["Subscription Plans"])
async def list_public_plans():
    """Public endpoint to fetch commercial plans for homepage and pricing preview.
    Returns the plans admin chose to show on homepage (max 4)."""
    from app.services.plans_service import get_stored_plans
    plans = await get_stored_plans()
    home_plans = [p for p in plans if p.get("showOnHome") is True]
    if not home_plans:
        home_plans = [p for p in plans if p.get("status") == "active"]
    return home_plans[:4]


# Mount Super Admin Routers
app.include_router(admin_auth_router, prefix="/api/v1")
app.include_router(admin_dashboard_router, prefix="/api/v1")
app.include_router(admin_subscriptions_router, prefix="/api/v1")
app.include_router(admin_fraud_router, prefix="/api/v1")
app.include_router(admin_merchants_router, prefix="/api/v1")
app.include_router(admin_plans_router, prefix="/api/v1")
app.include_router(admin_ai_gateway_router, prefix="/api/v1")
app.include_router(admin_couriers_router, prefix="/api/v1")
app.include_router(admin_meta_apps_router, prefix="/api/v1")
app.include_router(admin_support_router, prefix="/api/v1")
app.include_router(admin_system_router, prefix="/api/v1")
app.include_router(admin_backups_router, prefix="/api/v1")
app.include_router(admin_settings_router, prefix="/api/v1")

# Mount Webhooks
app.include_router(meta_webhook_router, prefix="/api/v1")
app.include_router(whatsapp_webhook_router, prefix="/api/v1")
app.include_router(courier_webhook_router, prefix="/api/v1")
app.include_router(payment_webhook_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root_index():
    """Root endpoint showing service status and API docs link."""
    return {
        "service": settings.APP_NAME,
        "status": "online 🚀",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check for load balancers and container orchestrators."""
    return {"status": "ok", "version": "1.0.0", "service": settings.APP_NAME}

