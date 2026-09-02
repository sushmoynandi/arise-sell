"""Super Admin 2FA Authentication & Console Endpoints Test."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_2fa_and_dashboard(client: AsyncClient):
    res = await client.post(
        "/api/v1/admin/auth/login",
        json={"email": "admin@nextproduct.ai", "password": "MasterAdmin@2026"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["requires_2fa"] is True

    verify_res = await client.post(
        "/api/v1/admin/auth/verify-2fa",
        json={"email": "admin@nextproduct.ai", "totp_code": "123456"},
    )
    assert verify_res.status_code == 200
    admin_tokens = verify_res.json()
    assert "access" in admin_tokens
    access_token = admin_tokens["access"]

    headers = {"Authorization": f"Bearer {access_token}"}
    dash_res = await client.get("/api/v1/admin/dashboard", headers=headers)
    assert dash_res.status_code == 200
    kpis = dash_res.json()
    assert "platformGmvBDT" in kpis
    assert "mrrBDT" in kpis
