"""Budget model."""

from __future__ import annotations

import uuid

from sqlalchemy import BigInteger, ForeignKey, Index, JSON, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Budget(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "month", name="uq_budgets_user_month"),
        Index("ix_budgets_user_month", "user_id", "month"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    month: Mapped[str] = mapped_column(String(7), nullable=False)  # YYYY-MM
    overall_minor_units: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    # category → minor units  {"food": 50000, ...}
    category_budgets: Mapped[dict] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"),
        nullable=False,
        default=dict,
    )

    user: Mapped[User] = relationship("User", back_populates="budgets")  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<Budget id={self.id} month={self.month!r}>"
