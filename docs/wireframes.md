# Prompt Hub — Wireframes / Site Map

## Site map
- `/` — Home (hero, search, categories, featured)
- `/search` — Search/listing (query, filters, cards)
- `/prompts/[slug]` — Prompt detail
- `/skills/[slug]` — Skill detail (one-click install)
- `/submit` — Submit prompt or skill (auth required)
- `/dashboard` — User dashboard (submissions, earnings, tips, settings)
- `/api/*` — Backend API (search, install, submit, tip, agent)

## Key flows
1. **Browse**: Home → Search → Detail → Install (free or pay with x402)
2. **Submit**: Sign in → Submit form → Pending → Dashboard
3. **Earnings**: Dashboard → Earnings → Withdraw to wallet
4. **Agent**: GET /api/search?q=…&format=skills.md → GET /api/install?skill_id=…
