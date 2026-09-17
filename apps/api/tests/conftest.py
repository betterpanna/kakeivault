"""
Test fixtures for KakeiVault API.

Uses an in-memory SQLite database for speed.
Ownership and authorization tests run against real async routes.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Set required environment variables BEFORE any app imports.
# In CI these are injected via the workflow env block; locally they fall back
# to safe dummy values so the tests can run without a real .env file.
# ---------------------------------------------------------------------------
import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-secret-key-for-local-dev-only-do-not-use-in-production-xxxxxxxx",
)
os.environ.setdefault("STORAGE_ENDPOINT_URL", "http://localhost:9000")
os.environ.setdefault("STORAGE_ACCESS_KEY_ID", "minioadmin")
os.environ.setdefault("STORAGE_SECRET_ACCESS_KEY", "minioadmin")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("COOKIE_SECURE", "false")

import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="session")
async def engine():
    _engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield _engine
    await _engine.dispose()


@pytest_asyncio.fixture
async def db(engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
    app.dependency_overrides.clear()
