# Full diagnostic – why sign-in still fails

## What was checked (live site)

| Check | Result |
|-------|--------|
| **Homepage** | ✅ Loads |
| **GET /api/health** | ✅ Returns `{"status":"ok"}` |
| **GET /api/health?db=1** | ❌ **Timed out** → DB not reachable from Vercel |
| **GET /api/auth-check** | ❌ **404** → Latest code (auth-check route) not deployed |

## Root cause

1. **Database not reachable from Vercel**  
   `/api/health?db=1` times out. So either:
   - `DATABASE_URL` is not set in Vercel, or  
   - You’re using the **direct** Supabase URL (port 5432). In serverless (Vercel), that often hangs or fails. You must use the **Transaction pooler** URL (port 6543) for `DATABASE_URL` on Vercel.

2. **New code not deployed**  
   `/api/auth-check` returns 404, so the deployment doesn’t include the latest routes. You need to push and redeploy so the new auth-check and error handling are live.

3. **NextAuth needs the DB**  
   With `session: { strategy: "database" }` and `PrismaAdapter`, sign-in **requires** a working DB connection. If the DB is unreachable, the callback fails and you see “Authentication error”.

---

## Fix (do in this order)

### Step 1: Use Supabase Transaction pooler on Vercel

1. Open **Supabase** → your project → **Settings** → **Database**.
2. Under **Connection string**, select **URI**.
3. Choose **Transaction** (or “Use connection pooling” / port **6543**).
4. Copy the URI. It will look like:
   ```text
   postgresql://postgres.syujottrhrjpjhsatjas:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   (Region can differ, e.g. `us-west-1`; use what Supabase shows.)
5. In **Vercel** → your project → **Settings** → **Environment Variables**:
   - Set **DATABASE_URL** to this **pooler** URI (with your real password).
   - Apply to **Production** (and Preview if you use it).
6. **Redeploy** the project (Deployments → ⋮ → Redeploy, or push a new commit).

Keep using the **direct** URL (port 5432) in your **local** `.env` and for running `npx prisma migrate deploy`.

### Step 2: Push latest code and redeploy

From your project root:

```bash
git add -A
git status
git commit -m "Add diagnostic page and auth fixes"
git push origin main
```

Wait for Vercel to finish deploying.

### Step 3: Run migrations (if you haven’t)

On your machine, with **direct** `DATABASE_URL` in `.env` (Supabase, port 5432):

```bash
npx prisma migrate deploy
```

You only need to do this once per database.

### Step 4: Open the diagnostic page

After the new deploy is live, open:

**https://prompthub-kappa.vercel.app/diagnostic**

That page shows:

- Which env vars are set (no values, just yes/no).
- Whether the database is reachable and the exact error if not.

Fix anything that’s red or shows an error, then try sign-in again.

### Step 5: Confirm Vercel env

In Vercel → Settings → Environment Variables, for **Production** you should have:

| Variable | Required | Notes |
|----------|----------|--------|
| **DATABASE_URL** | ✅ | Supabase **Transaction pooler** URI (port 6543). |
| **AUTH_SECRET** | ✅ | Long random string (e.g. `openssl rand -base64 32`). |
| **NEXTAUTH_URL** | ✅ | `https://prompthub-kappa.vercel.app` |
| **AUTH_URL** | ✅ | `https://prompthub-kappa.vercel.app` or same as NEXTAUTH_URL. |
| **NEXT_PUBLIC_APP_URL** | ✅ | `https://prompthub-kappa.vercel.app` |
| **GITHUB_ID** | ✅ | GitHub OAuth app Client ID. |
| **GITHUB_SECRET** | ✅ | GitHub OAuth app Client secret. |

---

## Summary

- **DB timeout** → Use Supabase **Transaction pooler** (6543) for `DATABASE_URL` on Vercel.
- **404 on auth-check** → Push latest code and redeploy.
- **Auth error** → NextAuth + DB strategy needs a working DB; once the pooler URL is set and migrations are applied, sign-in should work.

After Step 1–4, use **/diagnostic** to confirm everything is green, then try “Sign in with GitHub” again.
