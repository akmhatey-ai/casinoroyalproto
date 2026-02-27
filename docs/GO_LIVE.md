# PromptHub Backend — Go-Live Checklist

Full rundown of what’s done, what’s left, and what you need to do (including where to get API keys).

---

## 1. What’s Already Done (Backend)

| Area | Status | Notes |
|------|--------|------|
| **Database** | ✅ Ready | Prisma schema: User, Account, Session, Prompt, Skill, Transaction, Submission, Vote. PostgreSQL. |
| **Auth (NextAuth)** | ✅ Ready | Google + GitHub OAuth, Prisma adapter, session in DB, protected `/dashboard` and `/submit` in server layout/page. |
| **APIs** | ✅ Ready | Search, prompts CRUD, skills CRUD, skill download (free + 402 for premium), tip (402), vote, user wallet link, payout (stub), analytics, install redirect. |
| **x402 (payments)** | ⚠️ Stub | Returns 402 with payment requirements; accepts `X-PAYMENT` and credits user. **Verification is a stub** (any non-empty header = “paid”). Production needs real facilitator verification. |
| **Wallet link** | ⚠️ No signature check | Saves Solana/EVM address. **Production should verify a signed message** from the wallet before saving. |
| **Payout** | ⚠️ Stub | Decrements earnings and records a transaction. **No real on-chain transfer**; production needs to send funds to the user’s wallet. |
| **Agent API key** | ✅ Optional | `PROMPT_HUB_API_KEY`: if set, agent endpoints can require `X-API-Key`; if unset, requests are open. |

---

## 2. What You Must Do to Go Live

### 2.1 Get a PostgreSQL database

- **Option A – Supabase:** [Supabase](https://supabase.com) → New project → **Settings** → **Database** → **Connection string** (URI). Use **Session mode** (direct, port 5432) for running migrations; you can use the same or **Transaction mode** (pooler, port 6543) for the app. Set `DATABASE_URL` in Vercel and in `.env` locally.
- **Option B:** [Neon](https://neon.tech), [Vercel Postgres](https://vercel.com/storage/postgres), or any PostgreSQL host.

Put the URI in **Vercel** (and locally in `.env`):

- `DATABASE_URL=postgresql://...`

Then run migrations (see 2.5). **Health check:** `GET /api/health` returns 200 when the app is up; `GET /api/health?db=1` also checks DB connectivity.

---

### 2.2 Auth API keys (where to get them)

**Google OAuth**

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create or select a project.
3. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins:**  
   - Local: `http://localhost:3000`  
   - Production: `https://your-domain.com`
6. **Authorized redirect URIs:**  
   - Local: `http://localhost:3000/api/auth/callback/google`  
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client secret** → set in env as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

**GitHub OAuth**

1. Go to **[GitHub → Settings → Developer settings](https://github.com/settings/developers)**.
2. **OAuth Apps** → **New OAuth App**.
3. **Homepage URL:**  
   - Local: `http://localhost:3000`  
   - Production: `https://your-domain.com`
4. **Authorization callback URL:**  
   - Local: `http://localhost:3000/api/auth/callback/github`  
   - Production: `https://your-domain.com/api/auth/callback/github`
5. Copy **Client ID** and generate **Client secret** → set as `GITHUB_ID` and `GITHUB_SECRET`.

You can use only Google, only GitHub, or both. If you leave one pair empty, that provider is effectively disabled (empty string in code).

---

### 2.3 Required environment variables (Vercel + local)

| Variable | Required | Where / notes |
|----------|----------|----------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (Supabase, Neon, etc.). |
| `AUTH_SECRET` | ✅ Yes | Random secret for session signing. Generate: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` or `AUTH_URL` | ✅ Yes (prod) | Production: `https://your-domain.com`. Local: `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` | Optional | From Google Cloud Console (see above). |
| `GOOGLE_CLIENT_SECRET` | Optional | From Google Cloud Console. |
| `GITHUB_ID` | Optional | From GitHub OAuth App. |
| `GITHUB_SECRET` | Optional | From GitHub OAuth App. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Same as production URL (e.g. `https://your-domain.com`) for links and install URLs. |

Optional for later:

- `X402_FACILITATOR_URL`, `X402_PAY_TO_EVM`, `X402_PAY_TO_SOLANA`, `SOLANA_RPC_URL`, `EVM_RPC_URL` for real x402 payments.
- `PROMPT_HUB_API_KEY` if you want to lock agent APIs behind an API key.

---

### 2.4 Approving content (moderation)

Prompts and skills are created with `status: "pending"`. They only show in search and public pages when `status === "approved"`.

- **Current state:** There is no admin UI; approval is done in the database.
- **What you can do:**  
  - Manually set `status` to `approved` (or `rejected`) in Supabase/Neon table editor or via SQL.  
  - Or add a simple admin route (e.g. `/admin`) that lists pending items and sets `status` (we can add this later if you want).

---

### 2.5 Database migrations (first deploy)

After `DATABASE_URL` is set:

**Option A – Prisma Migrate (recommended for production)**  
On your machine (with `DATABASE_URL` in `.env`):

```bash
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "Add initial migration"
git push
```

Vercel does **not** run migrations automatically. Use either:

- **Vercel Postgres:** run migrations in a build step or from your laptop against prod `DATABASE_URL`, or use Vercel’s migration guide.  
- **Supabase/Neon:** run `prisma migrate deploy` from CI or from your machine once, pointing at the production `DATABASE_URL`.

**Option B – Deploy existing migrations (this repo)**  
This repo includes an initial migration in `prisma/migrations/20250227000000_init/`. After setting `DATABASE_URL` (e.g. to your Supabase URI), run:

```bash
npx prisma migrate deploy
```

**Option C – Push schema (quick start, no migration history)**  
If you prefer not to use migrations:

```bash
npx prisma db push
```

Use this for a quick prototype; for a real go-live, prefer **Option A/B** with `prisma migrate deploy` against production.

---

## 3. What’s Left for “Fully Production” (Optional / Later)

| Item | Who | Notes |
|------|-----|--------|
| **x402 payment verification** | Dev | Replace `verifyPayment()` in `lib/x402.ts` with a real call to the x402 facilitator so only real payments are accepted. |
| **Wallet link: verify signature** | Dev | Before saving `walletSolana` / `walletEvm`, require a signed message from the wallet and verify it (e.g. Solana wallet adapter + verify, or ethers `verifyMessage` for EVM). |
| **Payout: real transfer** | Dev | In `app/api/user/payout/route.ts`, after recording the transaction, call your Solana/EVM payout flow to send funds to the user’s wallet. |
| **Admin UI for moderation** | Dev | Optional: page or API to list pending prompts/skills and set `status` to approved/rejected. |
| **AUTH_SECRET in production** | You | Ensure a strong random value is set in Vercel (and never committed). |
| **OAuth redirect URLs** | You | Add production callback URLs in Google and GitHub (see 2.2). |

---

## 4. Quick Checklist (You)

- [ ] Create PostgreSQL DB (e.g. Supabase/Neon) and set `DATABASE_URL` in Vercel and locally.
- [ ] Run migrations (or `prisma db push`) so the schema exists.
- [ ] Generate `AUTH_SECRET` (`openssl rand -base64 32`) and set it in Vercel (and `.env` locally).
- [ ] Set `NEXTAUTH_URL` / `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL in Vercel.
- [ ] Create Google OAuth client and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel (if using Google).
- [ ] Create GitHub OAuth app and set `GITHUB_ID` and `GITHUB_SECRET` in Vercel (if using GitHub).
- [ ] Add production callback URLs in Google and GitHub (see 2.2).
- [ ] (Optional) Approve pending prompts/skills in the DB or add an admin flow later.

After that, the backend is ready for a normal go-live; x402 verification, wallet signature check, and real payouts can be added when you’re ready.
