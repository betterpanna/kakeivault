"""
FastAPI dependency injection.

get_current_user() must be used on every protected endpoint.
It verifies the JWT and loads the user, ensuring ownership checks work.
"""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.services.user_service import UserService

_bearer = HTTPBearer(auto_error=False)


async def _get_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    access_token: Annotated[str | None, Cookie()] = None,
) -> str:
    """Extract bearer token from Authorization header or cookie."""
    if credentials is not None:
        return credentials.credentials
    if access_token:
        return access_token
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    token: Annotated[str, Depends(_get_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Validate JWT and return the authenticated User model.
    Raises 401 on any token problem, 403 if account is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token, expected_type="access")
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = UUID(user_id_str)
    except (JWTError, ValueError) as err:
        raise credentials_exception from err

    service = UserService(db)
    user = await service.get_by_id(user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
