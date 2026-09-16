"""Auth endpoint integration tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "SecurePass1", "locale": "en"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["email_verification_required"] is True


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dup@example.com", "password": "SecurePass1", "locale": "en"}
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "weakpass", "locale": "en"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_unverified_user(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "SecurePass1", "locale": "en"},
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "SecurePass1"},
    )
    # Login is allowed even before email verification (email verification is advisory in MVP)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wrong@example.com", "password": "SecurePass1", "locale": "en"},
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "WrongPass1"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_without_token(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_token(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "me@example.com", "password": "SecurePass1", "locale": "en"},
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "SecurePass1"},
    )
    token = login_resp.json()["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_forgot_password_always_returns_200(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert response.status_code == 200  # prevent user enumeration
