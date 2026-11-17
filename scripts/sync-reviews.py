"""
Al Rayyan — sync Google reviews into data/reviews.json.

Run by .github/workflows/sync-reviews.yml (daily + manual).
Also runnable locally:  GOOGLE_PLACES_API_KEY=... GOOGLE_PLACE_ID=... python3 scripts/sync-reviews.py

What it does:
  1. Resolves the Google Place ID (from GOOGLE_PLACE_ID, or from data/reviews.json,
     or via Places API (New) Text Search by name + lat/lng + phone).
  2. Calls Places API (New) Place Details with reviewsSort=newest.
  3. Writes data/reviews.json: rating, userRatingCount, up to 10 reviews
     (5-star first, newest first, text only for display).
  4. Updates the JSON-LD aggregateRating + review array in index.html
     (ratingValue + reviewCount + first 5 reviews). No other HTML is touched.

What it NEVER does:
  - Never invents a review, rating, count, or date. If the API fails, returns
    no reviews, or the key is missing, it exits 0 WITHOUT changing any file.
  - Never prints or commits the API key.

Limits (Google's, not ours):
  - Places API returns at most 5 reviews per Place Details call, sorted by
    newest when reviewsSort=newest is used. That is why this system shows
    "latest 5" — it cannot fetch all 49 reviews through this API.
  - Review text from the API can be truncated. The full text lives on Google Maps.
  - This needs a Google Cloud API key with Places API (New) enabled + a billing
    account. 1 call/day is minimal usage, but check Google Cloud pricing and set
    a budget cap / quota in Google Cloud Console.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "reviews.json")
INDEX_PATH = os.path.join(ROOT, "index.html")

PLACE_NAME = "الريان للمظلات والسواتر والسندويش بنل والبرجولات والخيام"
LAT, LNG = 21.7590272, 39.1914194
PHONE = "+966550044696"
MAPS_URL = "https://maps.google.com/maps?cid=2037894662107399438"

API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
PLACE_ID = os.environ.get("GOOGLE_PLACE_ID", "").strip()


def api_get(url, field_mask=None):
    req = urllib.request.Request(url, method="GET")
    req.add_header("X-Goog-Api-Key", API_KEY)
    if field_mask:
        req.add_header("X-Goog-FieldMask", field_mask)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_post(url, payload, field_mask=None):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Goog-Api-Key", API_KEY)
    if field_mask:
        req.add_header("X-Goog-FieldMask", field_mask)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def resolve_place_id():
    if PLACE_ID:
        return PLACE_ID
    try:
        old = json.load(open(DATA_PATH, encoding="utf-8"))
        if old.get("place", {}).get("placeId"):
            return old["place"]["placeId"]
    except Exception:
        pass
    # Text Search: name + location bias, then match by phone / name.
    res = api_post(
        "https://places.googleapis.com/v1/places:searchText",
        {"textQuery": PLACE_NAME + " Jeddah",
         "locationBias": {"circle": {"center": {"latitude": LAT, "longitude": LNG}, "radius": 5000.0}},
         "maxResultCount": 5},
        field_mask="places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber",
    )
    for place in res.get("places", []):
        phone = (place.get("internationalPhoneNumber") or "").replace(" ", "")
        if phone == PHONE or PLACE_NAME in (place.get("displayName", {}).get("text") or ""):
            return place["id"]
    if res.get("places"):
        return res["places"][0]["id"]
    raise RuntimeError("Could not resolve Place ID via Text Search")


def main():
    if not API_KEY:
        print("GOOGLE_PLACES_API_KEY not set — leaving reviews.json unchanged.")
        return 0
    place_id = resolve_place_id()
    print(f"Place ID: {place_id}")
    details = api_get(
        f"https://places.googleapis.com/v1/places/{place_id}?reviewsSort=newest",
        field_mask="id,displayName,rating,userRatingCount,reviews",
    )
    rating = details.get("rating")
    count = details.get("userRatingCount")
    api_reviews = details.get("reviews") or []
    if rating is None or count is None or not api_reviews:
        print("API returned no rating/count/reviews — leaving files unchanged.")
        return 0

    reviews = []
    for r in api_reviews:
        text = (r.get("text") or {}).get("text", "").strip()
        if not text:
            continue
        author = (r.get("authorAttribution") or {}).get("displayName", "") or "Google user"
        reviews.append({
            "author": author,
            "authorAr": author,
            "authorEn": author,
            "rating": int(r.get("rating", 5)),
            "publishTime": (r.get("publishTime") or "")[:10] or None,
            "textAr": text,
            "textEn": "",
            "language": r.get("languageCode", ""),
            "source": "Google Maps (Places API)",
        })
    # 5-star first, newest first — same order as assets/reviews.js
    def sort_key(x):
        ts = 0
        try:
            ts = datetime.fromisoformat(x["publishTime"]).timestamp() if x["publishTime"] else 0
        except Exception:
            ts = 0
        return (-(x["rating"] or 0), -ts)
    reviews = sorted(reviews, key=sort_key)

    # Keep old archive reviews (no date) after the fresh API reviews, so the
    # site still has fallback cards if the API ever returns fewer than 5.
    try:
        old = json.load(open(DATA_PATH, encoding="utf-8"))
        archive = [r for r in old.get("reviews", []) if not r.get("publishTime")]
        seen = {(r.get("author"), r.get("textAr")) for r in reviews}
        for r in archive:
            if (r.get("author"), r.get("textAr")) not in seen:
                reviews.append(r)
    except Exception:
        pass

    out = {
        "place": {
            "name": PLACE_NAME,
            "mapsUrl": MAPS_URL,
            "knowledgeGraphId": "/g/11ghnc2806",
            "placeId": place_id,
            "phone": PHONE,
            "address": "شارع القاسم بن أمية، الحمدانية، جدة 23761، السعودية",
        },
        "rating": rating,
        "reviewCount": int(count),
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "updatedBy": "scripts/sync-reviews.py (GitHub Action)",
        "source": "Google Places API (New), reviewsSort=newest — at most 5 reviews per call.",
        "note": "Site shows top 5 with text, 5-star first, newest first (assets/reviews.js).",
        "reviews": reviews[:10],
    }
    json.dump(out, open(DATA_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Wrote {DATA_PATH}: rating={rating} count={count} reviews={len(out['reviews'])}")

    # --- Update JSON-LD in index.html (aggregateRating + first 5 reviews) ---
    html = open(INDEX_PATH, encoding="utf-8").read()
    html2, n1 = re.subn(r'"reviewCount":"\d+"', f'"reviewCount":"{int(count)}"', html, count=1)
    html2, n2 = re.subn(r'"ratingValue":"4\.6"', f'"ratingValue":"{rating}"', html2, count=1)
    if n1 and n2:
        # Replace the "review":[...] array inside the LocalBusiness JSON-LD with fresh reviews.
        fresh = [{
            "@type": "Review",
            "author": {"@type": "Person", "name": r["author"]},
            "reviewBody": r["textAr"],
            "reviewRating": {"@type": "Rating", "ratingValue": str(r["rating"]), "bestRating": "5"},
        } for r in reviews[:5] if r.get("textAr")]
        new_array = '"review":' + json.dumps(fresh, ensure_ascii=False)
        html3, n3 = re.subn(r'"review":\[.*?\]},\{"@type":"WebSite"', new_array + '},{"@type":"WebSite"', html2, count=1, flags=re.S)
        if n3:
            html2 = html3
            print("Updated JSON-LD review array (5 reviews).")
        open(INDEX_PATH, "w", encoding="utf-8").write(html2)
        print("Updated JSON-LD aggregateRating in index.html.")
    else:
        print("JSON-LD aggregateRating pattern not found — index.html left unchanged.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
