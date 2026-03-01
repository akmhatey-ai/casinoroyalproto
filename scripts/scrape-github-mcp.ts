/**
 * Scrape GitHub for MCP-related repos and upsert into Item (type: mcp).
 * Run: npx tsx scripts/scrape-github-mcp.ts
 * Optional: GITHUB_TOKEN for higher rate limits.
 */
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN?.trim();
const PER_PAGE = 30;
const MAX_PAGES = 3;

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200) || `mcp-${Date.now()}`;
}

async function searchRepos(page: number): Promise<{ full_name: string; default_branch: string; description: string | null }[]> {
  const q = "MCP server in:readme OR model context protocol in:readme";
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=${PER_PAGE}&page=${page}`;
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  const data = (await res.json()) as { items?: Array<{ full_name: string; default_branch: string; description: string | null }> };
  return data.items ?? [];
}

async function fetchServerJson(owner: string, repo: string, branch: string): Promise<Record<string, unknown> | null> {
  const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/server.json`;
  try {
    const res = await fetch(raw, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const text = await res.text();
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main() {
  let total = 0;
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const repos = await searchRepos(page);
    for (const r of repos) {
      const [owner, repo] = r.full_name.split("/");
      if (!owner || !repo || seen.has(r.full_name)) continue;
      seen.add(r.full_name);
      const branch = r.default_branch || "main";
      const config = await fetchServerJson(owner, repo, branch);
      if (!config) continue;
      const name = (config.name as string) ?? repo;
      const slug = `mcp-${slugFromName(name)}`;
      const description = (config.description as string) ?? r.description ?? "MCP server";
      const repoUrl = `https://github.com/${r.full_name}`;

      await prisma.item.upsert({
        where: { slug },
        create: {
          type: "mcp",
          name,
          slug,
          description,
          configJson: config as unknown as Prisma.InputJsonValue,
          repoUrl,
          status: "approved",
          isFree: true,
          tags: ["mcp", "github"],
        },
        update: {
          description,
          configJson: config as unknown as Prisma.InputJsonValue,
          repoUrl,
          updatedAt: new Date(),
        },
      });
      total += 1;
      console.log(`Upserted: ${name} (${r.full_name})`);
    }
    if (repos.length < PER_PAGE) break;
  }

  console.log(`Scraped ${total} MCP servers from GitHub.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
