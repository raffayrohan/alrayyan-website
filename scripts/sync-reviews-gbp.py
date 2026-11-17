"""
Al Rayyan — sync Google reviews via the Google Business Profile API (v4).

Use this INSTEAD of scripts/sync-reviews.py (Places API) when Google Cloud
billing cannot be set up. The Business Profile API is free — no per-call
charge, no billing account — but Google must approve the Cloud project first.

Run by .github/workflows/sync-reviews-gbp.yml (daily + manual).
Also runnable locally with env vars set (see docs/gbp-api-setup.md).

What it does:
  1. Exchanges the stored OAuth refresh token for a short-lived access token
     (scope: https://www.googleapis.com/auth/business.manage).
  2. Finds the Al Rayyan location: from GBP_ACCOUNT_ID / GBP_LOCATION_ID env,
     or by listing accounts -> locations and matching the name.
  3. GET mybusiness.googleapis.com/v4/accounts/{id}/locations/{id}/reviews
     pageSize=50, orderBy=updateTime desc — this returns ALL reviews,
     paginated, not just the 5 that Places API returns.
  4. Writes data/reviews.json: averageRating, totalReviewCount, up to 20
     reviews (5-star first, newest first, text only for display).
  5. Updates the JSON-LD aggregateRating + review array in index.html.

What it NEVER does:
  - Never invents a review, rating, count, or date. If credentials are
    missing, approval is pending (quota 0), or the API fails, it exits 0
    WITHOUT changing any file.
  - Never prints or commits any credential (client id/secret/refresh token).

Secrets needed (repo Settings -> Secrets and variables -> Actions):
  GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN
Optional: GBP_ACCOUNT_ID, GBP_LOCATION_ID (skip discovery once known).
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "reviews.json")
INDEX_PATH = os.path.join(ROOT, "index.html")

PLACE_NAME = "الريان للمظلات والسواتر والسندويش بنل والبرجولات والخيام"
MAPS_URL = "https://maps.google.com/maps?cid=2037894662107399438"
PHONE = "+966550044696"

CLIENT_ID = os.environ.get("GBP_CLIENT_ID", "").strip()
CLIENT_SECRET = os.environ.get("GBP_CLIENT_SECRET", "").strip()
REFRESH_TOKEN = os.environ.get("GBP_REFRESH_TOKEN", "").strip()
ACCOUNT_ID = os.environ.get("GBP_ACCOUNT_ID", "").strip()
LOCATION_ID = os.environ.get("GBP_LOCATION_ID", "").strip()

STAR_MAP = {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5}


def http_json(url, token=None, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if data is not None:
        body = urllib.parse.urlencode(data).encode("utf-8")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        req.data = body
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_access_token():
    return http_json(
        "https://oauth2.googleapis.com/token",
        method="POST",
        data={
            "grant_type": "refresh_token",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
        },
    )["access_token"]


def discover_location(token):
    """Return (account_id, location_id) for Al Rayyan, or raise."""
    if ACCOUNT_ID and LOCATION_ID:
        return ACCOUNT_ID, LOCATION_ID
    accounts = http_json(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        token=token,
    ).get("accounts", [])
    if not accounts:
        raise RuntimeError("No Business Profile accounts found for this OAuth account.")
    for acc in accounts:
        acc_name = acc["name"]  # accounts/{id}
        acc_id = acc_name.split("/")[-1]
        if ACCOUNT_ID and acc_id != ACCOUNT_ID:
            continue
        locs = http_json(
            f"https://mybusinessbusinessinformation.googleapis.com/v1/{acc_name}/locations"
            "?readMask=name,title,storefrontAddress,phoneNumbers",
            token=token,
        ).get("locations", [])
        for loc in locs:
            title = loc.get("title", "")
            if "الريان" in title or "Rayyan" in title:
                return acc_id, loc["name"].split("/")[-1]
        if locs and len(accounts) == 1:
            # Only one location under the only account — use it.
            return acc_id, locs[0]["name"].split("/")[-1]
    raise RuntimeError("Al Rayyan location not found in Business Profile accounts.")


def fetch_all_reviews(token, account_id, location_id):
    parent = f"accounts/{account_id}/locations/{location_id}"
    reviews = []
    page_token = ""
    average = None
    total = None
    while True:
        url = (
            f"https://mybusiness.googleapis.com/v4/{parent}/reviews"
            "?pageSize=50&orderBy=updateTime desc"
        )
        if page_token:
            url += "&pageToken=" + urllib.parse.quote(page_token)
        res = http_json(url, token=token)
        if average is None:
            average = res.get("averageRating")
            total = res.get("totalReviewCount")
        reviews.extend(res.get("reviews", []))
        page_token = res.get("nextPageToken", "")
        if not page_token:
            break
    return average, total, reviews


def main():
    if not (CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN):
        print("GBP_CLIENT_ID / GBP_CLIENT_SECRET / GBP_REFRESH_TOKEN not set — leaving files unchanged.")
        return 0
    try:
        token = get_access_token()
        account_id, location_id = discover_location(token)
        print(f"Location: accounts/{account_id}/locations/{location_id}")
        average, total, api_reviews = fetch_all_reviews(token, account_id, location_id)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "ignore")[:500]
        print(f"GBP API HTTP {e.code}: {body} — leaving files unchanged.")
        return 0
    except Exception as e:
        print(f"GBP API error: {e} — leaving files unchanged.")
        return 0

    if average is None or total is None or not api_reviews:
        print("GBP API returned no rating/count/reviews — leaving files unchanged.")
        return 0

    reviews = []
    for r in api_reviews:
        text = (r.get("comment") or "").strip()
        if not text:
            continue
        author = ((r.get("reviewer") or {}).get("displayName") or "Google user").strip()
        reviews.append({
            "author": author,
            "authorAr": author,
            "authorEn": author,
            "rating": STAR_MAP.get(r.get("starRating"), 5),
            "publishTime": (r.get("updateTime") or r.get("createTime") or "")[:10] or None,
            "textAr": text,
            "textEn": "",
            "language": "",
            "source": "Google Business Profile API (v4)",
        })

    def sort_key(x):
        ts = 0
        try:
            ts = datetime.fromisoformat(x["publishTime"]).timestamp() if x["publishTime"] else 0
        except Exception:
            ts = 0
        return (-(x["rating"] or 0), -ts)

    reviews = sorted(reviews, key=sort_key)

    # Keep old archive reviews (no date) after fresh reviews as fallback.
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
            "phone": PHONE,
            "address": "شارع القاسم بن أمية، الحمدانية، جدة 23761، السعودية",
            "gbpAccountId": account_id,
            "gbpLocationId": location_id,
        },
        "rating": float(average),
        "reviewCount": int(total),
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "updatedBy": "scripts/sync-reviews-gbp.py (GitHub Action)",
        "source": "Google Business Profile API (v4) — all reviews, paginated.",
        "note": "Site shows top 5 with text, 5-star first, newest first (assets/reviews.js).",
        "reviews": reviews[:20],
    }
    json.dump(out, open(DATA_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Wrote {DATA_PATH}: rating={average} count={total} reviews={len(out['reviews'])}")

    html = open(INDEX_PATH, encoding="utf-8").read()
    html2, n1 = re.subn(r'"reviewCount":"\d+"', f'"reviewCount":"{int(total)}"', html, count=1)
    html2, n2 = re.subn(r'"ratingValue":"4\.6"', f'"ratingValue":"{float(average)}"', html2, count=1)
    if n1 and n2:
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
