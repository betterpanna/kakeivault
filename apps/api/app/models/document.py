"""Document model for the personal document vault."""

from __future__ import annotations

import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

DOCUMENT_CATEGORIES = (
    "salary_slip",
    "tax",
    "insurance",
    "employment",
    "utility",
    "invoice",
    "warranty",
    "other",
)


class Document(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "documents"
    __table_args__ = (
        Index("ix_documents_user_category", "user_id", "category"),
        Index("ix_documents_user_date", "user_id", "document_date"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum(*DOCUMENT_CATEGORIES, name="document_category"), nullable=False
    )
    document_date: Mapped[str | None] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(100)), default=list, nullable=False)

    # Storage
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    # Optional extracted text (from OCR, redacted from logs)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_extracted_text: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # User-controlled retention (NULL = keep forever)
    retention_days: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Soft delete
    deleted_at: Mapped[str | None] = mapped_column(String(30), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="documents")  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<Document id={self.id} title={self.title!r}>"
