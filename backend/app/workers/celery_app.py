"""Celery Task Queue Configuration with Redis Broker."""
from __future__ import annotations

import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "nextproduct_workers",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.workers.tasks_webhook",
        "app.workers.tasks_ai",
        "app.workers.tasks_campaigns",
        "app.workers.tasks_maintenance",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Dhaka",
    enable_utc=True,
    task_routes={
        "app.workers.tasks_webhook.*": {"queue": "webhooks"},
        "app.workers.tasks_ai.*": {"queue": "ai_inference"},
        "app.workers.tasks_campaigns.*": {"queue": "campaigns"},
        "app.workers.tasks_maintenance.*": {"queue": "maintenance"},
    },
)
