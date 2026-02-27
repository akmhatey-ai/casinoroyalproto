# Prompt Hub

A directory of MCP (Model Context Protocol) tools, prompts, integrations, and SKILL.md files for AI agents. Users can search, browse, submit, and one-click install resources. Supports free and premium content with payments via the x402 protocol (Solana + EVM). Autonomous AI agents can search and install skills via API.

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` (PostgreSQL, e.g. Supabase or local)
   - Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET` for auth
   - Optionally set OAuth and x402 keys

3. **Database**
   ```bash
   npm run db:push
   # or for migrations: npm run db:migrate
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Development server
- `npm run build` / `npm run start` — Production
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema to DB (no migration files)
- `npm run db:migrate` — Create and run migrations

## Tech Stack

- **Framework:** Next.js 14+ (App Router), React, Tailwind CSS
- **DB:** Prisma + PostgreSQL (Supabase / Vercel Postgres)
- **Auth:** NextAuth.js + Solana/EVM wallet linking
- **Payments:** x402 (Solana + EVM stablecoins)

## API (for agents)

- `GET /api/search?q=...&type=prompt|skill&format=skills.md` — Search. Use `format=skills.md` for agent-friendly list with `installUrl` per skill. Optional header `X-API-Key` if `PROMPT_HUB_API_KEY` is set.
- `GET /api/install?skill_id=...` — Redirects to skill download. Use `GET /api/skills/[id]/download` for direct download (returns 402 for premium; send payment then retry with `X-PAYMENT` header).
- `POST /api/prompts/create`, `POST /api/skills/create` — Submit (NextAuth session required).
- `POST /api/tip` — Tip a user (body: `{ userId, amountCents }`); returns 402 with payment requirements or 200 if `X-PAYMENT` provided.

## Deployment

Deploy to Vercel:

1. Connect the repo and set root to this project.
2. Set environment variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (and `NEXTAUTH_URL`), optional OAuth and x402 keys.
3. Use Vercel Postgres or Supabase for the database; run `prisma db push` or migrations after first deploy.
4. Optional: set `PROMPT_HUB_API_KEY` for agent API access control.

## Features

- **Search & browse**: Prompts and SKILL.md skills with filters (type, free/premium).
- **One-click install**: Download free skills; premium skills return HTTP 402 with x402 payment requirements.
- **Submit**: Create prompts or skills (pending moderation).
- **Dashboard**: Earnings, wallet linking, submissions, withdraw stub.
- **Payments**: x402-compatible 402 responses; stub verification for development; tip and payout APIs.
- **Agent API**: `GET /api/search?format=skills.md`, `GET /api/install?skill_id=...`, optional API key.
- **Voting**: `POST /api/vote` for upvotes/ratings. **Analytics**: `GET /api/analytics` for site and user stats.
- **SEO**: Sitemap, Open Graph metadata.
