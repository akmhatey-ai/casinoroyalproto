import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://prompthub.example.com";

export async function GET() {
  const body = `---
name: prompthub
description: Browse and install MCP servers, skills, and prompts from PromptHub. Use API to search, get install config, or download SKILL.md. Supports x402 for premium items.
metadata:
  openclaw:
    requires:
      bins: [curl]
---
# PromptHub API for agents

Base URL: ${baseUrl}

## Endpoints

### GET /api/items
Search and list items. No auth required.

Query params:
- q: search string
- type: mcp | skill | prompt | tool
- free: true | false
- sort: downloads | new
- limit: 1-100 (default 50)
- cursor: pagination
- format: skills.md (agent-friendly list with installUrl)

Examples:
  curl "${baseUrl}/api/items?q=tavily"
  curl "${baseUrl}/api/items?type=mcp&limit=20"
  curl "${baseUrl}/api/items?format=skills.md"

### GET /api/install/:id
Returns install config or content for item id.
- MCP: JSON with .cursor/mcp.json snippet
- Skill: SKILL.md body (or 402 + downloadUrl if premium)
- Prompt: JSON with copyPaste content

Example:
  curl "${baseUrl}/api/install/ITEM_ID"

### GET /api/items/:id/download
Download item content (e.g. SKILL.md). For premium skills returns 402 Payment Required; resubmit with X-PAYMENT header after paying via x402.

Example (free):
  curl "${baseUrl}/api/items/ITEM_ID/download" -o SKILL.md

Example (premium):
  curl -i "${baseUrl}/api/items/ITEM_ID/download"
  # If 402: complete payment, then:
  curl "${baseUrl}/api/items/ITEM_ID/download" -H "X-PAYMENT: <signature>" -o SKILL.md

## CORS
Access-Control-Allow-Origin: *
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="prompthub-skill.md"',
    },
  });
}
