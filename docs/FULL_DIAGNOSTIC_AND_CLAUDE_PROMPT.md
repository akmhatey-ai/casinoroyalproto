# Full Diagnostic & Claude Bot Prompt

## Research summary (what usually breaks)

- **NextAuth v5 (Auth.js) + Prisma + Vercel:** Most production failures are from (1) **AUTH_SECRET** not set in Vercel, (2) **DATABASE_URL** unreachable (Supabase direct connection is IPv6; Vercel is IPv4 → use **pooler** URL), (3) **Prisma migrations not applied** (no `users`/`accounts`/`sessions` tables), (4) **OAuth callback URL mismatch** (must be exactly `https://<your-domain>/api/auth/callback/github` in GitHub app).
- **Adapter errors:** `adapter_error_getUserByAccount` or callback failures often mean the DB is unreachable at callback time, or the Prisma client isn’t initialized in the serverless environment.
- **Supabase + Vercel:** Use **Transaction pooler** (port 6543) or **Session pooler** (port 5432) in `DATABASE_URL` on Vercel — **not** the direct connection. Session pooler is IPv4-compatible; direct can show “Not IPv4 compatible.”

---

## Full diagnostic run-through (you do this)

1. **Open the app’s diagnostic page**  
   - Go to: `https://<YOUR_VERCEL_DOMAIN>/diagnostic`  
   - Check: all env vars green, “Database: Connected”, “Auth tables present”.  
   - If “Auth tables missing”, run `npx prisma migrate deploy` locally with the same DB (use direct/pooler URL in `.env`), then redeploy.

2. **Open the auth-check API**  
   - Go to: `https://<YOUR_VERCEL_DOMAIN>/api/auth-check`  
   - You want: `ok: true`, `databaseConnected: true`.  
   - If not, fix the suggested items (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, pooler).

2b. **JSON diagnostic (this repo)**  
   - Go to: `https://<YOUR_VERCEL_DOMAIN>/api/diagnostic`  
   - Returns: `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL_prefix`, `GITHUB_ID`, `GITHUB_SECRET`, `db_connection`, `accounts_table`, `sessions_table`. Use this if the HTML `/diagnostic` page is not deployed.

3. **Try sign-in and read the error**  
   - Click “Sign in with GitHub”.  
   - If you’re sent to `/auth/error`, the page should show **Error: Callback** and an **error_description** (the real message).  
   - Use that message (e.g. “Can’t reach database”, “getUserByAccount”, “relation \"users\" does not exist”) to target the fix.

4. **Checklist**  
   - [ ] Vercel env: `DATABASE_URL` = Supabase **pooler** URI (Transaction 6543 or Session 5432), `AUTH_SECRET`, `NEXTAUTH_URL` (or `AUTH_URL` / `NEXT_PUBLIC_APP_URL`), `GITHUB_ID`, `GITHUB_SECRET`. This app uses **GITHUB_ID** / **GITHUB_SECRET** (not AUTH_GITHUB_*).  
   - [ ] GitHub OAuth app: Authorization callback URL = `https://<YOUR_VERCEL_DOMAIN>/api/auth/callback/github`.  
   - [ ] Migrations applied: `npx prisma migrate deploy` run once against the same Supabase DB (with `DATABASE_URL` set to a reachable URL).  
   - [ ] Redeploy after any env change.

---

## Full prompt for Claude bot (copy-paste this whole block)

Use this as a **single, self-contained prompt** in a new chat with Claude. Replace `<YOUR_VERCEL_DOMAIN>` (and optionally the repo path) with your real values.

```
I have a Next.js 16 App Router app deployed on Vercel (domain: https://<YOUR_VERCEL_DOMAIN>) using NextAuth v5 (Auth.js), Prisma, and PostgreSQL (Supabase). Sign-in with GitHub fails: after clicking "Sign in with GitHub" the user is redirected to /auth/error with "Something went wrong during sign in."

Please do the following in order:

1) Research
- Search the web for common causes of NextAuth v5 + Prisma + Supabase + Vercel "Authentication error" or CallbackRouteError (e.g. AUTH_SECRET, DATABASE_URL pooler vs direct, migrations not applied, OAuth callback URL).

2) Run a full diagnostic
- Open and summarize what these URLs return (use fetch or browser):
  - https://<YOUR_VERCEL_DOMAIN>/diagnostic  (env vars + DB + auth tables)
  - https://<YOUR_VERCEL_DOMAIN>/api/auth-check  (ok, databaseConnected, etc.)
  - Optionally: https://<YOUR_VERCEL_DOMAIN>/api/health?db=1
- If any return 404, note that the deployment may not have these routes and list what the app does have (e.g. /login, /api/auth/*).

3) Verify in the codebase
- Confirm: auth config (auth.ts) uses PrismaAdapter(prisma), session strategy is "database", and AUTH_URL/NEXTAUTH_URL are used so the OAuth redirect_uri is correct.
- Confirm: prisma/schema.prisma has User, Account, Session, VerificationToken models and that migrations exist (e.g. prisma/migrations/*/migration.sql creates users, accounts, sessions).
- Confirm: app/api/auth/[...nextauth]/route.ts catches errors and redirects to /auth/error with error_description so the real error is visible.

4) Checklist to fix the fault
- Ensure Vercel has: DATABASE_URL = Supabase pooler URI (Transaction port 6543 or Session port 5432; not direct if IPv4 issues), AUTH_SECRET, NEXTAUTH_URL (or NEXT_PUBLIC_APP_URL), GITHUB_ID, GITHUB_SECRET — all for Production.
- Ensure GitHub OAuth app callback URL is exactly: https://<YOUR_VERCEL_DOMAIN>/api/auth/callback/github.
- Ensure migrations are applied: run `npx prisma migrate deploy` once against the same Supabase DB (from a machine that can reach the DB).
- After any env change, redeploy.

5) Conclusion
- State the most likely cause of the auth error given the diagnostic output and research.
- Propose concrete code or config changes if needed (e.g. add directUrl for migrations, fix env names, or add a tables-exist check on /diagnostic).
```

---

## After you run the Claude prompt

- Replace `<YOUR_VERCEL_DOMAIN>` with your real domain (e.g. `prompthub-kappa.vercel.app`).
- Paste the full prompt into a new Claude chat and let it run the steps.
- Use the diagnostic URLs and checklist it produces to fix the fault; then redeploy and try sign-in again.
