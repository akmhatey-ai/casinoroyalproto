# PromptHub Upgrade — Audit & Gaps vs SkillsMP

## 1.1 Audit: Existing Codebase

**Pages (app router):**
- `/` — Home (hero image, tagline, search form, Popular Prompts/Skills grids, agent box, tip section)
- `/search` — Search results (query + type filter)
- `/submit` — Submit form (prompts/skills/items)
- `/login` — Sign in (Google, GitHub, X, Wallet)
- `/dashboard`, `/dashboard/settings` — User dashboard, wallet, profile form
- `/profile/[username]` — Public profile (bio, links)
- `/prompts/[slug]`, `/skills/[slug]` — Detail pages
- `/for-agents`, `/for-agents/skill.md` — Agent API docs
- `/auth/error`, `/diagnostic` — Error/diagnostic

**Components:**
- Layout: AppShell, TopBar, SidebarRail
- UI: GlassCard, GlassPanel, HeroLogo, SearchInput, FilterPills, SectionHeader
- Auth: WalletConnectButton; Dashboard: ProfileForm, WalletLinkForm, WithdrawButton

**Data:**
- Prisma + Postgres (Supabase): User, Item, Prompt, Skill, Vote, Submission, Transaction, Tip, Account, Session
- Prompts/Skills have: title/name, slug, description, content, category?, isPremium, priceUsdCents, downloads, submitter
- No rating/stars field; no compatibility (Claude/GPT/Gemini) field on Prompt/Skill

**Styles:**
- globals.css: --bg-deep #09090b, --orange #ff9500, glass-card, Bricolage Grotesque + DM Sans

---

## 1.2 Gaps vs SkillsMP Feature Set

| Feature | PromptHub now | Target (SkillsMP-style) |
|--------|----------------|--------------------------|
| Nav links | Home, Search, Submit | Home, **Browse**, **Categories**, Submit, **Pricing** |
| Navbar search | Only on homepage | Search bar in navbar + **AI semantic toggle** |
| CTAs | "Login / Sign in" | **"Submit Prompt"** (orange) + **"Sign In"** (ghost) |
| Mobile nav | TopBar links (no hamburger) | **Hamburger menu** |
| Hero headline | Custom image + tagline | **"The World's Largest Prompt Marketplace"** + subheadline |
| Hero search | Form below hero | **Large centered hero search** |
| Stat counters | None | **10,000+ Prompts, 500+ Skills, Free & Premium** |
| Category pills | FilterPills (All, Prompts, Skills, Free, Premium) | **Category pills** (Coding, Writing, Marketing, etc.) |
| Card grid | 3-col, GlassCard | Same + **Category badge, Star/rating, Copy/Install on card** |
| Sort tabs | None | **Popular, New, Top Rated, Free** |
| Pagination / infinite scroll | None on home (fixed 6) | **Pagination or infinite scroll** on browse |
| Skeleton loading | None | **Skeleton states** for cards |
| Empty state | Plain text | **CTA empty state** |
| Categories page | None | **/categories** with grid + counts |
| Detail page | Has content | **Copy button, CLI snippet, Compatibility, Related, Report** |
| Search filters | type, q | **Sidebar: Category, Type, Price, Rating, Compatibility** + **URL-synced** |
| AI search | None | **AI Search toggle** (semantic) |
| Submit form | Basic | **Category, Tags, Compatibility checkboxes, Preview, Success screen** |
| Profile / Favorites | Profile exists | **My Favorites / bookmarking** |
| Pricing page | None | **/pricing** (Free | Pro | Premium) |
| Footer | None | **Full footer** (About, Categories, Submit, Pricing, GitHub, Twitter, Contact, disclaimer) |
| Toasts | None | **Toast for copy/install** |
| Design tokens | #09090b, #ff9500 | **#FF9000, #1B1B1B, #2B2B2B** (prompt spec) |

---

## 1.3 Tech Stack (Confirmed)

- **Next.js 16** (App Router), **React 19**, **Tailwind 4**, **Prisma** (Postgres via Supabase), **NextAuth 5**
