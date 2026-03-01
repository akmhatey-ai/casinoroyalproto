# MCP Registry, Protocol, and Integration Research

Research documentation covering PulseMCP API, MCP protocol, server.json format, and client configuration.

---

## 1. PulseMCP API

### Overview

PulseMCP provides a **Sub-Registry API** that implements the [Generic MCP Registry API specification](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/generic-registry-api.md) with extensions for enriched metadata (popularity, auth details, tools discovery, etc.).

- **Base URL (Production):** `https://api.pulsemcp.com`
- **API Version:** v0.1
- **Authentication:** API key + tenant ID (B2B; contact hello@pulsemcp.com)

### Authentication

| Header        | Required | Description                          |
|--------------|----------|--------------------------------------|
| `X-API-Key`  | Yes      | PulseMCP API key                     |
| `X-Tenant-ID`| Yes*     | Tenant identifier (*optional for health/ping/version) |

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v0.1/servers` | List MCP servers (paginated) |
| `GET` | `/v0.1/servers/{serverName}/versions` | List all versions of a server |
| `GET` | `/v0.1/servers/{serverName}/versions/{version}` | Get specific version (use `latest` for latest) |
| `GET` | `/v0.1/health` | Health check |
| `GET` | `/v0.1/ping` | Ping |
| `GET` | `/v0.1/version` | API version info |

### List Servers – Query Parameters

| Parameter      | Type    | Default | Description |
|----------------|---------|---------|-------------|
| `cursor`       | string  | —       | Pagination cursor from previous response |
| `limit`       | integer | 30      | Items per page (1–100) |
| `updated_since`| string (RFC3339) | — | Filter servers updated after timestamp |
| `search`       | string  | —       | Substring search in names/titles |
| `version`      | string  | —       | `latest` = only latest version per server; or exact version |

### How to Get All Servers

**Option A: Latest-only (for "install now" UIs)**

```bash
curl -X GET "https://api.pulsemcp.com/v0.1/servers?limit=100&version=latest" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Tenant-ID: YOUR_TENANT_ID"
```

**Option B: Full ETL with pagination**

```bash
# First page
curl -X GET "https://api.pulsemcp.com/v0.1/servers?limit=100" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Tenant-ID: YOUR_TENANT_ID"

# Next page (use nextCursor from response)
curl -X GET "https://api.pulsemcp.com/v0.1/servers?limit=100&cursor=NEXT_CURSOR" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Tenant-ID: YOUR_TENANT_ID"
```

**Option C: Incremental sync (updated since timestamp)**

```bash
curl -X GET "https://api.pulsemcp.com/v0.1/servers?limit=100&updated_since=2025-11-26T00:00:00Z" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Tenant-ID: YOUR_TENANT_ID"
```

### Categories

**Note:** The PulseMCP API documentation does not expose a `/categories` or taxonomy endpoint. Categories appear to be a website/UI concept (e.g., https://www.pulsemcp.com/servers). For categorization, use `search` or client-side filtering on server metadata (e.g., `description`, `title`).

### Rate Limits

| Window      | Limit      |
|------------|------------|
| Per minute | 200        |
| Per hour   | 5,000      |
| Per day    | 10,000     |

Response headers: `X-RateLimit-Limit-*`, `X-RateLimit-Remaining-*`

---

## 2. MCP Protocol (modelcontextprotocol.io)

### What is MCP?

The Model Context Protocol (MCP) is an open standard for connecting AI applications to external systems: data sources, tools, and workflows.

- **Spec:** https://modelcontextprotocol.io/specification/2025-11-25/
- **Docs index (LLMs):** https://modelcontextprotocol.io/llms.txt

### Core Concepts

- **Servers:** Expose tools, resources, and prompts.
- **Clients:** MCP hosts (Claude Desktop, Cursor, etc.) that connect to servers.
- **Transports:** stdio (local processes), SSE, Streamable HTTP (remote).

### Transports

| Transport        | Use case                    | Example                          |
|------------------|-----------------------------|-----------------------------------|
| `stdio`          | Local process               | `npx -y @modelcontextprotocol/server-filesystem` |
| `sse`            | Remote, Server-Sent Events  | `https://mcp.example.com/sse`     |
| `streamable-http`| Remote, HTTP streaming      | `https://mcp.example.com/mcp`     |

### Client Connections

- **Local servers:** Client spawns process and communicates over stdio.
- **Remote servers:** Client connects to URL (SSE or streamable-http).

---

## 3. server.json Format

### Schema

- **Schema URL:** `https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json` (and newer versions like `2025-12-11`)
- **Spec:** [Generic Server JSON](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/generic-server-json.md)

### Core Fields (ServerDetail)

| Field        | Required | Description |
|-------------|----------|-------------|
| `name`      | Yes      | Reverse-DNS name (e.g., `io.github.user/server-name`) |
| `description` | Yes    | Human-readable description |
| `version`   | Yes      | Version string (semver preferred) |
| `title`     | No       | Display name |
| `websiteUrl`| No       | Homepage/docs URL |
| `repository`| No       | `{ url, source, id?, subfolder? }` |
| `packages`  | No       | Array of package install options |
| `remotes`   | No       | Array of remote connection options |
| `icons`     | No       | Array of `{ src, sizes?, mimeType?, theme? }` |
| `_meta`     | No       | Extension metadata (reverse-DNS keys) |

### Package Object (for local install)

| Field                 | Required | Description |
|-----------------------|----------|-------------|
| `registryType`        | Yes      | `npm`, `pypi`, `oci`, `nuget`, `mcpb` |
| `identifier`         | Yes      | Package name or URL |
| `version`             | Yes      | Exact version (no ranges) |
| `transport`           | Yes      | `{ type: "stdio" }` or streamable-http/sse |
| `registryBaseUrl`     | No       | Registry base URL |
| `packageArguments`    | No       | CLI args (positional/named) |
| `environmentVariables`| No       | Env vars (name, description, isRequired, isSecret) |
| `runtimeHint`         | No       | `npx`, `uvx`, `docker`, `dnx` |

### Remote Object

| Field   | Required | Description |
|---------|----------|-------------|
| `type`  | Yes      | `sse` or `streamable-http` |
| `url`   | Yes      | Endpoint URL (may include `{variable}` placeholders) |
| `headers` | No     | Auth/header inputs |
| `variables` | No    | URL template variables |

### Example server.json (Remote)

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
  "name": "io.modelcontextprotocol.anonymous/mcp-fs",
  "description": "Cloud-hosted MCP filesystem server",
  "version": "2.0.0",
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://mcp-fs.example.com/mcp"
    },
    {
      "type": "sse",
      "url": "https://mcp-fs.example.com/sse"
    }
  ]
}
```

### Example server.json (Package/stdio)

```json
{
  "name": "io.github.modelcontextprotocol/filesystem",
  "description": "MCP server for filesystem operations",
  "version": "1.2.0",
  "packages": [
    {
      "registryType": "npm",
      "registryBaseUrl": "https://registry.npmjs.org",
      "identifier": "@modelcontextprotocol/server-filesystem",
      "version": "1.2.0",
      "transport": { "type": "stdio" },
      "packageArguments": [
        {
          "type": "positional",
          "valueHint": "target_dir",
          "description": "Path to access",
          "isRequired": true,
          "isRepeated": true
        }
      ]
    }
  ]
}
```

---

## 4. Data Structure – PulseMCP Server Response

### ServerResponse Wrapper

```json
{
  "server": { /* ServerDetail (server.json content) */ },
  "_meta": { /* PulseMCP enrichments */ }
}
```

### ServerList Response

```json
{
  "servers": [
    {
      "server": { /* ServerDetail */ },
      "_meta": { /* enrichments */ }
    }
  ],
  "metadata": {
    "nextCursor": "opaque-string-or-absent",
    "count": 30
  }
}
```

### PulseMCP Enrichments

**Server-level:** `_meta["com.pulsemcp/server"]`

| Field                         | Type    | Description |
|------------------------------|---------|-------------|
| `visitorsEstimateMostRecentWeek` | integer? | Unique visitors, last 7 days |
| `visitorsEstimateLastFourWeeks`   | integer? | Unique visitors, last 28 days |
| `visitorsEstimateTotal`         | integer? | All-time visitors |
| `isOfficial`                    | boolean | Maintained by service owner |

**Version-level:** `_meta["com.pulsemcp/server-version"]`

| Field         | Type   | Description |
|---------------|--------|-------------|
| `source`      | string | `registry.modelcontextprotocol.io` or `pulsemcp.com` |
| `status`      | string | `active`, `deprecated`, `deleted` |
| `publishedAt` | string | RFC3339 timestamp |
| `updatedAt`   | string | RFC3339 timestamp |
| `isLatest`    | bool   | True if this is the latest version |
| `previousName`| string?| Prior name if renamed |
| `nextName`    | string?| New name if renamed |
| `remotes[N]`  | object?| Per-remote enrichments |
| `packages[N]` | object?| Per-package enrichments |

**Per-remote/package enrichments (experimental):**

- `isSelfHosted` (boolean): Whether URL has templated hostname
- `authOptions`: Array of `{ type: "open"|"oauth"|"api_key"|"unknown", detail?: {...} }`
- `tools`: Array of MCP Tool objects (discovered by connecting)

---

## 5. How server.json Is Used for Client Config

### Purpose

`server.json` is the canonical metadata format for:

- Registry publishing
- Client discovery
- Installation and configuration

Clients use it to know how to install, run, or connect to an MCP server.

### Claude Desktop (Local)

Config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Format:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\user\\Desktop"],
      "env": { "BRAVE_API_KEY": "..." }
    }
  }
}
```

`server.json` → client maps `packages[].identifier` + `packageArguments` into `command`, `args`, and `env`.

### Cursor (Remote Example)

Config file: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=syujottrhrjpjhsatjas"
    }
  }
}
```

For remote servers, `server.json` `remotes[].url` is equivalent to the `url` in client config. Clients may also use `headers` for auth.

### Integration Flow

1. **Registry:** Client/app fetches `server.json` from registry (e.g., PulseMCP, Official MCP Registry).
2. **Resolution:** Client picks `packages[0]` or `remotes[0]` (or user-selected option).
3. **Local:** Client builds `command`/`args`/`env` from package + `packageArguments`/`environmentVariables`.
4. **Remote:** Client uses `remotes[].url` (and optionally `headers`/auth) to connect.

### Official MCP Registry (Comparison)

- **Base URL:** `https://registry.modelcontextprotocol.io`
- **Endpoints:** Same as Generic Registry API (`GET /v0.1/servers`, etc.)
- **Auth:** Unauthenticated read-only
- **Categories:** Not in the registry API; aggregators add their own taxonomies

---

## 6. Quick Reference

### PulseMCP API

```
Base:     https://api.pulsemcp.com
Auth:     X-API-Key, X-Tenant-ID
List:     GET /v0.1/servers?limit=100&version=latest
Versions: GET /v0.1/servers/{name}/versions
Single:   GET /v0.1/servers/{name}/versions/latest
```

### Official MCP Registry

```
Base:     https://registry.modelcontextprotocol.io
Auth:     None (read-only)
List:     GET /v0.1/servers?limit=100
```

### server.json Schema

```
Schema:   https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json
Spec:     https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/generic-server-json.md
```

### Client Config Examples

| Client           | Config Path                             | Local Shape              | Remote Shape     |
|------------------|-----------------------------------------|---------------------------|------------------|
| Claude Desktop   | `%APPDATA%\Claude\claude_desktop_config.json` | `command`, `args`, `env` | Custom Connectors (URL in UI) |
| Cursor           | `.cursor/mcp.json`                      | `command`, `args`         | `url`            |

---

## References

- [PulseMCP API](https://www.pulsemcp.com/api)
- [PulseMCP API Docs v0.1](https://www.pulsemcp.com/api/docs/v0.1)
- [Generic Registry API](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/generic-registry-api.md)
- [MCP Registry About](https://modelcontextprotocol.io/registry/about.md)
- [Generic Server JSON](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/generic-server-json.md)
- [MCP Registry Aggregators](https://modelcontextprotocol.io/registry/registry-aggregators.md)
- [Connect to Local MCP Servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers.md)
- [Connect to Remote MCP Servers](https://modelcontextprotocol.io/docs/develop/connect-remote-servers.md)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25/)
