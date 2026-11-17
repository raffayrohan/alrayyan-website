# Live Google Reviews — how it works

Site: https://alrayyan-panels.com/ — Repo: `raffayrohan/alrayyan-website` (GitHub Pages, `main`)

## The system (in one line)

`data/reviews.json` is the single source of truth. `assets/reviews.js` reads it in the
browser and shows the **top 5 reviews with text — 5-star first, newest first**.
A GitHub Action runs daily and rewrites `data/reviews.json` from Google. No one
edits `index.html` to change a review after this is set up.

## Files

| File | What it does |
|---|---|
| `data/reviews.json` | Rating (4.6), review count (49 on 17 Nov 2026), up to 10 reviews. Seeded with the 5 latest readable Google reviews + 5 older archive reviews. |
| `assets/reviews.js` | Fetches `data/reviews.json`, sorts 5★ first → newest first, renders 5 cards in the existing `.reviews-grid` styles, updates the big score + count text in Arabic/English. If the fetch fails, the hardcoded cards in `index.html` stay as fallback. No API key in the browser — ever. |
| `scripts/sync-reviews.py` | The sync script. Calls Google Places API (New), `reviewsSort=newest`. Updates `data/reviews.json` + the JSON-LD `aggregateRating` / `review` array in `index.html`. Exits without changing anything if the key is missing or the API fails. |
| `.github/workflows/sync-reviews.yml` | Runs daily 03:00 UTC (06:00 PKT) + manual "Run workflow". Commits only when reviews changed. GitHub Pages redeploys on push to `main`. |
| `index.html` (1-line wiring) | `<script src="assets/reviews.js" defer></script>` after `gallery-data.js`, plus `id="reviewsGrid"` / `id="reviewsScore"` / `id="reviewsCount"`, and the count updated 46 → 49 in the HTML, the i18n dict, and JSON-LD. |

## Setup — 2 steps only the owner can do

### 1. Google Cloud API key (needed for true auto-sync)

Google does **not** offer a free, keyless way to pull live Business Profile reviews.
Scraping Google Maps is unreliable and against its terms — this system does not do it.

1. Go to Google Cloud Console → create/select a project → enable **Places API (New)**.
2. Create an API key, restrict it: API restrictions = Places API (New) only,
   Application restrictions = none needed (it is only used from GitHub Actions, never in the browser).
3. Attach a billing account (required by Google for Places API). 1 call/day is minimal
   usage — check pricing and set a budget cap / quota in Cloud Console.
4. In this repo: Settings → Secrets and variables → Actions → New repository secret:
   - Name: `GOOGLE_PLACES_API_KEY`, Value: the key.
   - Optional: `GOOGLE_PLACE_ID` — leave empty first time; the script resolves it by
     Text Search (name + 21.7590272, 39.1914194 + phone +966550044696) and saves it
     into `data/reviews.json`. Copy it from there into the secret afterwards.

### 2. Test it manually

Actions → "Sync Google reviews" → Run workflow → check the run log.
If it succeeds, `data/reviews.json` gets a new `updatedAt` + the newest reviews.
If it says "GOOGLE_PLACES_API_KEY not set", add the secret (step 1) and run again.

## What "live" actually means — honest limits

- Google Places API returns **at most 5 reviews per call**. So the site can auto-show
  the latest 5 — it cannot auto-fetch all 49 reviews. The aggregate rating + total
  count (4.6 / 49) do update automatically, because those come from the same API call.
- Review text from the API can be truncated. Full text is on Google Maps (the site
  links to it from the reviews header).
- Sync is **daily, not instant**. A review posted today appears on the site after the
  next 03:00 UTC run + GitHub Pages redeploy (a few minutes). Use "Run workflow"
  manually if you need it sooner.
- If you do not want a Google Cloud key / billing, the alternative is a paid review
  widget (Elfsight / Trustindex / EmbedSocial): paste their embed code instead of
  `assets/reviews.js`. That needs a subscription, not a key. Do not use a widget
  *and* this system at the same time.

## If something breaks

- Site still shows old reviews? Check Actions → latest "Sync Google reviews" run.
  "not set" = add the secret. API error = check the key restrictions + billing.
- Count stuck at 49? The Action only commits when `data/reviews.json` or
  `index.html` changed. No new review = no commit = correct behaviour.
- Wrong Place ID? Delete `GOOGLE_PLACE_ID` secret, delete `place.placeId` from
  `data/reviews.json`, re-run — the script re-resolves by name + phone.
