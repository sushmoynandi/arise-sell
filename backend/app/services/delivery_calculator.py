"""Bangladesh 64-District Aware Auto-Routing & Delivery Fee Calculator."""
from __future__ import annotations

from typing import Any

DHAKA_METRO_AREAS = [
    "dhaka", "gulshan", "banani", "dhanmondi", "uttara", "mirpur", "mohammadpur",
    "badda", "motijheel", "bashundhara", "khilgaon", "rampura", "malibagh",
    "baridhara", "lalbagh", "tejgaon", "shahbagh", "ঢাকা", "গুলশান", "বনানী",
    "ধানমন্ডি", "উত্তরা", "মিরপুর", "মোহাম্মদপুর", "বাড্ডা", "মতিঝিল", "বসুন্ধরা",
]

SUB_DHAKA_AREAS = [
    "savar", "gazipur", "keraniganj", "narayanganj", "tongi", "সাভার", "গাজীপুর", "কেরানীগঞ্জ", "নারায়ণগঞ্জ", "টঙ্গী",
]

BD_64_DISTRICTS = [
    "bagerhat", "bandarban", "barguna", "barishal", "bhola", "bogura", "brahmanbaria",
    "chandpur", "chattogram", "chuadanga", "cox's bazar", "cumilla", "dhaka",
    "dinajpur", "faridpur", "feni", "gaibandha", "gazipur", "gopalganj", "habiganj",
    "jamalpur", "jashore", "jhalokathi", "jhenaidah", "joypurhat", "khagrachhari",
    "khulna", "kishoreganj", "kurigram", "kushtia", "lakshmipur", "lalmonirhat",
    "madaripur", "magura", "manikganj", "meherpur", "moulvibazar", "munshiganj",
    "mymensingh", "naogaon", "narail", "narayanganj", "narsingdi", "natore",
    "netrokona", "nilphamari", "noakhali", "pabna", "panchagarh", "patuakhali",
    "pirojpur", "rajbari", "rajshahi", "rangamati", "rangpur", "satkhira",
    "shariatpur", "sherpur", "sirajganj", "sunamganj", "sylhet", "tangail", "thakurgaon",
]


def resolve_district_and_courier(address: str, district: str | None = None) -> dict[str, Any]:
    combined = f"{address} {district or ''}".lower()

    if any(area in combined for area in DHAKA_METRO_AREAS):
        return {
            "zone": "inside_dhaka",
            "district": "Dhaka",
            "recommended_courier": "pathao",
            "delivery_charge": 80.0,
            "eta": "Next-day Express (within 24 hours)",
            "description": "ঢাকা সিটির ভেতরে হোম ডেলিভারি",
        }

    if any(area in combined for area in SUB_DHAKA_AREAS):
        return {
            "zone": "sub_dhaka",
            "district": "Sub-Dhaka",
            "recommended_courier": "steadfast",
            "delivery_charge": 100.0,
            "eta": "1-2 Business Days",
            "description": "সাভার / গাজীপুর / নারায়ণগঞ্জ হোম ডেলিভারি",
        }

    matched_district = "Outside Dhaka"
    for d in BD_64_DISTRICTS:
        if d in combined:
            matched_district = d.capitalize()
            break

    return {
        "zone": "outside_dhaka",
        "district": matched_district,
        "recommended_courier": "steadfast",
        "delivery_charge": 130.0,
        "eta": "2-3 Business Days",
        "description": f"{matched_district} জেলায় হোম ডেলিভারি",
    }
