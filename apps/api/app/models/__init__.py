"""
SQLAlchemy model registry.
Import all models here so Alembic autogenerate discovers them.
"""

from app.models.audit import AuditEvent
from app.models.budget import Budget
from app.models.document import Document
from app.models.ocr import OcrJob, OcrResult
from app.models.salary import SalarySlip
from app.models.subscription import Subscription
from app.models.transaction import Transaction, TransactionItem
from app.models.user import User, UserPreference

__all__ = [
    "AuditEvent",
    "Budget",
    "Document",
    "OcrJob",
    "OcrResult",
    "SalarySlip",
    "Subscription",
    "Transaction",
    "TransactionItem",
    "User",
    "UserPreference",
]
