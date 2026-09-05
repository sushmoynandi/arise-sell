import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    ("GET", "http://127.0.0.1:8000/api/v1/billing/plans", None),
    ("GET", "http://127.0.0.1:8000/api/v1/merchants/team", None),
    ("GET", "http://127.0.0.1:8000/api/v1/merchants/profile", None),
    ("GET", "http://127.0.0.1:8000/api/v1/merchants/notifications", None),
    ("GET", "http://127.0.0.1:8000/api/v1/orders", None),
]

print("🔍 Testing API Endpoints after Schema Migration:\n")

for method, url, body in endpoints:
    try:
        req = urllib.request.Request(url, method=method)
        if body:
            req.data = json.dumps(body).encode('utf-8')
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            count = len(data) if isinstance(data, list) else (len(data.keys()) if isinstance(data, dict) else 1)
            print(f"✅ {method} {url} -> HTTP {res.status} (Items/Keys: {count})")
    except Exception as e:
        print(f"❌ {method} {url} -> FAILED: {e}")

# Test Orders & Courier Booking Flow
try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/orders")
    with urllib.request.urlopen(req) as res:
        orders = json.loads(res.read().decode('utf-8'))
        print(f"\n📦 Orders retrieved: {len(orders)}")
        unbooked = [o for o in orders if not o.get('courier')]
        if unbooked:
            target = unbooked[0]
            print(f"⚡ Testing Courier Booking for {target['ref']} (ID: {target['id']})...")
            book_req = urllib.request.Request(
                f"http://127.0.0.1:8000/api/v1/orders/{target['id']}/book-courier",
                data=json.dumps({"provider": "steadfast", "note": "Priority parcel"}).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(book_req) as b_res:
                b_data = json.loads(b_res.read().decode('utf-8'))
                print("✅ Booking Succeeded:", b_data)

            # Test sync tracking
            sync_req = urllib.request.Request(
                f"http://127.0.0.1:8000/api/v1/orders/{target['id']}/sync-courier",
                data=b"{}",
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(sync_req) as s_res:
                s_data = json.loads(s_res.read().decode('utf-8'))
                print("✅ Tracking Sync Succeeded:", s_data.get('consignment'), "Status:", s_data.get('status'))

        # Test bulk book
        bulk_req = urllib.request.Request(
            "http://127.0.0.1:8000/api/v1/orders/bulk-book",
            data=b"{}",
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(bulk_req) as blk_res:
            blk_data = json.loads(blk_res.read().decode('utf-8'))
            print(f"✅ Bulk Booking Succeeded: Total Booked = {blk_data.get('total_booked')}, Steadfast = {blk_data.get('steadfast_count')}, Pathao = {blk_data.get('pathao_count')}")

except Exception as e:
    print(f"❌ Orders / Courier Test Error: {e}")
