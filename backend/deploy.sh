#!/bin/bash
set -e

echo "🚀 Starting NextProduct AI Production Deployment..."

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

echo "✅ NextProduct AI Production Deployment Completed Successfully!"
echo "🌐 API Gateway: http://localhost:8000"
echo "🌐 Console App: http://localhost:3000"
echo "📚 API Docs:    http://localhost:8000/docs"
