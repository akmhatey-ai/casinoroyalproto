# PromptHub Site Analysis — What’s Working & What Isn’t

**Domain:** https://prompthub-kappa.vercel.app  
**Date:** Current state for launch readiness.

---

## 1. What’s Working ✅

| Area | Status | Details |
|------|--------|---------|
| **Homepage** | ✅ Working | Loads correctly. Shows “Discover prompts & skills”, search bar, filter pills (All / Prompts / Skills), “No prompts yet” and “No skills yet” (empty state). |
| **Basic health** | ✅ Working | `GET /api/health` returns `{"status":"ok"}` — app is up. |
| **Login page** | ✅ Working | `/login` loads with “Sign in with Google” and “Sign in with GitHub” buttons. |
| **Protected routes** | ✅ Working | `/dashboard` and `/submit` redirect to `/login` when you’re not signed in. |
| **Public navigation** | ✅ Working | Links to Home, Search, Dashboard, Submit, Sign in work. |
| **Design / UI** | ✅ Working | Dark theme, orange accent, sidebar, glass cards, fonts load. |
| **Search API (no DB)** | ✅ Safe | If `DATABASE_URL` is missing, `/api/search` returns empty items instead of crashing. |
| **Home (no DB)** | ✅ Safe | If `DATABASE_URL` is missing, homepage shows empty lists instead of crashing. |

---

## 2. What’s Unclear or Slow ⚠️

| Check | Result | What it likely means |
|-------|--------|----------------------|
| **`/api/health?db=1`** | Timed out | Either the database isn’t set in Vercel, or the DB connection from Vercel to Supabase is slow/failing. Need to confirm `DATABASE_URL` is set in Vercel and correct. |
| **`/search` (page)** | Timed out | Page might be slow (e.g. cold start or waiting on DB). If `DATABASE_URL` is wrong/missing, the search page could still be trying to hit the DB and hang. |
| **`/api/analytics`** | Timed out | Same idea: either cold start or DB not reachable. |

**Bottom line:** If `DATABASE_URL` is not set in Vercel (or is wrong), then:

- Homepage and `/api/health` work (we skip DB or don’t check it).
- Any route that **must** use the DB will hang or error: login (saving session), search page, dashboard after login, submit, and all APIs that use Prisma.

---

## 3. What Must Be True for Launch 🚀

### A. Environment variables in Vercel

In **Vercel → Your project → Settings → Environment Variables**, you must have at least:

| Variable | Required | Why |
|----------|----------|-----|
| `DATABASE_URL` | ✅ Yes | Supabase Postgres URL with **real password**. Without it, login and all DB features fail or hang. |
| `AUTH_SECRET` | ✅ Yes | Long random string (e.g. `openssl rand -base64 32`). Without it, NextAuth can refuse to run in production. |
| `NEXTAUTH_URL` | ✅ Yes | `https://prompthub-kappa.vercel.app` (your live domain). |
| `AUTH_URL` | ✅ Yes | Same as `NEXTAUTH_URL`. |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Same as `NEXTAUTH_URL`. |
| `GOOGLE_CLIENT_ID` | If using Google | From Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | If using Google | From Google Cloud Console. |
| `GITHUB_ID` | If using GitHub | From GitHub OAuth App. |
| `GITHUB_SECRET` | If using GitHub | From GitHub OAuth App. |

### B. Database

- **Migrations:** Run `npx prisma migrate deploy` **once** against the same `DATABASE_URL` you use in Vercel (your Supabase DB). If you haven’t, tables won’t exist and every DB call will fail.
- **Connection:** `DATABASE_URL` must be the **Supabase** connection string (postgresql://postgres:YOUR_PASSWORD@db.syujottrhrjpjhsatjas.supabase.co:5432/postgres). No typos, and password must be correct.

### C. OAuth callbacks

In Google and GitHub OAuth apps, the **authorization callback URL** must be:

- **Google:** `https://prompthub-kappa.vercel.app/api/auth/callback/google`
- **GitHub:** `https://prompthub-kappa.vercel.app/api/auth/callback/github`

If these are wrong or missing, “Sign in with Google” or “Sign in with GitHub” will fail after the provider redirects back.

---

## 4. Quick Checks You Can Do

1. **Vercel env:**  
   Vercel → Project → Settings → Environment Variables.  
   Confirm `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and the OAuth keys you use are set for **Production**.

2. **DB health:**  
   Open:  
   `https://prompthub-kappa.vercel.app/api/health?db=1`  
   - If it returns `{"status":"ok","database":"connected"}` → DB is reachable.  
   - If it times out or returns `"database":"degraded"` / 503 → fix `DATABASE_URL` and/or Supabase (password, network, migrations).

3. **Login:**  
   Go to `https://prompthub-kappa.vercel.app/login` and click “Sign in with Google” or “Sign in with GitHub”.  
   - If you end up on the dashboard → auth and DB are working.  
   - If you get an error or infinite redirect → check OAuth callback URLs and `NEXTAUTH_URL` / `AUTH_SECRET`.

4. **Submit:**  
   After logging in, go to `/submit` and create a prompt or skill.  
   - If it saves and you see it in Supabase (Table Editor) with `status: pending` → DB and submit flow work.  
   - To show it on the site, set that row’s `status` to `approved` in Supabase.

---

## 5. What’s “Stub” or Later (Optional for Launch)

These work for a soft launch but are not production-hardened:

| Item | Where | Meaning |
|------|--------|--------|
| **x402 payment verification** | `lib/x402.ts` | Premium payments: we accept any non-empty `X-PAYMENT` as “paid”. For real launch you’d verify with the x402 facilitator. |
| **Wallet link** | `app/api/user/wallet/route.ts` | We save the wallet address without verifying a signed message. For production you’d verify the user owns the wallet. |
| **Payout** | `app/api/user/payout/route.ts` | We update DB (earnings, transaction) but don’t send real money to the wallet. For production you’d add the actual on-chain transfer. |

You can go live without fixing these and add them later.

---

## 6. Summary: Launch Readiness

| If… | Then… |
|-----|--------|
| `DATABASE_URL` is set correctly in Vercel and migrations have been run | DB-dependent routes and login should work. Fix OAuth callbacks if login still fails. |
| `AUTH_SECRET` and `NEXTAUTH_URL` / `AUTH_URL` / `NEXT_PUBLIC_APP_URL` are set | NextAuth and redirects should work. |
| Google and GitHub callback URLs are correct | “Sign in with Google” and “Sign in with GitHub” should complete. |
| All of the above are done | Site is **ready for launch**; only optional improvements (x402, wallet verification, real payouts) remain. |

**Next step:** Confirm the three “Must be true” sections (env vars, database, OAuth callbacks), then re-test login and `/api/health?db=1`. If those pass, the site is ready for launch.
