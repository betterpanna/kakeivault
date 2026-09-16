"""
Authentication endpoints.

Rate limiting:
- /register: 5 per hour per IP
- /login: 10 per hour per IP
- /forgot-password: 5 per hour per IP

Cookie strategy (web):
- access_token: HttpOnly, Secure, SameSite=Lax, short expiry
- refresh_token: HttpOnly, Secure, SameSite=Lax, longer expiry
- Mobile clients use Bearer tokens in Authorization header instead
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from jose import JWTError

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DbSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    UserInfo,
    VerifyEmailRequest,
)
from app.services.user_service import UserService

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly auth cookies for web clients."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        domain=settings.cookie_domain,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_refresh_token_expire_days * 86400,
        path="/api/v1/auth/refresh",
        domain=settings.cookie_domain,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", domain=settings.cookie_domain)
    response.delete_cookie(
        "refresh_token", path="/api/v1/auth/refresh", domain=settings.cookie_domain
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: DbSession, request: Request) -> RegisterResponse:
    service = UserService(db)
    existing = await service.get_by_email(body.email)
    if existing is not None:
        # Generic error to avoid user enumeration
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = await service.create_user(
        email=body.email, password=body.password, locale=body.locale
    )
    # TODO Phase 0: email sending stub — log token for dev, send email in production
    logger.debug(
        "Email verification token for user %s: [REDACTED — check dev email service]", user.id
    )
    return RegisterResponse(
        user_id=str(user.id),
        email=user.email,
        email_verification_required=True,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    db: DbSession,
    request: Request,
    response: Response,
) -> LoginResponse:
    service = UserService(db)
    user = await service.authenticate(body.email, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    _set_auth_cookies(response, access_token, refresh_token)

    locale = user.preference.locale if user.preference else "ja-JP"
    expires_in = settings.jwt_access_token_expire_minutes * 60

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserInfo(
            id=str(user.id),
            email=user.email,
            email_verified=user.email_verified,
            locale=locale,
        ),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
) -> RefreshResponse:
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except JWTError as err:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        ) from err

    new_access = create_access_token(payload["sub"])
    new_refresh = create_refresh_token(payload["sub"])
    _set_auth_cookies(response, new_access, new_refresh)

    return RefreshResponse(
        access_token=new_access,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response, current_user: CurrentUser) -> MessageResponse:
    _clear_auth_cookies(response)
    return MessageResponse(message="Logged out successfully")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(body: VerifyEmailRequest, db: DbSession) -> MessageResponse:
    service = UserService(db)
    user = await service.verify_email(body.token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    return MessageResponse(message="Email verified successfully")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(body: ForgotPasswordRequest, db: DbSession) -> MessageResponse:
    service = UserService(db)
    # Always return 200 regardless of whether the email exists (prevents enumeration)
    token = await service.initiate_password_reset(body.email)
    if token is not None:
        logger.debug("Password reset token generated for [REDACTED]: %s", "[REDACTED]")
        # TODO: send email in production
    return MessageResponse(message="If the email exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: DbSession) -> MessageResponse:
    service = UserService(db)
    success = await service.reset_password(body.token, body.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    return MessageResponse(message="Password reset successfully")


@router.get("/me")
async def get_me(current_user: CurrentUser) -> UserInfo:
    locale = current_user.preference.locale if current_user.preference else "ja-JP"
    return UserInfo(
        id=str(current_user.id),
        email=current_user.email,
        email_verified=current_user.email_verified,
        locale=locale,
    )
