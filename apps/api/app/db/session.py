"""Async SQLAlchemy session factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# pool_size / max_overflow are PostgreSQL-specific; SQLite (used in tests) does not
# accept them.  Build kwargs conditionally so both dialects work.
_engine_kwargs: dict = {
    "echo": settings.debug,
    "pool_pre_ping": True,
}
if not settings.database_url.startswith("sqlite"):
    _engine_kwargs["pool_size"] = 10
    _engine_kwargs["max_overflow"] = 20

engine = create_async_engine(settings.database_url, **_engine_kwargs)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
