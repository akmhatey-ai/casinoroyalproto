# VERCEL DEPLOY DEBUG CHECKLIST

## PHASE 1 — DIAGNOSIS
- [x] 1.1  No `output: 'standalone'` or `output: 'export'` in next.config
- [x] 1.2  **Root cause:** 26 API route files → **over Vercel Hobby 12-function limit** (deploy fails with internal error)
- [x] 1.3  No .nvmrc / .node-version conflict
- [x] 1.4  .gitignore has .env* (secrets not committed)

## PHASE 2 — package.json
- [x] 2.1  engines.node set to "20.x"

## PHASE 3 — vercel.json
- [x] 3.1  Valid vercel.json (version 2, buildCommand, installCommand)

## PHASE 4 — next.config
- [x] 4.1  No output: 'standalone' or 'export'
- [x] 4.2  serverExternalPackages: ["@prisma/client"]
- [x] 4.3  reactStrictMode: true

## PHASE 5 — Function count (Hobby ≤ 12)
- [x] 5.1  Consolidated API to **3 functions**: `auth/[...nextauth]`, `auth/siwe-nonce`, `api/[...path]` (catch-all). All other API logic moved to `lib/api/handlers/*`.

## PHASE 6 — .vercelignore
- [x] 6.1  Added .vercelignore

## PHASE 7–10
- [ ] 7.1  Add env vars in Vercel dashboard (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, etc.)
- [x] 8.1  Clean rebuild: rm -rf .next && npm run build — **build passes**
- [ ] 10.1  Push and verify deployment

---

## Stubbed handlers (501 until implemented)

These handlers in `lib/api/handlers/` currently re-export from `_stub.ts` and return 501. Replace with real logic (copy from git history of deleted `app/api/*/route.ts` files) when needed:

- user-payout, items, items-id-download, prompts, prompts-id, prompts-create, skills, skills-id, skills-id-download, skills-create, submit, tip, vote, search, install, install-id, analytics, fetch-server-json, for-agents-skill-md

**Fully implemented:** health, auth-check, diagnostic, user-wallet, user-profile.
