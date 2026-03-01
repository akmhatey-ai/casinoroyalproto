# Research: ClawHub, x402 Protocol, Vercel x402 AI Starter & OpenClaw

**Document Date:** March 1, 2026

---

## 1. ClawHub (clawhub.ai/skills)

### SKILL.md Format

A **SKILL.md** is a Markdown file with optional YAML frontmatter that defines an OpenClaw skill. Required placement: `{install_path}/skills/{skillname}/SKILL.md`.

**Structure:**
- **Triggers:** When to activate the skill
- **Instructions:** What the skill does (plain markdown, natural language)
- **Permissions:** Which tools the skill can access
- **Frontmatter metadata:** Extracted during publish for registry/search

**Basic frontmatter:**
```yaml
---
name: my-skill
description: Short summary of what this skill does.
version: 1.0.0
---
```

**Runtime metadata (`metadata.openclaw`):**
```yaml
---
name: todoist-cli
description: Manage Todoist tasks from the command line.
metadata:
  openclaw:
    requires:
      env:
        - TODOIST_API_KEY
      bins:
        - curl
    primaryEnv: TODOIST_API_KEY
    emoji: "✅"
    homepage: https://github.com/example/todoist-cli
---
```

| Field | Type | Description |
|-------|------|-------------|
| `requires.env` | `string[]` | Environment variables the skill expects |
| `requires.bins` | `string[]` | CLI binaries that must be installed |
| `requires.anyBins` | `string[]` | At least one of these binaries required |
| `requires.config` | `string[]` | Config file paths |
| `primaryEnv` | `string` | Main credential env var |
| `always` | `boolean` | If true, skill is always active |
| `skillKey` | `string` | Override invocation key |
| `install` | `array` | Install specs (brew, node, go, uv) |

**Install specs example:**
```yaml
metadata:
  openclaw:
    install:
      - kind: brew
        formula: jq
        bins: [jq]
      - kind: node
        package: typescript
        bins: [tsc]
```

### `npx clawhub install` Flow

**Prerequisites:**
- Node.js 18+
- Git
- `clawhub login` (GitHub OAuth)

**Commands:**
```bash
# Install a skill
clawhub install <skill-slug>

# Install specific version
clawhub install <skill>@<version>

# Install multiple skills
clawhub install skill1 skill2 skill3

# Search before installing
clawhub search "keyword"
clawhub install <slug>

# Other commands
clawhub list                # Show installed skills
clawhub uninstall <slug>    # Remove skill
clawhub inspect <skill>    # View details without installing
clawhub update --all       # Update installed skills
clawhub publish <path>     # Upload skill to registry
clawhub sync               # Sync local skills to registry
```

**Install into custom workdir:**
```bash
clawhub install <slug> --workdir /tmp/clawhub-demo --dir skills
```

### Skill Structure on Disk

- **Required:** `SKILL.md` (or `skill.md`)
- **Optional:** Supporting text-based files (JSON, YAML, JS, TS, SVG, etc.)
- **Optional:** `.clawhubignore`, `.gitignore`
- **CLI-written:** `/.clawhub/origin.json`, `/.clawhub/lock.json`

**Slug rules:** Lowercase, URL-safe: `^[a-z0-9][a-z0-9-]*$`

---

## 2. x402 Protocol (docs.x402.org, github.com/coinbase/x402)

### Overview

x402 is an open payment standard on HTTP. Uses `402 Payment Required` for accountless, programmatic payments. Supports micropayments and machine-to-machine payments (e.g., AI agents).

### SDK Package Names (npm)

| Package | Purpose |
|---------|---------|
| `@x402/core` | Transport-agnostic protocol implementation (client, server, facilitator) |
| `@x402/evm` | EVM (Ethereum, Base, etc.) payment scheme |
| `@x402/svm` | Solana payment scheme |
| `@x402/aptos` | Aptos payment scheme |
| @x402/next | Next.js middleware (paymentProxy, withX402) |
| @x402/express | Express.js payment middleware |
| @x402/hono | Hono payment middleware |
| @x402/fetch | Fetch client with auto payment handling |
| @x402/axios | Axios interceptor for payments |
| `@x402/paywall` | Paywall utilities |
| `@x402/extensions` | Protocol extensions |

**Minimal installs:**
```bash
# Client (fetch)
npm install @x402/core @x402/evm @x402/svm @x402/fetch

# Server (Express)
npm install @x402/core @x402/evm @x402/svm @x402/express

# Server (Next.js)
npm install @x402/core @x402/evm @x402/svm @x402/next
```

### Middleware Patterns

**Express:**
```typescript
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"  // testnet
});

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          { scheme: "exact", price: "$0.001", network: "eip155:84532", payTo: evmAddress },
          { scheme: "exact", price: "$0.001", network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", payTo: svmAddress },
        ],
        description: "Weather data",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient)
      .register("eip155:84532", new ExactEvmScheme())
      .register("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", new ExactSvmScheme()),
  ),
);
```

**Next.js – Option A: `paymentProxy`** (pages or multiple routes):
```typescript
// proxy.ts
import { paymentProxy } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:*", new ExactEvmScheme());
server.register("solana:*", new ExactSvmScheme());

export const proxy = paymentProxy(
  {
    "/protected": {
      accepts: [...],
      description: "Premium content",
      mimeType: "text/html",
    },
  },
  server,
);

export const config = { matcher: ["/protected/:path*"] };
```

**Next.js – Option B: `withX402`** (API routes, settles only on success):
```typescript
// app/api/weather/route.ts
import { withX402 } from "@x402/next";

export const GET = withX402(
  handler,
  { accepts: [...], description: "Weather API", mimeType: "application/json" },
  server,
);
```

**Hono:**
```typescript
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
// Same route config as Express
```

### Wallet Setup

**Buyers:**
- EVM: `viem` + `privateKeyToAccount(process.env.EVM_PRIVATE_KEY)`
- Solana: `@solana/kit` + `createKeyPairSignerFromBytes`
- Aptos: `@aptos-labs/ts-sdk` + `Account.fromPrivateKey`

**Sellers:**
- Any EVM or SVM wallet address for receiving payments
- Recommended: [CDP Wallet API](https://docs.cdp.coinbase.com/wallet-api-v2/docs/welcome)

**Client signer (EVM):**
```typescript
import { privateKeyToAccount } from "viem/accounts";
const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);
```

### Env Vars

| Variable | Purpose |
|----------|---------|
| `EVM_PRIVATE_KEY` | EVM buyer/signer private key |
| `SVM_PRIVATE_KEY` | Solana buyer private key (base58) |
| `APTOS_PRIVATE_KEY` | Aptos buyer private key |

**Mainnet facilitator:** `https://api.cdp.coinbase.com/platform/v2/x402`  
**Testnet facilitator:** `https://x402.org/facilitator`

### Network Identifiers (CAIP-2)

| Network | CAIP-2 |
|---------|--------|
| Base Mainnet | `eip155:8453` |
| Base Sepolia | `eip155:84532` |
| Solana Mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |

---

## 3. Vercel x402 AI Starter Template

**Repo:** https://github.com/vercel-labs/x402-ai-starter  
**Demo:** https://x402-ai-starter.vercel.app/  
**Template:** https://vercel.com/templates/next.js/x402-ai-starter

### Features

- AI Chat + API playground with x402
- AI agents that pay for tools
- Remote MCP server with paid tools
- Paywalled APIs and pages
- Server-managed wallets

### Tech Stack

- Next.js, AI SDK, AI Elements, AI Gateway, Coinbase CDP, x402

### Key Dependencies (from package.json)

```json
{
  "@coinbase/cdp-sdk": "^1.36.0",
  "@coinbase/x402": "^0.5.1",
  "x402-fetch": "^0.6.0",
  "x402-mcp": "0.0.5",
  "x402-next": "^0.6.0",
  "viem": "^2.37.3"
}
```

**Note:** Uses `@coinbase/x402` (bundled) and standalone `x402-*` packages rather than the granular `@x402/*` packages.

### Env Vars (.env.example)

```env
CDP_API_KEY_ID=
CDP_API_KEY_SECRET=
CDP_WALLET_SECRET=
```

**CDP credentials:** https://portal.cdp.coinbase.com  
**Mainnet:** Set `NETWORK=base`

### Getting Started

```bash
git clone https://github.com/vercel-labs/x402-ai-starter
cd x402-ai-starter
pnpm install
# Set CDP env vars in .env.local
pnpm dev
```

**Testing:** Uses Base Sepolia (testnet) with faucet for test USDC.

---

## 4. OpenClaw Autonomous Agent – Skill Installation

### CLI Installation

**ClawHub CLI:**
```bash
clawhub install <skill-slug>
clawhub install curl-http
```

**Playbooks (alternative):**
```bash
npx playbooks add skill openclaw/skills --skill curl-http
npx playbooks add skill openclaw/skills --skill api-tester
```

### REST API (Clawdbot-style)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/v1/status` | GET | Health + installed skills count |
| `GET /api/v1/skills` | GET | List installed skills |
| `POST /api/v1/skills/{skill}/execute` | POST | Execute a skill with params |
| `POST /api/v1/assistant/chat` | POST | Chat with AI assistant |

**Auth:** Bearer token in `Authorization` header.

### Agent curl Examples

**Execute a skill:**
```bash
curl -X POST "https://<clawdbot-instance>/api/v1/skills/curl-http/execute" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com", "method": "GET"}'
```

**Chat with assistant:**
```bash
curl -X POST "https://<clawdbot-instance>/api/v1/assistant/chat" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Install the curl-http skill"}'
```

**List skills:**
```bash
curl -X GET "https://<clawdbot-instance>/api/v1/skills" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Skill Installation via API

Installation is usually done via **CLI** (`clawhub install`), not a REST endpoint. The agent would:

1. Call the chat endpoint to request skill installation
2. Or run `clawhub install <slug>` in a shell environment
3. Or use Playbooks: `npx playbooks add skill openclaw/skills --skill <name>`

### Building Custom REST API Skills

```bash
npm i -g @openclaw/cli
npx openclaw-cli init-skill my-api-skill
```

Define `manifest.json` and `index.mjs` handler; use `ctx.secrets` for API keys.

---

## Quick Reference Summary

| Topic | Key Items |
|-------|-----------|
| **x402 SDKs** | `@x402/core`, `@x402/evm`, `@x402/svm`, `@x402/next`, `@x402/express`, `@x402/fetch`, `@x402/axios` |
| **x402 middleware** | `paymentMiddleware`, `paymentProxy`, `withX402` |
| **x402 wallet** | `EVM_PRIVATE_KEY`, CDP Wallet API, viem `privateKeyToAccount` |
| **x402 env** | `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `CDP_WALLET_SECRET`, `NETWORK` |
| **ClawHub SKILL.md** | Frontmatter: name, description, metadata.openclaw (requires.env, requires.bins) |
| **ClawHub install** | `clawhub install <slug>`, `clawhub login` first |
| **OpenClaw agent** | `POST /api/v1/skills/{skill}/execute`, Bearer token auth |
| **x402 facilitators** | Testnet: `https://x402.org/facilitator`, Mainnet: `https://api.cdp.coinbase.com/platform/v2/x402` |

---

## Sources

- [ClawHub](https://clawhub.ai) · [GitHub](https://github.com/openclaw/clawhub)
- [x402 docs](https://docs.x402.org) · [x402 GitHub](https://github.com/coinbase/x402)
- [Vercel x402 AI Starter](https://github.com/vercel-labs/x402-ai-starter)
- [OpenClaw / Clawdbot docs](https://docs.clawd.bot)
- [Clawdbot API](https://getclawdbot.org/docs/api)
- [OpenClaw Hub Installation Guide](https://openclaw-hub.org/openclaw-hub-how-to-install.html)
