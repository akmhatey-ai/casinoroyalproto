# Vercel auth setup (fix “Authentication error”)

To fix **Authentication error** / **Something went wrong during sign in** on Vercel, set these in the Vercel project and redeploy.

## 1. Environment variables (required)

In **Vercel → Your project → Settings → Environment Variables**, add:

| Variable | Description | Example |
|----------|-------------|--------|
| `AUTH_SECRET` | Secret for signing cookies/sessions. **Required in production.** | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your app (no trailing slash). | `https://your-app.vercel.app` |
| `DATABASE_URL` | Postgres connection string. Use Supabase **Transaction pooler** (port **6543**) for serverless. | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |

- Apply to **Production** (and Preview if you use auth there).
- After saving, **redeploy** so the build and runtime use the new values.

## 2. Migrations on deploy

The `build` script runs:

- `prisma generate`
- `prisma migrate deploy` (applies migrations to the DB)
- `next build`

So as long as `DATABASE_URL` is set in Vercel, each deploy will apply migrations. No need to run `npx prisma migrate deploy` by hand. (Local builds need `DATABASE_URL` in `.env` too, or run `next build` only.)

## 3. OAuth (optional)

For Google / GitHub / X sign-in, add in Vercel:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID` / `GITHUB_SECRET`
- `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET`

In each provider’s console, set the callback URL to:

`https://your-app.vercel.app/api/auth/callback/google` (or `/github`, `/twitter`).

## 4. Check config

After deploying, open:

**`https://your-app.vercel.app/api/auth-check`**

It returns JSON with `ok`, `databaseUrlSet`, `authSecretSet`, `nextAuthUrlSet`, `databaseConnected`. Use it to confirm nothing is missing.
