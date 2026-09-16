"""Initial schema — all core tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-16

"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # Enum types
    # ------------------------------------------------------------------
    op.execute(
        "CREATE TYPE transaction_type AS ENUM ('income', 'expense')"
    )
    op.execute(
        "CREATE TYPE expense_category AS ENUM ("
        "'food','daily_necessities','transportation','rent','utilities',"
        "'medical','education','entertainment','shopping','insurance','tax','other')"
    )
    op.execute(
        "CREATE TYPE payment_method AS ENUM ("
        "'cash','credit_card','debit_card','electronic_money',"
        "'bank_transfer','qr_code','other')"
    )
    op.execute(
        "CREATE TYPE document_category AS ENUM ("
        "'salary_slip','tax','insurance','employment','utility',"
        "'invoice','warranty','other')"
    )
    op.execute(
        "CREATE TYPE ocr_status AS ENUM ("
        "'uploaded','queued','processing','review_required',"
        "'confirmed','failed','deleted')"
    )
    op.execute(
        "CREATE TYPE ocr_document_type AS ENUM ('receipt','salary_slip')"
    )
    op.execute(
        "CREATE TYPE subscription_plan AS ENUM ('free','premium','family')"
    )
    op.execute(
        "CREATE TYPE subscription_platform AS ENUM ('web','ios','android','manual')"
    )

    # ------------------------------------------------------------------
    # users
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("email_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("email_verification_token", sa.String(128), nullable=True),
        sa.Column("email_verification_expires", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_reset_token", sa.String(128), nullable=True),
        sa.Column("password_reset_expires", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ------------------------------------------------------------------
    # user_preferences
    # ------------------------------------------------------------------
    op.create_table(
        "user_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("locale", sa.String(10), nullable=False, server_default="ja-JP"),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="Asia/Tokyo"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="JPY"),
        sa.Column(
            "biometric_lock_enabled",
            sa.Boolean,
            nullable=False,
            server_default="false",
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("user_id", name="uq_user_preferences_user_id"),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])

    # ------------------------------------------------------------------
    # documents
    # ------------------------------------------------------------------
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column(
            "category",
            postgresql.ENUM(
                "salary_slip",
                "tax",
                "insurance",
                "employment",
                "utility",
                "invoice",
                "warranty",
                "other",
                name="document_category",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("document_date", sa.String(10), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String(100)), nullable=False, server_default="{}"),
        sa.Column("storage_key", sa.String(1000), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger, nullable=False),
        sa.Column("extracted_text", sa.Text, nullable=True),
        sa.Column(
            "has_extracted_text", sa.Boolean, nullable=False, server_default="false"
        ),
        sa.Column("retention_days", sa.Integer, nullable=True),
        sa.Column("deleted_at", sa.String(30), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_documents_user_id", "documents", ["user_id"])
    op.create_index("ix_documents_user_category", "documents", ["user_id", "category"])
    op.create_index("ix_documents_user_date", "documents", ["user_id", "document_date"])

    # ------------------------------------------------------------------
    # ocr_jobs
    # ------------------------------------------------------------------
    op.create_table(
        "ocr_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM(
                "uploaded",
                "queued",
                "processing",
                "review_required",
                "confirmed",
                "failed",
                "deleted",
                name="ocr_status",
                create_type=False,
            ),
            nullable=False,
            server_default="uploaded",
        ),
        sa.Column(
            "document_type",
            postgresql.ENUM(
                "receipt", "salary_slip", name="ocr_document_type", create_type=False
            ),
            nullable=False,
        ),
        sa.Column("storage_key", sa.String(1000), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("idempotency_key", sa.String(128), nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("extracted_data", postgresql.JSONB, nullable=True),
        sa.Column("user_review_data", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_ocr_jobs_user_id", "ocr_jobs", ["user_id"])
    op.create_index("ix_ocr_jobs_user_status", "ocr_jobs", ["user_id", "status"])
    op.create_index(
        "ix_ocr_jobs_idempotency",
        "ocr_jobs",
        ["user_id", "idempotency_key"],
        unique=True,
        postgresql_where=sa.text("idempotency_key IS NOT NULL"),
    )

    # ------------------------------------------------------------------
    # ocr_results
    # ------------------------------------------------------------------
    op.create_table(
        "ocr_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ocr_jobs.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("provider", sa.String(100), nullable=False),
        sa.Column("raw_text", sa.Text, nullable=True),
        sa.Column("confidence_overall", sa.Float, nullable=True),
        sa.Column("provider_response", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_ocr_results_job_id", "ocr_results", ["job_id"])

    # ------------------------------------------------------------------
    # transactions
    # ------------------------------------------------------------------
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "type",
            postgresql.ENUM(
                "income", "expense", name="transaction_type", create_type=False
            ),
            nullable=False,
        ),
        sa.Column("amount_minor_units", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="JPY"),
        sa.Column("date", sa.String(10), nullable=False),
        sa.Column("merchant_name", sa.String(500), nullable=True),
        sa.Column(
            "category",
            postgresql.ENUM(
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
                name="expense_category",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column(
            "payment_method",
            postgresql.ENUM(
                "cash",
                "credit_card",
                "debit_card",
                "electronic_money",
                "bank_transfer",
                "qr_code",
                "other",
                name="payment_method",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column(
            "ocr_job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ocr_jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("idempotency_key", sa.String(128), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "amount_minor_units >= 0", name="chk_transaction_amount_nonneg"
        ),
    )
    op.create_index("ix_transactions_user_date", "transactions", ["user_id", "date"])
    op.create_index(
        "ix_transactions_user_category", "transactions", ["user_id", "category"]
    )
    op.create_index("ix_transactions_user_type", "transactions", ["user_id", "type"])
    op.create_index(
        "ix_transactions_idempotency",
        "transactions",
        ["user_id", "idempotency_key"],
        unique=True,
        postgresql_where=sa.text("idempotency_key IS NOT NULL"),
    )

    # ------------------------------------------------------------------
    # transaction_items
    # ------------------------------------------------------------------
    op.create_table(
        "transaction_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "transaction_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("transactions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 3), nullable=False, server_default="1"),
        sa.Column(
            "unit_price_minor_units", sa.BigInteger, nullable=False, server_default="0"
        ),
        sa.Column("amount_minor_units", sa.BigInteger, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "amount_minor_units >= 0", name="chk_transaction_item_amount_nonneg"
        ),
    )
    op.create_index(
        "ix_transaction_items_transaction_id", "transaction_items", ["transaction_id"]
    )

    # ------------------------------------------------------------------
    # budgets
    # ------------------------------------------------------------------
    op.create_table(
        "budgets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("month", sa.String(7), nullable=False),
        sa.Column(
            "overall_minor_units", sa.BigInteger, nullable=False, server_default="0"
        ),
        sa.Column("category_budgets", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("user_id", "month", name="uq_budgets_user_month"),
    )
    op.create_index("ix_budgets_user_month", "budgets", ["user_id", "month"])

    # ------------------------------------------------------------------
    # salary_slips
    # ------------------------------------------------------------------
    op.create_table(
        "salary_slips",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "ocr_job_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ocr_jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("payment_month", sa.String(7), nullable=False),
        sa.Column("payment_date", sa.String(10), nullable=True),
        sa.Column("employer_name", sa.String(500), nullable=True),
        sa.Column("basic_salary_minor_units", sa.BigInteger, nullable=True),
        sa.Column("overtime_minor_units", sa.BigInteger, nullable=True),
        sa.Column("allowances_minor_units", sa.BigInteger, nullable=True),
        sa.Column("gross_salary_minor_units", sa.BigInteger, nullable=True),
        sa.Column("income_tax_minor_units", sa.BigInteger, nullable=True),
        sa.Column("resident_tax_minor_units", sa.BigInteger, nullable=True),
        sa.Column("pension_minor_units", sa.BigInteger, nullable=True),
        sa.Column("health_insurance_minor_units", sa.BigInteger, nullable=True),
        sa.Column("employment_insurance_minor_units", sa.BigInteger, nullable=True),
        sa.Column("other_deductions_minor_units", sa.BigInteger, nullable=True),
        sa.Column("total_deductions_minor_units", sa.BigInteger, nullable=True),
        sa.Column("net_salary_minor_units", sa.BigInteger, nullable=True),
        sa.Column("confirmed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_salary_slips_user_id", "salary_slips", ["user_id"])
    op.create_index("ix_salary_slips_user_month", "salary_slips", ["user_id", "payment_month"])

    # ------------------------------------------------------------------
    # subscriptions
    # ------------------------------------------------------------------
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "plan",
            postgresql.ENUM(
                "free", "premium", "family", name="subscription_plan", create_type=False
            ),
            nullable=False,
            server_default="free",
        ),
        sa.Column(
            "platform",
            postgresql.ENUM(
                "web", "ios", "android", "manual", name="subscription_platform", create_type=False
            ),
            nullable=False,
            server_default="manual",
        ),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("expires_at", sa.String(30), nullable=True),
        sa.Column("platform_subscription_id", sa.String(500), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_subscriptions_user", "subscriptions", ["user_id"])

    # ------------------------------------------------------------------
    # audit_events
    # ------------------------------------------------------------------
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("event_data", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_audit_events_user_id", "audit_events", ["user_id"])
    op.create_index("ix_audit_events_user_type", "audit_events", ["user_id", "event_type"])
    op.create_index("ix_audit_events_created_at", "audit_events", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("subscriptions")
    op.drop_table("salary_slips")
    op.drop_table("budgets")
    op.drop_table("transaction_items")
    op.drop_table("transactions")
    op.drop_table("ocr_results")
    op.drop_table("ocr_jobs")
    op.drop_table("documents")
    op.drop_table("user_preferences")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS subscription_platform")
    op.execute("DROP TYPE IF EXISTS subscription_plan")
    op.execute("DROP TYPE IF EXISTS ocr_document_type")
    op.execute("DROP TYPE IF EXISTS ocr_status")
    op.execute("DROP TYPE IF EXISTS document_category")
    op.execute("DROP TYPE IF EXISTS payment_method")
    op.execute("DROP TYPE IF EXISTS expense_category")
    op.execute("DROP TYPE IF EXISTS transaction_type")
