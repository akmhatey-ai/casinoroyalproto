# PROMPTHUB UPGRADE CHECKLIST

Transform PromptHub into a world-class AI prompt & skill marketplace (SkillsMP-level). Orange + black brand.

---

## PHASE 1 — FOUNDATION & LAYOUT
- [x] 1.1  Audit existing codebase (pages, components, styles, data layer)
- [x] 1.2  Document current gaps vs SkillsMP feature set
- [x] 1.3  Confirm tech stack (Next.js / React / Tailwind / DB)
- [x] 1.4  Set up shared design tokens (orange: #FF9000, black: #1B1B1B, dark-gray: #2B2B2B)

## PHASE 2 — NAVIGATION & HEADER
- [x] 2.1  Add persistent top navbar with logo "PH" badge + "PromptHub" wordmark
- [x] 2.2  Add nav links: Home | Browse | Categories | Submit | Pricing
- [x] 2.3  Add search bar (keyword + AI semantic search toggle) in navbar
- [x] 2.4  Add CTA buttons: "Submit Prompt" (orange) + "Sign In" (ghost)
- [x] 2.5  Make navbar sticky/fixed on scroll
- [x] 2.6  Add mobile hamburger menu

## PHASE 3 — HOMEPAGE HERO
- [x] 3.1  Replace generic headline with bold hero: "The World's Largest Prompt Marketplace"
- [x] 3.2  Add subheadline: "Search, browse, and one-click install. Free and premium prompts & skills."
- [x] 3.3  Add hero search bar (large, centered, prominent)
- [x] 3.4  Add stat counters below hero (e.g., "10,000+ Prompts", "500+ Skills", "Free & Premium")
- [x] 3.5  Add category pill filters below search (All | Coding | Writing | Marketing | Data | DevOps | etc.)

## PHASE 4 — BROWSE / CARD GRID
- [ ] 4.1  Build responsive card grid (3 cols desktop, 2 tablet, 1 mobile)
- [ ] 4.2  Each card: Title, Description snippet, Category badge, Author, Star/rating, Free vs Premium badge, Copy/Install button
- [ ] 4.3  Add "Popular", "New", "Top Rated", "Free" sort tabs above grid
- [ ] 4.4  Add pagination or infinite scroll
- [ ] 4.5  Add skeleton loading states for cards
- [ ] 4.6  Add empty state with CTA when no results

## PHASE 5 — CATEGORIES PAGE
- [x] 5.1  Create /categories route
- [x] 5.2  Build category grid with icons (Coding, Writing, Marketing, Data, DevOps, Agent, Image Gen, Research, Productivity, Other)
- [x] 5.3  Show count of prompts per category
- [x] 5.4  Clicking category filters main browse page

## PHASE 6 — PROMPT / SKILL DETAIL PAGE
- [ ] 6.1  Create /prompt/[id] and /skill/[id] dynamic routes (or keep /prompts/[slug] /skills/[slug])
- [ ] 6.2  Show full prompt content with syntax highlighting
- [ ] 6.3  Add "Copy to Clipboard" one-click button
- [ ] 6.4  Add "Install via CLI" code snippet block
- [ ] 6.5  Show metadata: Author, Category, Tags, Compatibility (Claude/GPT/Gemini), Last updated, Stars
- [ ] 6.6  Add related prompts section at bottom
- [ ] 6.7  Add "Report" link

## PHASE 7 — SEARCH & FILTERING
- [ ] 7.1  Implement keyword search across title + description + tags
- [ ] 7.2  Add filter sidebar: Category, Type (Prompt/Skill), Price (Free/Premium), Rating, Compatibility
- [ ] 7.3  Add URL-synced filters (shareable search URLs)
- [ ] 7.4  Add "AI Search" toggle (semantic/natural language search)

## PHASE 8 — SUBMIT / UPLOAD FLOW
- [ ] 8.1  Create /submit page with form
- [ ] 8.2  Form fields: Title, Description, Full Prompt Content, Category, Tags, Type, Price, Compatibility checkboxes
- [ ] 8.3  Add preview before submit
- [ ] 8.4  Add success confirmation screen

## PHASE 9 — USER AUTH (if not present)
- [ ] 9.1  Add Sign Up / Login pages
- [ ] 9.2  Add user profile page (/profile)
- [ ] 9.3  Show user's submitted prompts on profile
- [ ] 9.4  Add "My Favorites" / bookmarking feature

## PHASE 10 — PRICING PAGE
- [x] 10.1 Create /pricing route
- [x] 10.2 Show 3-tier pricing: Free | Pro | Premium (keep x402 pay-per-use option)
- [x] 10.3 Style with orange highlight on recommended plan

## PHASE 11 — FOOTER
- [x] 11.1 Add full footer with links: About, Categories, Submit, Pricing, GitHub, Twitter/X, Contact
- [x] 11.2 Add "Not affiliated with Anthropic or OpenAI" disclaimer
- [x] 11.3 Keep orange + black brand in footer

## PHASE 12 — PERFORMANCE & POLISH
- [ ] 12.1 Add page meta tags + Open Graph for SEO
- [ ] 12.2 Add favicon matching PH brand
- [ ] 12.3 Ensure mobile responsiveness across all pages
- [ ] 12.4 Add smooth transitions/animations (subtle)
- [ ] 12.5 Add toast notifications for copy/install actions

## PHASE 13 — FINAL QA & VERIFICATION
- [ ] 13.1 Test all navigation links work
- [ ] 13.2 Test search + filter functionality
- [ ] 13.3 Test card grid on mobile, tablet, desktop
- [ ] 13.4 Test detail page routing
- [ ] 13.5 Test submit form
- [ ] 13.6 Test copy-to-clipboard on prompt detail
- [ ] 13.7 Visual QA: orange/black theme consistent throughout
- [ ] 13.8 Check no console errors
- [ ] 13.9 Confirm all checklist items above are ✅ completed
