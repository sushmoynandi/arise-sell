const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const testsDir = path.join(backendDir, 'tests');
fs.mkdirSync(testsDir, { recursive: true });

// 1. tests/conftest.py
const conftestPy = `"""Pytest Test Configuration & Shared Fixtures."""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    session_maker = async_sessionmaker(db_engine, expire_on_commit=False)
    async with session_maker() as session:
        yield session

@pytest.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
`;
fs.writeFileSync(path.join(testsDir, 'conftest.py'), conftestPy, 'utf8');

// 2. tests/test_auth.py
const testAuthPy = `"""Auth Flow Tests: Register, Login, Refresh, Me."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testmerchant@nokshi.co",
            "password": "Password123!",
            "password2": "Password123!",
            "first_name": "Test",
            "last_name": "Merchant",
            "business_name": "Nokshi Test Store",
        },
    )
    assert reg_res.status_code in [200, 201]
    tokens = reg_res.json()
    assert "access" in tokens
    assert "refresh" in tokens

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "testmerchant@nokshi.co", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    access_token = login_res.json()["access"]

    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testmerchant@nokshi.co"
`;
fs.writeFileSync(path.join(testsDir, 'test_auth.py'), testAuthPy, 'utf8');

// 3. tests/test_ai.py
const testAiPy = `"""AI Reasoning, Handoff & Playground Tests."""
import pytest
from app.services.handoff_detector import evaluate_handoff_triggers
from app.services.ai_engine import classify_intent, detect_dialect
from app.services.delivery_calculator import resolve_district_and_courier


def test_ai_intent_and_dialect():
    assert detect_dialect("জামদানি শাড়ির দাম কত?") == "bn"
    assert detect_dialect("Apnader Jamdani saree ache? dam koto?") == "banglish"
    assert detect_dialect("Hello what is the price of this item?") == "en"

    assert classify_intent("দাম কত?") == "Price Inquiry"
    assert classify_intent("চট্টগ্রামে কি ডেলিভারি দেওয়া যাবে?") == "Delivery & Shipping Inquiry"
    assert classify_intent("আমার ঠিকানা: গুলশান ২, ফোন: 01711223344") == "Order Confirmation & KYC"
    assert classify_intent("সাইজ কি কি আছে?") == "Variant & Stock Inquiry"


def test_handoff_triggers():
    h1 = evaluate_handoff_triggers("মানুষের সাথে কথা বলতে চাই")
    assert h1 is not None
    assert h1["trigger"] == "explicit_request"

    h2 = evaluate_handoff_triggers("আপনার সার্ভিস খুব ফালতু, প্রতারক!")
    assert h2 is not None
    assert h2["trigger"] == "angry_sentiment"

    h3 = evaluate_handoff_triggers("আমাকে পাইকারি ৫০ পিস দিতে পারবেন?", order_quantity=50, order_value_bdt=45000.0)
    assert h3 is not None
    assert h3["trigger"] == "bulk_order"


def test_delivery_calculator():
    dhaka = resolve_district_and_courier("House 12, Road 5, Gulshan 2, Dhaka")
    assert dhaka["zone"] == "inside_dhaka"
    assert dhaka["recommended_courier"] == "pathao"
    assert dhaka["delivery_charge"] == 80.0

    savar = resolve_district_and_courier("Savar Bazar, Gazipur Road")
    assert savar["zone"] == "sub_dhaka"
    assert savar["recommended_courier"] == "steadfast"
    assert savar["delivery_charge"] == 100.0

    sylhet = resolve_district_and_courier("Zindabazar, Sylhet Sadar", district="Sylhet")
    assert sylhet["zone"] == "outside_dhaka"
    assert sylhet["recommended_courier"] == "steadfast"
    assert sylhet["delivery_charge"] == 130.0
`;
fs.writeFileSync(path.join(testsDir, 'test_ai.py'), testAiPy, 'utf8');

// 4. tests/test_admin.py
const testAdminPy = `"""Super Admin 2FA Authentication & Console Endpoints Test."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_2fa_and_dashboard(client: AsyncClient):
    res = await client.post(
        "/api/v1/admin/auth/login",
        json={"email": "admin@arisesell.com", "password": "MasterAdmin@2026"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["requires_2fa"] is True

    verify_res = await client.post(
        "/api/v1/admin/auth/verify-2fa",
        json={"email": "admin@arisesell.com", "totp_code": "123456"},
    )
    assert verify_res.status_code == 200
    admin_tokens = verify_res.json()
    assert "access" in admin_tokens
    access_token = admin_tokens["access"]

    headers = {"Authorization": f"Bearer {access_token}"}
    dash_res = await client.get("/api/v1/admin/dashboard", headers=headers)
    assert dash_res.status_code == 200
    kpis = dash_res.json()
    assert "platformGmvBDT" in kpis
    assert "mrrBDT" in kpis
`;
fs.writeFileSync(path.join(testsDir, 'test_admin.py'), testAdminPy, 'utf8');

// 5. docker-compose.prod.yml
const composeProdYml = `version: "3.9"

services:
  nginx:
    image: nginx:1.25-alpine
    container_name: arisesell-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web
      - frontend

  postgres:
    image: pgvector/pgvector:pg16
    container_name: arisesell-postgres
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres_secure_pass_2026}
      POSTGRES_DB: \${POSTGRES_DB:-arisesell_db}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: arisesell-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-redis_secure_pass_2026}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "\${REDIS_PASSWORD:-redis_secure_pass_2026}", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: arisesell-backend
    restart: always
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql+asyncpg://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres_secure_pass_2026}@postgres:5432/\${POSTGRES_DB:-arisesell_db}
      - REDIS_URL=redis://:\${REDIS_PASSWORD:-redis_secure_pass_2026}@redis:6379/0
      - JWT_SECRET_KEY=\${JWT_SECRET_KEY:-np_prod_super_secret_jwt_key_2026}
      - META_APP_ID=\${META_APP_ID}
      - META_APP_SECRET=\${META_APP_SECRET}
      - STEADFAST_API_KEY=\${STEADFAST_API_KEY}
      - PATHAO_CLIENT_ID=\${PATHAO_CLIENT_ID}
      - BKASH_APP_KEY=\${BKASH_APP_KEY}
      - SSLCOMMERZ_STORE_ID=\${SSLCOMMERZ_STORE_ID}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

  celery_worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: arisesell-celery-worker
    restart: always
    environment:
      - DATABASE_URL=postgresql+asyncpg://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres_secure_pass_2026}@postgres:5432/\${POSTGRES_DB:-arisesell_db}
      - REDIS_URL=redis://:\${REDIS_PASSWORD:-redis_secure_pass_2026}@redis:6379/0
      - CELERY_BROKER_URL=redis://:\${REDIS_PASSWORD:-redis_secure_pass_2026}@redis:6379/0
      - CELERY_RESULT_BACKEND=redis://:\${REDIS_PASSWORD:-redis_secure_pass_2026}@redis:6379/0
    depends_on:
      - postgres
      - redis
    command: celery -A app.workers.celery_app.celery_app worker -l INFO -c 8 -Q default,webhooks,ai_inference,campaigns,maintenance,notifications

  celery_beat:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: arisesell-celery-beat
    restart: always
    environment:
      - DATABASE_URL=postgresql+asyncpg://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres_secure_pass_2026}@postgres:5432/\${POSTGRES_DB:-arisesell_db}
      - REDIS_URL=redis://:\${REDIS_PASSWORD:-redis_secure_pass_2026}@redis:6379/0
    depends_on:
      - redis
    command: celery -A app.workers.celery_app.celery_app beat -l INFO

  frontend:
    build:
      context: ..
      dockerfile: Dockerfile.frontend
    container_name: arisesell-frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://web:8000/api/v1
    depends_on:
      - web

volumes:
  pgdata:
  redisdata:
`;
fs.writeFileSync(path.join(backendDir, 'docker-compose.prod.yml'), composeProdYml, 'utf8');

// 6. nginx.conf
const nginxConf = `worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;
    sendfile on;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

    upstream backend_cluster {
        server web:8000;
    }

    upstream frontend_cluster {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://frontend_cluster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            limit_req zone=api_limit burst=50 nodelay;
            proxy_pass http://backend_cluster;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/v1/auth/ {
            limit_req zone=auth_limit burst=10 nodelay;
            proxy_pass http://backend_cluster;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/ws/ {
            proxy_pass http://backend_cluster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'nginx.conf'), nginxConf, 'utf8');

// 7. deploy.sh
const deploySh = `#!/bin/bash
set -e

echo "🚀 Starting AriseSell Production Deployment..."

if [ ! -f .env ]; then
    echo "⚠️ .env file missing! Copying from .env.example..."
    cp .env.example .env
fi

echo "📦 Building optimized production containers..."
docker compose -f docker-compose.prod.yml build --parallel

echo "🗄️ Starting PostgreSQL (pgvector) and Redis..."
docker compose -f docker-compose.prod.yml up -d postgres redis

echo "🔄 Executing Alembic database schema migrations..."
docker compose -f docker-compose.prod.yml run --rm web alembic upgrade head

echo "🌱 Checking database fixtures..."
docker compose -f docker-compose.prod.yml run --rm web python seed.py

echo "⚡ Upgrading Web API, Celery Workers, and Nginx..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "✅ AriseSell Production Deployment Completed Successfully!"
echo "🌐 API Gateway: http://localhost:8000"
echo "🌐 Console App: http://localhost:3000"
echo "📚 API Docs:    http://localhost:8000/docs"
`;
fs.writeFileSync(path.join(backendDir, 'deploy.sh'), deploySh, 'utf8');

// 8. backend/README.md
const readmeMd = `# AriseSell - Production Backend Architecture

Autonomous conversational commerce & fulfillment automation platform designed for modern Bangladeshi lifestyle & retail brands.

## Tech Stack
- **Web Framework:** FastAPI (Python 3.11+, Async SQLAlchemy 2.0, Pydantic v2)
- **Database:** PostgreSQL 16 with \`pgvector\` extension for semantic RAG embeddings
- **Task Queue & Broker:** Celery 5.4 + Redis 7 with dedicated queues (\`webhooks\`, \`ai_inference\`, \`campaigns\`, \`maintenance\`, \`notifications\`)
- **AI Gateway:** Multi-Provider cascading LLM pipeline (Google Gemini 2.0 Flash, OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet, DeepSeek)
- **Local Ecosystem:**
  - **Couriers:** Steadfast Courier API + Pathao Hermes Express API with 64-district auto-routing
  - **Payments:** bKash Tokenized Merchant API + SSLCommerz Corporate Gateway with Order Validation API
  - **Meta Integration:** WhatsApp Business Cloud API & Facebook Messenger Graph API v21.0 with HMAC-SHA256 signature verification and Meta Conversions API (CAPI)

## Quick Start (Local Development)

### 1. Start Docker Stack
\`\`\`bash
cd backend
docker-compose up -d postgres redis
\`\`\`

### 2. Install Dependencies & Run Database Migrations
\`\`\`bash
pip install -r requirements.txt
alembic upgrade head
python seed.py
\`\`\`

### 3. Launch Development Server
\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

### 4. Launch Celery Worker & Beat
\`\`\`bash
celery -A app.workers.celery_app.celery_app worker -l INFO -Q default,webhooks,ai_inference,campaigns,maintenance,notifications
celery -A app.workers.celery_app.celery_app beat -l INFO
\`\`\`

## Running Test Suites
\`\`\`bash
pytest tests/ -v
\`\`\`
`;
fs.writeFileSync(path.join(backendDir, 'README.md'), readmeMd, 'utf8');

console.log('✅ Phase 7 Testing, Hardening & Deployment Manifest Built Successfully!');
