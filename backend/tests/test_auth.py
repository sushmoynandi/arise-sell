"""Auth Flow Tests: Register, Login, Refresh, Me."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testmerchant@nokshi.co",
            "password": "Password123!",
            "password2": "Password123!",
            "first_name": "Test",
            "last_name": "Merchant",
            "business_name": "Nokshi Test Store",
        },
    )
    assert reg_res.status_code in [200, 201]
    tokens = reg_res.json()
    assert "access" in tokens
    assert "refresh" in tokens

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "testmerchant@nokshi.co", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    access_token = login_res.json()["access"]

    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testmerchant@nokshi.co"
