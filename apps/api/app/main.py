"""
KakeiVault FastAPI application entry point.

Security measures applied at application level:
- CORS: only trusted origins
- Rate limiting: per-IP via slowapi
- No secrets in error responses
- Request ID for tracing (never logs user data)
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter (Redis-backed for production)
limiter = Limiter(key_func=get_remote_address, storage_uri=settings.redis_url)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/api/docs" if settings.debug else None,
        redoc_url="/api/redoc" if settings.debug else None,
        openapi_url="/api/openapi.json" if settings.debug else None,
    )

    # ------------------------------------------------------------------
    # Middleware
    # ------------------------------------------------------------------
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(o) for o in settings.cors_origins],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Idempotency-Key"],
    )

    @app.middleware("http")
    async def add_request_id(request: Request, call_next: Any) -> Any:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------
    app.include_router(api_router)

    @app.get("/healthz", include_in_schema=False)
    async def health() -> dict:
        return {"status": "ok", "version": settings.app_version}

    # ------------------------------------------------------------------
    # Exception handlers — never leak internal details in production
    # ------------------------------------------------------------------
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
