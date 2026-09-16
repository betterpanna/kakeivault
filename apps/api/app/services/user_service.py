"""User service — user creation, retrieval, preference management."""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import (
    generate_verification_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserPreference

logger = logging.getLogger(__name__)
# Never log passwords, tokens, or PII beyond email


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._db.execute(
            select(User)
            .options(selectinload(User.preference))
            .where(User.id == user_id, User.is_active.is_(True))
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(
            select(User)
            .options(selectinload(User.preference))
            .where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        password: str,
        locale: str = "ja-JP",
    ) -> User:
        """
        Create a new user with a verification token.
        The verification token is returned in the response but NOT logged.
        """
        verification_token = generate_verification_token()
        expires = datetime.now(UTC) + timedelta(hours=24)

        user = User(
            email=email.lower(),
            password_hash=hash_password(password),
            email_verified=False,
            email_verification_token=verification_token,
            email_verification_expires=expires,
        )
        self._db.add(user)
        await self._db.flush()  # get user.id

        pref = UserPreference(user_id=user.id, locale=locale)
        self._db.add(pref)
        await self._db.flush()

        # Create free subscription
        from app.models.subscription import Subscription

        sub = Subscription(user_id=user.id, plan="free", platform="manual", is_active=True)
        self._db.add(sub)
        await self._db.flush()

        logger.info("User created: %s", user.id)  # ID only, not email
        return user

    async def verify_email(self, token: str) -> User | None:
        result = await self._db.execute(
            select(User).where(
                User.email_verification_token == token,
                User.email_verified.is_(False),
            )
        )
        user = result.scalar_one_or_none()
        if user is None:
            return None

        now = datetime.now(UTC)
        if user.email_verification_expires and user.email_verification_expires < now:
            return None  # expired

        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        await self._db.flush()
        return user

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.get_by_email(email)
        if user is None:
            # Constant-time comparison to prevent timing attacks
            hash_password("dummy_to_prevent_timing_attack")
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    async def initiate_password_reset(self, email: str) -> str | None:
        """
        Returns the reset token (to be emailed). Returns None if user not found.
        Token is NOT logged.
        """
        user = await self.get_by_email(email)
        if user is None:
            return None

        token = generate_verification_token()
        user.password_reset_token = token
        user.password_reset_expires = datetime.now(UTC) + timedelta(hours=1)
        await self._db.flush()
        return token

    async def reset_password(self, token: str, new_password: str) -> bool:
        result = await self._db.execute(
            select(User).where(User.password_reset_token == token)
        )
        user = result.scalar_one_or_none()
        if user is None:
            return False

        now = datetime.now(UTC)
        if user.password_reset_expires and user.password_reset_expires < now:
            return False

        user.password_hash = hash_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        await self._db.flush()
        return True

    async def update_locale(self, user: User, locale: str) -> None:
        if user.preference is None:
            pref = UserPreference(user_id=user.id, locale=locale)
            self._db.add(pref)
        else:
            user.preference.locale = locale
        await self._db.flush()

    async def delete_account(self, user: User) -> None:
        """
        Permanently delete user and cascade to all owned data.
        Called after account-deletion workflow is confirmed.
        Audit event must be written BEFORE deletion.
        """
        user.is_active = False  # soft-deactivate first
        user.email = f"deleted_{user.id}@deleted"  # free the email
        await self._db.flush()
        await self._db.delete(user)
        await self._db.flush()
        logger.info("Account deleted: %s", user.id)
