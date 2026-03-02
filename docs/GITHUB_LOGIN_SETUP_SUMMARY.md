# Full Summary: Login Problems Getting GitHub Sign-In to Connect

This document explains the main issues that stop “Sign in with GitHub” from working (especially on Vercel) and how to fix them step by step.

---

## What’s Going On

The app uses **NextAuth (Auth.js)** with **GitHub** as an OAuth provider. When you click “Sign in with GitHub”:

1. You are sent to GitHub to approve the app.
2. GitHub sends you back to your app at a **callback URL**.
3. NextAuth uses that callback to create or update your user and session, and it needs:
   - A **secret** to sign cookies (`AUTH_SECRET`).
   - A **database** so it can store users, accounts, and sessions (Prisma + PostgreSQL/Supabase).
   - The **exact same callback URL** configured in both GitHub and your app (`NEXTAUTH_URL` / `AUTH_URL`).

If any of these are missing or wrong, you get an **Authentication error** and are sent to `/auth/error` instead of the dashboard.

---

## The Main Problems (and Why They Happen)

### 1. **Missing or wrong `AUTH_SECRET`**

- **What it is:** A secret key used to sign and verify session cookies.
- **What goes wrong:** If `AUTH_SECRET` is not set in production (e.g. on Vercel), NextAuth cannot sign the session after GitHub redirects back. The callback then fails and you see “Authentication error” or “Configuration” / “Callback” errors.
- **Fix:** Generate a value and set it in Vercel (and in `.env` locally):
  - Run: `openssl rand -base64 32`
  - In Vercel: **Project → Settings → Environment Variables** → add `AUTH_SECRET` with that value for **Production** (and Preview if you use it).

---

### 2. **Database not reachable or tables missing**

- **What it is:** NextAuth uses the **Prisma adapter** and stores users, accounts, and sessions in PostgreSQL (Supabase). The callback step reads/writes these tables.
- **What goes wrong:**
  - **Migrations not run:** If `users`, `accounts`, and `sessions` tables don’t exist, the adapter throws (e.g. “table does not exist”) and the callback fails.
  - **Wrong or unreachable `DATABASE_URL`:** On Vercel, Supabase’s **direct** connection (port 5432) can fail (e.g. IPv4 vs IPv6). If the app can’t reach the database at all, the callback fails.
- **Fix:**
  - Use the **Supabase Transaction pooler** URL (port **6543**) for `DATABASE_URL` on Vercel. You get this in Supabase: **Settings → Database → Connection string** (choose “Transaction” / pooler).
  - Ensure migrations have been applied. The project’s build runs `prisma migrate deploy`, so once `DATABASE_URL` is set in Vercel and you deploy, migrations should run. Locally, run: `npx prisma migrate deploy` (with `DATABASE_URL` in `.env`).

---

### 3. **Wrong or missing `NEXTAUTH_URL` (or `AUTH_URL`)**

- **What it is:** The full URL of your app (e.g. `https://your-app.vercel.app`) with **no trailing slash**. NextAuth uses it to build the callback URL that GitHub redirects to.
- **What goes wrong:** If this is wrong or missing in production, the callback URL NextAuth sends to GitHub doesn’t match what your app actually uses. GitHub may redirect to the wrong place, or NextAuth may reject the callback.
- **Fix:** In Vercel, set **`NEXTAUTH_URL`** to your real app URL, e.g. `https://prompthub-kappa.vercel.app`. (The app also uses `AUTH_URL` / `NEXT_PUBLIC_APP_URL`; setting `NEXTAUTH_URL` is the main one for OAuth.)

---

### 4. **GitHub OAuth callback URL doesn’t match**

- **What it is:** In your **GitHub OAuth App** settings, you must set the **Authorization callback URL** to exactly where NextAuth expects:  
  `https://<your-domain>/api/auth/callback/github`
- **What goes wrong:** If the callback URL in GitHub is different (wrong domain, typo, trailing slash, or missing), GitHub redirects to a URL your app doesn’t handle the same way, and sign-in fails.
- **Fix:**
  - In **GitHub**: **Settings → Developer settings → OAuth Apps** → your app (or create one).
  - Set **Authorization callback URL** to exactly:  
    `https://<your-vercel-domain>/api/auth/callback/github`  
    (e.g. `https://prompthub-kappa.vercel.app/api/auth/callback/github`).
  - No trailing slash. Use `https://` and the same domain as `NEXTAUTH_URL`.

---

### 5. **Missing or wrong `GITHUB_ID` / `GITHUB_SECRET`**

- **What it is:** The app uses **`GITHUB_ID`** and **`GITHUB_SECRET`** (from your GitHub OAuth App). These must be set where the app runs (e.g. Vercel).
- **What goes wrong:** If either is missing or wrong, NextAuth can’t complete the OAuth flow with GitHub and sign-in fails.
- **Fix:**
  - In GitHub OAuth App: copy **Client ID** → set as **`GITHUB_ID`** in Vercel. Generate **Client secret** → set as **`GITHUB_SECRET`** in Vercel.
  - Use **Production** (and Preview if you test there). Redeploy after changing env vars.

---

## Step-by-Step Checklist to Get GitHub Login Working

1. **Vercel environment variables**  
   In **Vercel → Your project → Settings → Environment Variables**, add (for Production, and Preview if needed):

   | Variable         | Value |
   |------------------|--------|
   | `AUTH_SECRET`    | Output of `openssl rand -base64 32` |
   | `NEXTAUTH_URL`   | Your app URL, no trailing slash (e.g. `https://prompthub-kappa.vercel.app`) |
   | `DATABASE_URL`   | Supabase **Transaction pooler** URL (port 6543) |
   | `GITHUB_ID`      | GitHub OAuth App **Client ID** |
   | `GITHUB_SECRET`  | GitHub OAuth App **Client secret** |

2. **GitHub OAuth App**  
   - **Authorization callback URL:**  
     `https://<your-vercel-domain>/api/auth/callback/github`  
     (exactly, no trailing slash).

3. **Database**  
   - Use the pooler `DATABASE_URL` from step 1.  
   - Deploy (or run `npx prisma migrate deploy` locally) so migrations run and `users`, `accounts`, `sessions` exist.

4. **Redeploy**  
   After changing any env var or callback URL, trigger a new deployment so the app uses the new config.

5. **Verify**  
   - Open: `https://<your-app>/api/auth-check`  
     You should see something like `ok: true`, `databaseConnected: true`, `authSecretSet: true`, `nextAuthUrlSet: true`.  
   - Then try “Sign in with GitHub” again.

---

## If It Still Fails

- Check **`/auth/error`** (and the URL query params). The page shows an error type (e.g. **Configuration**, **Callback**, **Default**) and a short hint.
- **Configuration** → usually `AUTH_SECRET` or `NEXTAUTH_URL` (or base URL) wrong or missing.
- **Callback** → often database (unreachable or tables missing) or `AUTH_SECRET`; sometimes adapter/Prisma errors.
- **Default** → generic sign-in failure; still often database or env (e.g. `DATABASE_URL`, migrations, `AUTH_SECRET`).

Use **`/api/auth-check`** and **`/api/diagnostic`** (or **`/diagnostic`** if available) to confirm that the server sees the right env and can reach the database. That will tell you whether the problem is connection/config (env + DB + GitHub callback) rather than application code.

---

## Short Recap

- **GitHub login fails** when: (1) `AUTH_SECRET` is missing in production, (2) the database is unreachable or migrations aren’t applied, (3) `NEXTAUTH_URL` is wrong or missing, or (4) the **GitHub OAuth callback URL** doesn’t exactly match `https://<your-domain>/api/auth/callback/github`, or (5) `GITHUB_ID` / `GITHUB_SECRET` are missing or wrong.
- Fix by: setting all of the above in Vercel, using the Supabase **pooler** URL, applying migrations, setting the **exact** callback URL in GitHub, and redeploying. Then confirm with `/api/auth-check` and try “Sign in with GitHub” again.
