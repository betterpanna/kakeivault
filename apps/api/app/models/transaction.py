"""Transaction and TransactionItem models."""

from __future__ import annotations

import uuid

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

TRANSACTION_TYPES = ("income", "expense")
PAYMENT_METHODS = (
    "cash",
    "credit_card",
    "debit_card",
    "electronic_money",
    "bank_transfer",
    "qr_code",
    "other",
)
EXPENSE_CATEGORIES = (
    "food",
    "daily_necessities",
    "transportation",
    "rent",
    "utilities",
    "medical",
    "education",
    "entertainment",
    "shopping",
    "insurance",
    "tax",
    "other",
)


class Transaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount_minor_units >= 0", name="chk_transaction_amount_nonneg"),
        Index("ix_transactions_user_date", "user_id", "date"),
        Index("ix_transactions_user_category", "user_id", "category"),
        Index("ix_transactions_user_type", "user_id", "type"),
        Index(
            "ix_transactions_idempotency",
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
    )
    type: Mapped[str] = mapped_column(
        Enum(*TRANSACTION_TYPES, name="transaction_type"), nullable=False
    )
    # Stored as integer minor units (JPY × 100)
    amount_minor_units: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="JPY", nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    merchant_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str | None] = mapped_column(
        Enum(*EXPENSE_CATEGORIES, name="expense_category"), nullable=True
    )
    payment_method: Mapped[str | None] = mapped_column(
        Enum(*PAYMENT_METHODS, name="payment_method"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ocr_jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    idempotency_key: Mapped[str | None] = mapped_column(String(128), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="transactions")  # type: ignore[name-defined]  # noqa: F821
    items: Mapped[list[TransactionItem]] = relationship(
        "TransactionItem", back_populates="transaction", cascade="all, delete-orphan"
    )
    ocr_job: Mapped[OcrJob | None] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "OcrJob", foreign_keys=[ocr_job_id]
    )

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} type={self.type} amount={self.amount_minor_units}>"


class TransactionItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transaction_items"
    __table_args__ = (
        CheckConstraint(
            "amount_minor_units >= 0", name="chk_transaction_item_amount_nonneg"
        ),
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, default=1)
    unit_price_minor_units: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    amount_minor_units: Mapped[int] = mapped_column(BigInteger, nullable=False)

    transaction: Mapped[Transaction] = relationship("Transaction", back_populates="items")
