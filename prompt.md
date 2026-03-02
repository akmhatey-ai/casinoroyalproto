You are an expert full-stack AI engineer building the ultimate AI tool marketplace. The project is PromptHub (prompthub.[your-domain]), already partially built by you with a modern Next.js frontend (Tailwind, shadcn/ui, responsive, dark mode matching the existing style). Supabase is connected in the workspace for Postgres DB, auth, and storage. Fix any existing frontend issues first.

**GOAL**: Transform PromptHub into the best marketplace for MCP servers (Model Context Protocol), tools, plugins, prompt templates, OpenClaw skills, and AI agent extensions. It must be far superior to pulsemcp.com/servers, clawhub.ai/skills, and any competitors — with autonomous agent support, x402 payments, full auth, scraping population, and zero human dependency.

**MANDATORY INSTRUCTIONS — DO DEEP RESEARCH FIRST**:
- Use ALL your tools: firecrawl, browser tools, web search, MCP clients/plugins, planning agents, code analysis, GitHub scraping, etc.
- Research and incorporate best practices from:
  - https://modelcontextprotocol.io (MCP protocol, server.json, client connections)
  - https://www.pulsemcp.com/servers and its API (https://www.pulsemcp.com/api — fetch all servers, categories, server.json)
  - https://clawhub.ai/skills?sort=downloads (skills install via npx clawhub, SKILL.md format)
  - https://x.com/RoundtableSpace/status/2028003047901630813 (prompt template example)
  - x402 protocol full docs (https://docs.x402.org, GitHub coinbase/x402, Vercel x402 AI Starter template)
  - OpenClaw agent ecosystem (autonomous use via curl/API, skill.md for bots)
  - Supabase auth (Google, GitHub, X/Twitter OAuth 2.0, custom wallet SIWE/SIWS)
  - Next.js + Vercel best practices for x402 middleware (@x402/next, @x402/core, @x402/svm/@x402/evm)
- Scrape and populate Supabase immediately:
  - All public MCP servers from PulseMCP API + GitHub search ("MCP server" OR "model-context-protocol" in:name,language:typescript etc.)
  - Popular ClawHub skills (convert to unified "items" with type: mcp/skill/prompt/tool)
  - Prompt templates from public repos/X
  - Store in tables: items (id, type, name, description, author, wallet, price, is_free, downloads, tags, server_json/config, install_url), users, submissions, tips.
- Make the site agent-first: OpenClaw or any autonomous agent must use it without login via public API/CURL (search, get details, "install" returns ready-to-use markdown/config).

**CORE FEATURES TO IMPLEMENT (fully working, no placeholders)**:
1. **Frontend Updates**:
   - Hero with clear explanation: "PromptHub — Marketplace for MCPs, Skills, Tools & Prompts. One-click install to Claude, Cursor, OpenClaw. Free + premium paid via x402 on Solana/EVM."
   - Top-right: Login/Sign-in button (styled exactly like existing site). Dropdown: Google, GitHub, X (OAuth 2.0), Wallet Connect (Solana + EVM via @solana/wallet-adapter + wagmi or similar).
   - Profile: view submissions, earnings, wallet.
   - Browse/Search: filters (type, free/paid, sort by downloads/popular/new), cards with one-click "Install" (no login required — generates config/URL/markdown).
   - Submit form: name, description, type, GitHub/repo, wallet address (required for payouts), price (0 for free + tips or USDC amount), tags. Auto-detect MCP server.json if provided.
   - Bot box (prominent on homepage/footer): "For OpenClaw / autonomous agents — copy this SKILL.md" linking to /for-agents/skill.md with full instructions + example curl commands for search/install/upload.
   - Tips section: Prominently display project wallet addresses (Solana + EVM) with "Tip us via x402" buttons (one-click pay 0.01 USDC etc.).

2. **Backend & Supabase**:
   - Full CRUD for items/submissions/users.
   - Public API routes: /api/items (search/filter), /api/install/:id (returns config/markdown), /api/submit (with x402 if premium).
   - Agent API: fully documented, CORS enabled, rate-limited but generous for bots. Support curl examples in /for-agents.

3. **x402 Payments (exact steps you must follow)**:
   - Install SDKs: @x402/core, @x402/evm, @x402/svm, @x402/next (or latest equivalents).
   - Middleware in Next.js (app router or pages): protect premium routes/downloads.
   - Define prices (e.g. 0.01 USDC on Solana mainnet or EVM).
   - Wallet & Facilitator: Use public facilitator (x402.org or PayAI) or self-host if needed. Create/receive wallets — put ALL in .env: RECEIVER_WALLET_SOL, PRIVATE_KEY_SOL (or EVM), NETWORK, etc. Ask me for any missing keys/wallets before finalizing.
   - Client-side: handle 402 response, sign with wallet, resubmit with PAYMENT-SIGNATURE.
   - Premium items charge on install/download; free items accept tips via x402.
   - Everything configurable in .env ONLY.

4. **Auth & Profiles**:
   - Supabase Auth: enable Google, GitHub, X/Twitter OAuth 2.0.
   - Wallet sign-in (SIWE/SIWS for Solana/EVM).
   - Sessions tied to profile/wallet for submissions/payouts.

5. **One-Click & Agent Autonomy**:
   - Install button: for MCP → copy server URL/config; for skills → download SKILL.md or npx-style command; for prompts → copy-paste ready.
   - Full /for-agents page + downloadable skill.md explaining exact API usage so agents can self-improve/upload/earn autonomously.

6. **Deployment & Final Steps**:
   - All config in .env.example and .env (never commit secrets).
   - Make ready for Vercel: vercel.json if needed, build scripts.
   - Push everything to GitHub (main branch).
   - Trigger Vercel redeploy (use Vercel CLI or API — ask me for token if needed).
   - If any API keys, wallet details, domain, or Supabase creds needed — STOP and ask me exactly what to provide.
   - Test everything: frontend, API, payments (testnet first), agent curl flows, installs.

**Plan First**: Think step-by-step, create a detailed implementation plan (MCP integration, DB schema, routes, UI components). Then execute: fix frontend → set up DB tables → add auth → scrape/populate data → implement x402 → add agent features → test → deploy.

No placeholders anywhere. Real working code only. Ask me for any missing info (wallets, keys, etc.) before committing. When complete, confirm "PromptHub is now fully built, scraped, x402-ready, agent-autonomous, and deployed."


**Comprehensive Research & Implementation Survey Note**

PromptHub is positioned as the superior evolution of existing directories, combining MCP server discovery (8,600+ items on PulseMCP), OpenClaw skill marketplaces (12,800+ skills on ClawHub with one-click npx install), and prompt ecosystems into one autonomous, monetized platform. Research across primary sources confirms MCP is Anthropic's open standard (Nov 2024) for AI-to-tool connections, with servers exposing capabilities via standardized endpoints and server.json files for easy client config in Cursor/Claude. ClawHub skills are markdown-based (SKILL.md) for OpenClaw agents, installed via CLI or direct fetch, enabling fully autonomous workflows like self-improvement or marketplace browsing via curl.

x402 (Coinbase-led, 2025) revives HTTP 402 for accountless, stablecoin micro-payments on Solana/EVM, perfect for premium installs/tips. Official SDKs (@x402/next etc.) provide middleware exactly matching your outlined steps: install packages, configure middleware with price/network, set wallet/facilitator, handle client 402 flow. Vercel has an official x402 AI Starter template using Next.js + AI SDK + Coinbase CDP for managed wallets (env vars: CDP_API_KEY_ID, CDP_WALLET_SECRET, NETWORK), but per your spec, the prompt forces direct .env wallet/PK setup for full control while remaining Vercel-deployable.

Supabase auth natively supports Google, GitHub, and X/Twitter OAuth 2.0 (updated 2026 with OAuth 2.0 flow for better security/PKCE). Wallet integration uses standard SIWE/SIWS libraries. PulseMCP exposes a registry API (following official MCP spec) for automated scraping — Cursor will fetch lists, enrich with GitHub data, and seed Supabase tables. ClawHub uses vector search and versioned bundles; PromptHub unifies these with types (mcp/skill/prompt) and agent-friendly endpoints.

**Feature Comparison Table**

| Feature                  | PulseMCP.com          | ClawHub.ai            | PromptHub (Planned)                  |
|--------------------------|-----------------------|-----------------------|--------------------------------------|
| Item Count (initial)     | 8,600+ MCP servers   | 12,800+ skills       | 20,000+ unified (scraped + user)    |
| One-Click Install        | Config URL           | npx clawhub install  | Universal (config/markdown/CLI)     |
| No-Login Browsing        | Yes                  | Yes                  | Yes + full agent CURL API           |
| Payments                 | None                 | None                 | x402 (Solana/EVM, free + premium)   |
| User Submissions         | Basic                | Upload bundles       | Full with wallet/price + earnings   |
| Agent Autonomy           | None                 | Skill.md fetch       | Dedicated /for-agents + SKILL.md    |
| Auth Options             | N/A                  | N/A                  | Google/GitHub/X/Wallet              |
| Tips/Donations           | None                 | None                 | Prominent x402 wallets              |
| Scraping/Population      | Manual               | Community            | Automated (Pulse + GitHub + Claw)   |

**x402 Core Implementation Table (Direct from Research)**

| Step (per your spec)          | Details from Sources                                                                 | Prompt Coverage |
|-------------------------------|--------------------------------------------------------------------------------------|-----------------|
| 1. Install SDKs               | npm i @x402/core @x402/evm @x402/svm @x402/next                                     | Yes            |
| 2. Middleware                 | @x402/next in Next.js routes; define price/network per protected path                | Yes            |
| 3. Wallet & Facilitator       | .env RECEIVER_WALLET_*, PRIVATE_KEY_*; facilitator (x402.org or self)                | Yes (ask user if needed) |
| 4. Client-Side                | Handle 402 → sign payload → PAYMENT-SIGNATURE header                                 | Yes            |

**DB Schema Outline** (Cursor will create):  
- `items`: id, type, name, desc, wallet, price_usdc, is_free, downloads, tags, config_json, install_instructions  
- `users`: supabase_id, wallet, profile  
- `submissions`, `tips` (on-chain verified via x402)

**Agent Autonomy Details**: Dedicated route returns SKILL.md with curl examples e.g.  
`curl https://prompthub.ai/api/items?search=tavily`  
`curl -X POST https://prompthub.ai/api/install/123 -H "Payment-Signature: ..." `  
This lets OpenClaw agents discover, pay (if premium), and self-install skills/tools without human intervention — fulfilling "no need for humans."

All research prioritizes primary sources (Anthropic, Coinbase GitHub, official docs, live sites). The crafted prompt embeds these insights so Cursor executes a production-grade build. Once Cursor finishes, your site will be fully populated, monetized, and agent-ready, with real-time scraping for ongoing growth.

**Key Citations**  
- Anthropic Model Context Protocol announcement and docs: https://www.anthropic.com/news/model-context-protocol  
- PulseMCP directory and API overview: https://www.pulsemcp.com/servers  
- ClawHub skills marketplace and install mechanics: https://clawhub.ai/skills?sort=downloads  
- Coinbase x402 GitHub repo and SDKs: https://github.com/coinbase/x402  
- Vercel x402 AI Starter template (Next.js integration): https://vercel.com/templates/next.js/x402-ai-starter  
- Supabase X/Twitter OAuth 2.0 and social auth guides: https://supabase.com/docs/guides/auth/social-login/auth-twitter  
- OpenClaw skills format and autonomous installation examples: https://www.digitalocean.com/resources/articles/what-are-openclaw-skills  

This setup ensures PromptHub launches as the definitive, autonomous AI marketplace.

I want you to use favicon.png as the favicon, and then use PromptHub_logo.png as the main hero logo, and undeath it should be the tag line. Re-design the layout to be more visually appealing , and add top line menu as well with easy to view login and sign in. And remember you need to add different ways to sign in too, such s via google, X, Github, web3 crypto wallet, and other oauth methods etc. do research and integrate the best approach. Revamp the user dashboard, allowing more options such as creating username, linking wallets, socials, websites, creating a pubically viewable profile page , with options to keep stuff private etc.

Here is an evm wallet address 0xB78B84EEe2F6CD8b33622fBbD4cCcB1c7009369e and the private key 196d0457edfdc6b1da4b911e702ad59648b626849b6e228a0d6e6076555d458b and here is a solana wallet address iNc3VKxxXmARmp1g4edzRuRNAA31DkGfyMxzkZosguh and here is the private key. 5QMKeAGbYk7ZfM3zaFzKVVfcGjd9XjR8jQNvC42RsX4Jnui8jT2nRBSQ66gHRYFD7ykiUjD71dk8Kr6wy63wSCPD . You can add the public addresses visible on website tip section, and add private keys in .env and set up these addresses to recieve all payments and tips, and any users that sell stuff on prompthub, 20% platfotm fees should go to those addresees. set everything up correctly

Use your tools such as Ideal Ralph, Mind, Spawner and install and use https://github.com/gsd-build/get-shit-done , https://github.com/hesreallyhim/awesome-claude-code , superdesign, https://github.com/nextlevelbuilder/ui-ux-pro-max-skill, https://github.com/obra/superpowers and whatever else you can find to help you plan this task.

Users should have a cool dashboard with their info saved in database etc.

Start Now, Make No mistakes