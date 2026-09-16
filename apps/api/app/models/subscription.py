"""Subscription model — entitlement abstraction for future billing."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

SUBSCRIPTION_PLANS = ("free", "premium", "family")
SUBSCRIPTION_PLATFORMS = ("web", "ios", "android", "manual")


class Subscription(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Entitlement record.

    Design notes:
    - iOS: future StoreKit purchase verified server-side via App Store Server API
    - Android: future Google Play Billing purchase verified via Google Play Developer API
    - Web: future web billing (Stripe or otherwise) handled separately
    - Never use Stripe inside mobile apps to unlock digital features (violates platform policies)
    """

    __tablename__ = "subscriptions"
    __table_args__ = (Index("ix_subscriptions_user", "user_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    plan: Mapped[str] = mapped_column(
        Enum(*SUBSCRIPTION_PLANS, name="subscription_plan"),
        nullable=False,
        default="free",
    )
    platform: Mapped[str] = mapped_column(
        Enum(*SUBSCRIPTION_PLATFORMS, name="subscription_platform"),
        nullable=False,
        default="manual",
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Platform-specific transaction/receipt identifiers (opaque strings)
    platform_subscription_id: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="subscriptions")  # type: ignore[name-defined]  # noqa: F821
