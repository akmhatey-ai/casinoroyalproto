import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/fetch-server-json?repoUrl=https://github.com/owner/repo
 * Fetches server.json (or package.json with MCP config) from repo and returns name, description, config for submit form.
 */
export async function GET(req: NextRequest) {
  const repoUrl = req.nextUrl.searchParams.get("repoUrl")?.trim();
  if (!repoUrl) return NextResponse.json({ error: "repoUrl required" }, { status: 400 });
  let owner: string;
  let repo: string;
  try {
    const u = new URL(repoUrl);
    if (u.hostname !== "github.com") return NextResponse.json({ error: "Only GitHub repos supported" }, { status: 400 });
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    owner = parts[0];
    repo = (parts[1] ?? "").replace(/\.git$/, "");
    if (!owner || !repo) return NextResponse.json({ error: "Invalid GitHub repo URL" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const branches = ["main", "master", "HEAD"];
  const paths = ["server.json", "package.json"];
  for (const branch of branches) {
    for (const path of paths) {
      const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      try {
        const res = await fetch(raw, { headers: { Accept: "application/json" }, next: { revalidate: 60 } });
        if (!res.ok) continue;
        const text = await res.text();
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          continue;
        }
        if (path === "server.json") {
          const name = (data.name as string) ?? repo;
          const description = (data.description as string) ?? "";
          return NextResponse.json({ name, description, config: data, repoUrl });
        }
        // package.json: check for MCP / server config
        const name = (data.name as string) ?? repo;
        const description = (data.description as string) ?? "";
        const config = (data.mcp ?? data.server ?? data) as Record<string, unknown>;
        return NextResponse.json({ name, description, config: config && typeof config === "object" ? config : data, repoUrl });
      } catch {
        continue;
      }
    }
  }
  return NextResponse.json({ error: "No server.json or package.json found" }, { status: 404 });
}
