"""Test script to verify Admin Plans, Festival Offers, and Enterprise Contracts endpoints."""
import asyncio
import os
import sys
import httpx

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("1. Testing GET /api/v1/admin/plans/festival-offers...")
        r = await client.get("/api/v1/admin/plans/festival-offers")
        print(f"Status: {r.status_code}, data: {r.json()[:2] if isinstance(r.json(), list) else r.text}")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        print("\n2. Testing POST /api/v1/admin/plans/festival-offers...")
        offer_payload = {
            "festivalName": "Eid Special 2026",
            "festivalNameBn": "ঈদ ধামাকা অফার ২০২৬",
            "couponCode": "EID2026",
            "discountPercent": 25,
            "bonusMessages": 500,
            "validity": "Valid till Eid Ul Fitr",
            "active": True,
            "applicablePlan": "all",
            "applicablePlanName": "All Plans"
        }
        r = await client.post("/api/v1/admin/plans/festival-offers", json=offer_payload)
        print(f"Status: {r.status_code}, created: {r.json()}")
        assert r.status_code == 201, f"Expected 201, got {r.status_code}"

        print("\n3. Testing GET /api/v1/admin/plans...")
        r = await client.get("/api/v1/admin/plans")
        print(f"Status: {r.status_code}, count: {len(r.json()) if isinstance(r.json(), list) else r.text}")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        print("\n4. Testing GET /api/v1/admin/plans/contracts...")
        r = await client.get("/api/v1/admin/plans/contracts")
        print(f"Status: {r.status_code}, count: {len(r.json()) if isinstance(r.json(), list) else r.text}")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        print("\n5. Testing POST /api/v1/admin/plans/contracts...")
        contract_payload = {
            "merchant_name": "Aarong Retail Bangladesh",
            "merchant_email": "operations@aarong.com",
            "plan_name": "Enterprise High Volume",
            "duration_months": 12,
            "price_bdt": 120000.0,
            "message_limit": 250000,
            "max_stores": 10,
            "max_seats": 50,
            "notes": "Custom B2B annual contract with dedicated account manager"
        }
        r = await client.post("/api/v1/admin/plans/contracts", json=contract_payload)
        print(f"Status: {r.status_code}, created contract: {r.json()}")
        assert r.status_code == 201, f"Expected 201, got {r.status_code}"
        created_id = r.json().get("id")

        print("\n6. Testing GET /api/v1/plans (public)...")
        r = await client.get("/api/v1/plans")
        print(f"Status: {r.status_code}, count: {len(r.json()) if isinstance(r.json(), list) else r.text}")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        print("\n7. Testing GET /api/v1/admin/plans/contracts (verifying persisted contract)...")
        r = await client.get("/api/v1/admin/plans/contracts")
        contracts = r.json()
        print(f"Contracts in DB: {len(contracts)}")
        found = any(c.get("merchant_name") == "Aarong Retail Bangladesh" for c in contracts)
        assert found, "Created contract was not found in listing!"

        print("\n✅ ALL ADMIN PLANS & CONTRACTS ENDPOINT TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    asyncio.run(run_tests())
