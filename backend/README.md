# AriseSell - Production Backend Architecture

Autonomous conversational commerce & fulfillment automation platform designed for modern Bangladeshi lifestyle & retail brands.

## Tech Stack
- **Web Framework:** FastAPI (Python 3.11+, Async SQLAlchemy 2.0, Pydantic v2)
- **Database:** PostgreSQL 16 with `pgvector` extension for semantic RAG embeddings
- **Task Queue & Broker:** Celery 5.4 + Redis 7 with dedicated queues (`webhooks`, `ai_inference`, `campaigns`, `maintenance`, `notifications`)
- **AI Gateway:** Multi-Provider cascading LLM pipeline (Google Gemini 2.0 Flash, OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet, DeepSeek)
- **Local Ecosystem:**
  - **Couriers:** Steadfast Courier API + Pathao Hermes Express API with 64-district auto-routing
  - **Payments:** bKash Tokenized Merchant API + SSLCommerz Corporate Gateway with Order Validation API
  - **Meta Integration:** WhatsApp Business Cloud API & Facebook Messenger Graph API v21.0 with HMAC-SHA256 signature verification and Meta Conversions API (CAPI)

## Quick Start (Local Development)

### 1. Start Docker Stack
```bash
cd backend
docker-compose up -d postgres redis
```

### 2. Install Dependencies & Run Database Migrations
```bash
pip install -r requirements.txt
alembic upgrade head
python seed.py
```

### 3. Launch Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Launch Celery Worker & Beat
```bash
celery -A app.workers.celery_app.celery_app worker -l INFO -Q default,webhooks,ai_inference,campaigns,maintenance,notifications
celery -A app.workers.celery_app.celery_app beat -l INFO
```

## Running Test Suites
```bash
pytest tests/ -v
```
