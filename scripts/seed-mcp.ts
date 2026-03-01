/**
 * Seed items from Official MCP Registry (no auth required).
 * Run: npx tsx scripts/seed-mcp.ts
 * Requires DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";

const REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0.1/servers";
const LIMIT = 100;

type ServerDetail = {
  name: string;
  description?: string;
  title?: string;
  version?: string;
  websiteUrl?: string;
  repository?: { url?: string };
  packages?: Array<{ identifier?: string; transport?: { type?: string }; version?: string }>;
  remotes?: Array<{ type?: string; url?: string }>;
};

type RegistryResponse = {
  servers: Array< { server: ServerDetail; _meta?: unknown } >;
  metadata?: { nextCursor?: string; count?: number };
};

const prisma = new PrismaClient();

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200) || `mcp-${Date.now()}`;
}

async function fetchPage(cursor?: string): Promise<RegistryResponse> {
  const url = new URL(REGISTRY_URL);
  url.searchParams.set("limit", String(LIMIT));
  url.searchParams.set("version", "latest");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Registry fetch failed: ${res.status}`);
  return res.json() as Promise<RegistryResponse>;
}

async function main() {
  let cursor: string | undefined;
  let total = 0;
  do {
    const data = await fetchPage(cursor);
    const servers = data.servers ?? [];
    for (const { server } of servers) {
      const name = server.name || "Unnamed MCP";
      const slug = `mcp-${slugFromName(server.name)}`;
      const description = server.description ?? server.title ?? "MCP server";
      const installUrl =
        server.remotes?.[0]?.url ??
        (server.packages?.[0]?.identifier
          ? `npm:${server.packages[0].identifier}@${server.packages[0].version ?? "latest"}`
          : null);
      const repoUrl = typeof server.repository === "object" && server.repository?.url
        ? String(server.repository.url)
        : null;

      await prisma.item.upsert({
        where: { slug },
        create: {
          type: "mcp",
          name: server.title ?? name,
          slug,
          description,
          configJson: server as unknown as object,
          installUrl,
          repoUrl,
          status: "approved",
          isFree: true,
          tags: [],
        },
        update: {
          description,
          configJson: server as unknown as object,
          installUrl,
          repoUrl,
          updatedAt: new Date(),
        },
      });
      total += 1;
    }
    cursor = data.metadata?.nextCursor;
    if (servers.length < LIMIT) break;
  } while (cursor);

  console.log(`Seeded ${total} MCP servers from Official Registry.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
