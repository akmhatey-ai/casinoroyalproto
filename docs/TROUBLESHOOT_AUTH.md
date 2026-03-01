# Authentication Error Still Showing?

## 1. See the real error (after redeploy)

The app now captures the actual error and shows it on the error page. **Redeploy** (push to GitHub or Redeploy in Vercel), then try **Sign in with GitHub** again. On the error page you should see a box with **Error: Callback** and the real message (e.g. database connection failed).

## 2. Check auth setup

Open **https://prompthub-kappa.vercel.app/api/auth-check** in your browser. You want:

- `ok: true`
- `databaseUrlSet: true`
- `authSecretSet: true`
- `databaseConnected: true`

If `databaseConnected` is false, the DB is not reachable from Vercel.

## 3. Use Supabase Transaction pooler on Vercel

On Vercel, the **direct** connection (port 5432) can fail or run out of connections. Use the **Transaction pooler** URL instead:

1. In **Supabase** go to **Settings** → **Database**.
2. Under **Connection string**, choose **URI** and **Transaction** (or "Use connection pooling").
3. Copy the URL. It looks like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. In **Vercel** → **Environment Variables**, set **DATABASE_URL** to this pooler URL (with your real password).
5. **Redeploy**.

Keep using the **direct** URL (port 5432) in your **local** `.env` and for running `npx prisma migrate deploy`; use the **pooler** URL only in Vercel.

## 4. Checklist

- [ ] **Vercel** env: `DATABASE_URL` (pooler URL for Vercel), `AUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID`, `GITHUB_SECRET`
- [ ] **Migrations:** You ran `npx prisma migrate deploy` once against your Supabase DB (from your machine with the direct `DATABASE_URL`)
- [ ] **Redeploy** after changing env vars
- [ ] Try sign-in again and read the **error description** on the error page
