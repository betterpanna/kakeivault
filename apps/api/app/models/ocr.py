"""OCR job and result models.

Architecture decision: we store three separate records:
1. ocr_jobs: the job lifecycle and status
2. ocr_results: immutable raw OCR provider output
3. Transaction (via transaction.ocr_job_id): the user-confirmed final record

The user review (corrections) is stored in ocr_jobs.user_review_data as JSONB.
This prevents overwriting corrected data with a later OCR response.
"""

from __future__ import annotations

import uuid

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

OCR_STATUSES = (
    "uploaded",
    "queued",
    "processing",
    "review_required",
    "confirmed",
    "failed",
    "deleted",
)
DOCUMENT_TYPES = ("receipt", "salary_slip")


class OcrJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ocr_jobs"
    __table_args__ = (
        Index("ix_ocr_jobs_user_status", "user_id", "status"),
        Index(
            "ix_ocr_jobs_idempotency",
            "user_id",
            "idempotency_key",
            unique=True,
            postgresql_where="idempotency_key IS NOT NULL",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        Enum(*OCR_STATUSES, name="ocr_status"), nullable=False, default="uploaded"
    )
    document_type: Mapped[str] = mapped_column(
        Enum(*DOCUMENT_TYPES, name="ocr_document_type"), nullable=False
    )
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Immutable raw OCR output (set once by worker, never overwritten)
    extracted_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # User corrections (set by PATCH /review, never overwritten by OCR)
    user_review_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user: Mapped[User] = relationship("User", back_populates="ocr_jobs")  # type: ignore[name-defined]  # noqa: F821
    result: Mapped[OcrResult | None] = relationship(
        "OcrResult", back_populates="job", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<OcrJob id={self.id} status={self.status!r}>"


class OcrResult(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Immutable raw OCR provider response. Written once, never updated."""

    __tablename__ = "ocr_results"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ocr_jobs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    raw_text: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # NOT logged, privacy-sensitive
    confidence_overall: Mapped[float | None] = mapped_column(nullable=True)
    provider_response: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True
    )  # full provider JSON, NOT logged

    job: Mapped[OcrJob] = relationship("OcrJob", back_populates="result")
