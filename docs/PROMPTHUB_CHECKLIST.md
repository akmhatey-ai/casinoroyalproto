# PromptHub Implementation Checklist (from prompt.md)

Use this list to verify all requested items are complete. Reread before considering the task finished.

---

## ✅ Favicon & branding
- [x] **Favicon**: App uses `/prompthub-icon.png` as favicon (metadata in `app/layout.tsx`). To use `favicon.png`, add `public/favicon.png` and set `icons: { icon: "/favicon.png" }` in layout.
- [x] **Hero logo**: Hero uses `PromptHub_logo.png` with fallback to `prompthub-wordmark.png` via `components/ui/HeroLogo.tsx`. Add `public/PromptHub_logo.png` for custom main logo.
- [x] **Tagline**: Under hero: "Marketplace for MCPs, Skills, Tools & Prompts. One-click install to Claude, Cursor, OpenClaw. Free + premium paid via x402 on Solana/EVM."

---

## ✅ Layout & navigation
- [x] **Top-line menu**: `components/layout/TopBar.tsx` — sticky top bar with PromptHub logo, Home / Search / Submit, and Login / Sign in (or user dropdown).
- [x] **Easy login/sign in**: Single prominent "Login / Sign in" button in top bar linking to `/login`.
- [x] **Visually appealing layout**: Hero centered with logo + tagline; TopBar + SidebarRail; glass-style panels and consistent dark theme.

---

## ✅ Auth & sign-in methods
- [x] **Google OAuth**: Configured in `auth.ts` when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.
- [x] **GitHub OAuth**: Configured in `auth.ts` when `GITHUB_ID` and `GITHUB_SECRET` are set.
- [x] **X (Twitter) OAuth**: Configured in `auth.ts` when `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are set.
- [x] **Web3 / EVM wallet**: `WalletConnectButton` on login page; SIWE sign-in via NextAuth credentials provider ("wallet").
- [x] **Login page**: `/login` shows all enabled providers (Google, GitHub, X, Connect Wallet).

---

## ✅ Wallet & payments (.env)
- [x] **Public tip addresses on site**: `NEXT_PUBLIC_TIP_WALLET_SOL` and `NEXT_PUBLIC_TIP_WALLET_EVM` set in `.env`; homepage Tip section displays them.
- [x] **Receiver wallets**: `X402_PAY_TO_EVM`, `X402_PAY_TO_SOLANA`, `RECEIVER_WALLET_EVM`, `RECEIVER_WALLET_SOL` set in `.env` for receiving payments.
- [x] **Private keys in .env only**: `PRIVATE_KEY_EVM` and `PRIVATE_KEY_SOL` added to `.env` (never commit; `.env` is in `.gitignore`).
- [x] **20% platform fee**: `PLATFORM_FEE_PERCENT=20` in `.env`; documented in `.env.example`. (Application code that splits payments to platform vs creator should use this when implementing payouts.)
- [x] **x402 lib**: `lib/x402.ts` uses `X402_PAY_TO_*` and `RECEIVER_WALLET_*` for payTo.

---

## ✅ User dashboard & profile
- [x] **Cool dashboard**: Dashboard shows avatar, name, earnings, wallets, recent submissions, recent transactions; link to "View public profile" when username is set and profile is public.
- [x] **User info in DB**: Profile fields stored via Prisma: `username`, `bio`, `website`, `twitter`, `github`, `profilePublic`, plus existing `name`, `email`, `image`, `walletSolana`, `walletEvm`, `earningsCents`.
- [x] **Settings — username**: Profile form in Dashboard → Settings; username used for public profile URL.
- [x] **Settings — link wallets**: Wallet link form (Solana + EVM) in Settings.
- [x] **Settings — socials & website**: Profile form includes website, X (Twitter) handle, GitHub username.
- [x] **Public profile page**: `/profile/[username]` — shows bio, website, Twitter, GitHub; only visible when `profilePublic` is true.
- [x] **Privacy**: "Public profile" checkbox in Settings toggles `profilePublic` (show/hide profile at `/profile/username`).

---

## ✅ API & backend
- [x] **Profile API**: `GET/PATCH /api/user/profile` for reading/updating username, bio, website, twitter, github, profilePublic.
- [x] **Wallet API**: Existing `GET/POST /api/user/wallet` for linking Solana/EVM.
- [x] **Migration**: `prisma/migrations/20250301000000_add_user_profile_fields/migration.sql` adds `bio`, `website`, `twitter`, `github`, `profile_public` to `users`. Run `npx prisma migrate deploy` when DB is available.

---

## ✅ Tip section on homepage
- [x] **Prominent tip section**: Homepage has "Tip PromptHub" with wallet addresses.
- [x] **Public Solana address**: Shown when `NEXT_PUBLIC_TIP_WALLET_SOL` is set (set in `.env`).
- [x] **Public EVM address**: Shown when `NEXT_PUBLIC_TIP_WALLET_EVM` is set (set in `.env`).
- [x] **Tip via x402**: Link to "Tip 0.01 USDC via x402" (`/api/tip?amount=1`).

---

## Run & verify
- [x] **Build**: `npm run build` completes successfully.
- [ ] **Database**: Run `npx prisma migrate deploy` when Supabase is reachable to apply profile fields migration.
- [ ] **Dev**: Run `npm run dev` and test: home, login, dashboard, settings (profile + wallet), public profile, tip section.
- [ ] **OAuth**: Add Google/Twitter client IDs and secrets in Supabase/dashboards if not already set.

---

## Security note
**Private keys** were added to `.env` as requested. Ensure `.env` is never committed. If these keys were ever exposed (e.g. in a prompt or log), rotate them and update `.env` and any connected wallets.

---

## Optional next steps (from full prompt.md)
- Scrape PulseMCP / ClawHub and populate `items` table.
- Implement 20% platform fee split in payout/tip routes (credit 80% to seller, 20% to platform wallets).
- Add Solana SIWE for wallet sign-in (currently EVM only).
- Deploy to Vercel and set production env vars.
