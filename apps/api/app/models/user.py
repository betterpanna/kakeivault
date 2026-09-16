"""User and UserPreference models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(254), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Verification / reset tokens (not logged, short-lived)
    email_verification_token: Mapped[str | None] = mapped_column(String(128), nullable=True)
    email_verification_expires: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    password_reset_token: Mapped[str | None] = mapped_column(String(128), nullable=True)
    password_reset_expires: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    preference: Mapped[UserPreference | None] = relationship(
        "UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    transactions: Mapped[list[Transaction]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    documents: Mapped[list[Document]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Document", back_populates="user", cascade="all, delete-orphan"
    )
    ocr_jobs: Mapped[list[OcrJob]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "OcrJob", back_populates="user", cascade="all, delete-orphan"
    )
    budgets: Mapped[list[Budget]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Budget", back_populates="user", cascade="all, delete-orphan"
    )
    salary_slips: Mapped[list[SalarySlip]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "SalarySlip", back_populates="user", cascade="all, delete-orphan"
    )
    subscriptions: Mapped[list[Subscription]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Subscription", back_populates="user", cascade="all, delete-orphan"
    )
    audit_events: Mapped[list[AuditEvent]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "AuditEvent", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"


class UserPreference(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_preferences"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_preferences_user_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locale: Mapped[str] = mapped_column(String(10), default="ja-JP", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Tokyo", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="JPY", nullable=False)
    biometric_lock_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="preference")
