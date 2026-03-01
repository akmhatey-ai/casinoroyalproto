# Auth Debug Report — PromptHub + NextAuth v5 + Prisma + Supabase + Vercel

This doc aligns the full diagnosis with **this codebase**: env names, routes, and checklist.

---

## 1. Likely root causes (order)

| # | Cause | Why |
|---|--------|-----|
| 1 | **Missing or wrong `AUTH_SECRET`** | Auth.js can't sign cookies/tokens → throws in callback |
| 2 | **DB tables don't exist** (migrations not applied) | PrismaAdapter writes to `accounts` → `P2021: table does not exist` |
| 3 | **Wrong `DATABASE_URL`** (direct vs pooler) | Supabase direct (5432) often fails from Vercel IPv4 → use **Transaction pooler (6543)** |
| 4 | **Wrong GitHub OAuth callback URL** | Must be exactly `https://<domain>/api/auth/callback/github` |
| 5 | **`NEXTAUTH_URL` / `AUTH_URL`** | This app sets `AUTH_URL` from `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL` in `auth.ts` |
| 6 | **Prisma not generated on Vercel** | This repo has `postinstall": "prisma generate"` in `package.json` ✓ |
| 7 | **Edge runtime** | This repo’s `middleware.ts` does **not** import `auth` or Prisma → no Edge split needed ✓ |

---

## 2. Diagnostic endpoints (this repo)

After deploy you should have:

| Endpoint | Purpose |
|----------|---------|
| `/diagnostic` | HTML page: env set/not set, DB connection, auth tables present |
| `/api/diagnostic` | JSON: `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL_prefix`, `GITHUB_ID`, `GITHUB_SECRET`, `db_connection`, `accounts_table`, `sessions_table` |
| `/api/auth-check` | JSON: `ok`, `databaseUrlSet`, `authSecretSet`, `nextAuthUrlSet`, `databaseConnected` |

If these return 404, the deployed branch may not include them — push and redeploy.

---

## 3. Env vars (this codebase)

**Auth** (`auth.ts`) uses:

- `GITHUB_ID` / `GITHUB_SECRET` (not `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google
- `AUTH_SECRET` or `NEXTAUTH_URL` / `NEXTAUTH_SECRET` (fallbacks)
- `AUTH_URL` is set from `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL` when missing

**Prisma** (`schema.prisma`):

- `DATABASE_URL` — runtime (use **pooler** on Vercel). For local migrations, run `npx prisma migrate deploy` with `DATABASE_URL` set to a reachable URL (direct or pooler).

---

## 4. Fix checklist

### A. Vercel environment variables (Production)

```
AUTH_SECRET       = <openssl rand -base64 32>
NEXTAUTH_URL      = https://prompthub-kappa.vercel.app
DATABASE_URL      = postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
GITHUB_ID         = <GitHub OAuth App Client ID>
GITHUB_SECRET     = <GitHub OAuth App Client Secret>
```

Optional: `NEXT_PUBLIC_APP_URL` = same as NEXTAUTH_URL. This app derives `AUTH_URL` from them.

### B. GitHub OAuth App

- **Authorization callback URL:** `https://prompthub-kappa.vercel.app/api/auth/callback/github` (exact, no trailing slash)

### C. Migrations

```bash
# Local: use DIRECT_URL or DATABASE_URL pointing at Supabase (direct or pooler)
npx prisma migrate deploy
```

### D. Redeploy

After any env change, redeploy so the new env is used.

---

## 5. Conclusion

Most likely causes for redirect to `/auth/error` after “Sign in with GitHub”:

1. **Tables missing** — run `npx prisma migrate deploy` against the same DB.
2. **`AUTH_SECRET` missing** in Vercel Production.
3. **`DATABASE_URL`** is Supabase direct (5432) instead of pooler (6543).

Use `/api/diagnostic` and `/diagnostic` after deploy to see which check fails.
