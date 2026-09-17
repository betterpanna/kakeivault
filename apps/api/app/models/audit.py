"""AuditEvent model for privacy-sensitive operations."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, JSON, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

AUDIT_EVENT_TYPES = (
    "user_registered",
    "user_login",
    "user_logout",
    "user_email_verified",
    "user_password_reset",
    "user_account_deleted",
    "user_data_exported",
    "document_uploaded",
    "document_downloaded",
    "document_deleted",
    "ocr_job_created",
    "ocr_job_confirmed",
    "salary_slip_confirmed",
    "transaction_deleted",
)


class AuditEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Append-only audit log for security-relevant operations.

    Privacy rules:
    - Never include salary amounts or document contents in event_data.
    - Never include passwords or tokens.
    - IP address is stored for fraud detection; subject to retention policy.
    """

    __tablename__ = "audit_events"
    __table_args__ = (
        Index("ix_audit_events_user_type", "user_id", "event_type"),
        Index("ix_audit_events_created_at", "created_at"),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Structured metadata — must NOT contain sensitive financial values
    # JSON().with_variant(JSONB(), "postgresql") uses JSONB on PostgreSQL for
    # efficient GIN indexing and falls back to generic JSON on SQLite (tests).
    event_data: Mapped[dict | None] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"),
        nullable=True,
    )

    user: Mapped[User | None] = relationship("User", back_populates="audit_events")  # type: ignore[name-defined]  # noqa: F821
