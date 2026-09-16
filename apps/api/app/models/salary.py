"""SalarySlip model. Salary data is privacy-sensitive; never logged."""

from __future__ import annotations

import uuid

from sqlalchemy import BigInteger, Boolean, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SalarySlip(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "salary_slips"
    __table_args__ = (Index("ix_salary_slips_user_month", "user_id", "payment_month"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )
    ocr_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ocr_jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    payment_month: Mapped[str] = mapped_column(String(7), nullable=False)  # YYYY-MM
    payment_date: Mapped[str | None] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    employer_name: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # All amounts are integer minor units. NOT logged anywhere.
    basic_salary_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    overtime_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    allowances_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    gross_salary_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    income_tax_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    resident_tax_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    pension_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    health_insurance_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    employment_insurance_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    other_deductions_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    total_deductions_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    net_salary_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="salary_slips")  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        # NOTE: Do not include any amount values in repr to prevent log leakage
        return f"<SalarySlip id={self.id} month={self.payment_month!r} confirmed={self.confirmed}>"
