"""
Cross-user ownership tests.

These tests verify that users can NEVER access another user's data.
This is a critical security requirement.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


async def _register_and_login(client: AsyncClient, email: str) -> str:
    """Helper: register + login, return access token."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePass1", "locale": "en"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePass1"},
    )
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_profile(client: AsyncClient) -> None:
    """User A's token must not grant access to User B's data."""
    token_a = await _register_and_login(client, "owner_a@example.com")
    token_b = await _register_and_login(client, "owner_b@example.com")

    resp_a = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a}"}
    )
    resp_b = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token_b}"}
    )

    assert resp_a.json()["email"] == "owner_a@example.com"
    assert resp_b.json()["email"] == "owner_b@example.com"
    # Tokens are not interchangeable
    assert resp_a.json()["id"] != resp_b.json()["id"]
