"""V1 API router — aggregates all endpoint modules."""

from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)

# Phase 1+ routers — added as they are implemented
# from app.api.v1.endpoints.transactions import router as transactions_router
# from app.api.v1.endpoints.documents import router as documents_router
# from app.api.v1.endpoints.uploads import router as uploads_router
# from app.api.v1.endpoints.ocr import router as ocr_router
# from app.api.v1.endpoints.budgets import router as budgets_router
# from app.api.v1.endpoints.dashboard import router as dashboard_router
# from app.api.v1.endpoints.exports import router as exports_router
# from app.api.v1.endpoints.account import router as account_router
# api_router.include_router(transactions_router)
# api_router.include_router(documents_router)
# api_router.include_router(uploads_router)
# api_router.include_router(ocr_router)
# api_router.include_router(budgets_router)
# api_router.include_router(dashboard_router)
# api_router.include_router(exports_router)
# api_router.include_router(account_router)
