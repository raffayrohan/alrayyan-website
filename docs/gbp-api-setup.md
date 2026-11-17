# Google Business Profile API — free auto-sync setup

Site: https://alrayyan-panels.com/ — Repo: `raffayrohan/alrayyan-website`

Why this route: the Places API needs a Google Cloud billing account, and
billing setup fails for Rohan with error `OR_BACR2_31` (payment method
rejected). The Business Profile API is **free — no per-call charge, no
billing account**. The price is a manual approval wait instead of money.

## What it gives you (better than Places API)

- **All reviews**, paginated — not just the 5 that Places API returns.
- Rating + total count update automatically, same as before.
- Same site behaviour: `assets/reviews.js` shows top 5, 5-star first, newest first.

## Eligibility — Al Rayyan qualifies

- Profile verified and active 60+ days: yes (established 8 Feb 2014).
- Official website listed on the profile: yes (alrayyan-panels.com).
- The Google account that applies **must be an owner or manager** of the
  profile. Apply from that account — not from a random Gmail.

## Step 1 — Google Cloud project (no billing needed)

1. [Google Cloud Console](https://console.cloud.google.com/) → create a
   project, e.g. `al-rayyan-gbp` (or reuse the project you already made for
   Places API — billing on that project does not matter here).
2. On the project dashboard, copy the **Project Number** (not the Project ID).
   You need it for the form in Step 2.
3. Enable these APIs (APIs & Services → Library → Enable each):
   - My Business Account Management API
   - My Business Business Information API
   - Google My Business API (this is the legacy v4 service that has reviews;
     it only appears / works after approval in Step 2)

## Step 2 — Apply for API access (the waiting step)

1. Sign in with the Google account that owns/manages the Al Rayyan profile.
2. Open the form: https://support.google.com/business/contact/api_default
3. "What can we help with?" → **Application for Basic API Access** →
   **Apply for Google Business Profile API access**.
4. Pick the Al Rayyan business when the wizard shows your profiles.
5. Fill in: company name, contact email, **Project Number** from Step 1.
   Use-case text (copy-paste, adjust as needed):

   > We manage our own Google Business Profile for Al Rayyan Awnings in
   > Jeddah (alrayyan-panels.com). We will use the Business Profile API
   > only to read our own location's reviews and ratings once a day, to
   > display our latest Google reviews on our own website. No data will
   > be shared with third parties and no other profiles will be accessed.

6. Submit. Expect a reply in **1–2 weeks** from
   `googlebusinessprofile-support@google.com`.
7. Check approval: Cloud Console → the Business Profile APIs → Quotas.
   **0 QPM = not approved yet. 300 QPM = approved.**

## Step 3 — OAuth credentials + refresh token (after approval)

The GitHub Action cannot use a password — it uses an OAuth refresh token.
Do this once, on your own computer:

1. Cloud Console → APIs & Services → Credentials → Create Credentials →
   **OAuth client ID** → Application type **Web application**.
2. Authorised redirect URI: `https://developers.google.com/oauthplayground`
3. Copy the **Client ID** and **Client Secret**.
4. Open https://developers.google.com/oauthplayground — click the gear
   (settings) → tick "Use your own OAuth credentials" → paste Client ID
   and Client Secret.
5. In the scope box type: `https://www.googleapis.com/auth/business.manage`
   → Authorize APIs → sign in with the GBP owner/manager account → Allow.
6. Exchange authorization code for tokens → copy the **Refresh token**.
   (The access token expires in 1 hour — the refresh token is the one
   that lasts; the script exchanges it for a fresh access token each run.)

## Step 4 — Repo secrets + workflow file

1. Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `GBP_CLIENT_ID` = Client ID from Step 3
   - `GBP_CLIENT_SECRET` = Client Secret from Step 3
   - `GBP_REFRESH_TOKEN` = Refresh token from Step 3
   - Optional later: `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID` — the script
     prints them in the Action log on its first successful run; copy them
     into secrets to skip discovery.
   Never paste any of these in chat, email, or a file that gets committed.
2. Add the workflow file manually (GitHub App cannot push `.github/`
   files): repo → Add file → Create new file →
   path `.github/workflows/sync-reviews-gbp.yml` → paste the file from
   this workspace. **Do NOT also add `sync-reviews.yml` (Places version)**
   — use one sync workflow only, or the two will fight over reviews.json.
3. Add the script: repo → Add file → Upload files →
   `scripts/sync-reviews-gbp.py` (from this workspace), commit to main.
   Or tell Muse to push it — Contents API works for this file.

## Step 5 — Test

Repo → Actions → "Sync Google reviews (Business Profile API)" →
Run workflow → check the log.
- Success: `data/reviews.json` gets a new `updatedAt` + all reviews.
- "credentials not set": a secret is missing (Step 4).
- HTTP 403 / quota 0: approval is still pending (Step 2) — wait, do not
  re-apply repeatedly.

## If approval is refused

- Most common reason: the applying email is not an owner/manager, or the
  profile was not verified 60+ days. Fix that and re-apply once.
- Fallback while waiting: keep the site as it is (seeded latest reviews
  are already live) and update `data/reviews.json` manually when a new
  review arrives, or use a free widget (EmbedSocial free, 500 views/mo,
  daily sync) as a temporary embed.
