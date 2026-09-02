"""Async Redis Client and Caching Helpers."""
from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Any

from redis.asyncio import Redis, from_url

from app.core.config import settings

_redis_pool: Redis | None = None


async def get_redis_client() -> Redis:
    """Returns the singleton Redis client connection pool."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,
        )
    return _redis_pool


async def get_redis() -> AsyncGenerator[Redis, None]:
    """Dependency for injecting Redis client in route handlers."""
    client = await get_redis_client()
    try:
        yield client
    finally:
        pass


async def cache_get(key: str) -> Any | None:
    """Retrieve and deserialize a JSON cached item from Redis."""
    client = await get_redis_client()
    val = await client.get(key)
    if val:
        try:
            return json.loads(val)
        except json.JSONDecodeError:
            return val
    return None


async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Serialize and store an item in Redis with a TTL."""
    client = await get_redis_client()
    serialized = json.dumps(value) if not isinstance(value, str) else value
    await client.set(key, serialized, ex=ttl_seconds)


async def cache_delete(key: str) -> None:
    """Delete an item from Redis."""
    client = await get_redis_client()
    await client.delete(key)
