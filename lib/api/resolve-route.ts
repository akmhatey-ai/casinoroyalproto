/**
 * Resolves API path segments to a handler module key and params.
 * Used by the catch-all /api/[...path] to stay under Vercel Hobby 12-function limit.
 */
export function resolveRoute(
  path: string[]
): { moduleKey: string; params: Record<string, string> } | null {
  const p = path;
  const params: Record<string, string> = {};

  // Static routes (exact path -> module key)
  const staticMap: Record<string, string> = {
    health: "health",
    "auth-check": "auth-check",
    diagnostic: "diagnostic",
    submit: "submit",
    tip: "tip",
    vote: "vote",
    search: "search",
    analytics: "analytics",
    "fetch-server-json": "fetch-server-json",
    items: "items",
    prompts: "prompts",
    "prompts/create": "prompts-create",
    skills: "skills",
    "skills/create": "skills-create",
    install: "install",
  };
  const staticKey = p.join("/");
  if (staticMap[staticKey]) return { moduleKey: staticMap[staticKey], params };

  // auth/siwe-nonce is handled by app/api/auth/siwe-nonce/route.ts (keep that file)

  // user/wallet, user/profile, user/payout
  if (p.length === 2 && p[0] === "user") {
    if (p[1] === "wallet") return { moduleKey: "user-wallet", params };
    if (p[1] === "profile") return { moduleKey: "user-profile", params };
    if (p[1] === "payout") return { moduleKey: "user-payout", params };
  }

  // items/[id]/download
  if (p.length === 3 && p[0] === "items" && p[2] === "download") {
    params.id = p[1];
    return { moduleKey: "items-id-download", params };
  }

  // prompts/[id]
  if (p.length === 2 && p[0] === "prompts" && p[1] !== "create") {
    params.id = p[1];
    return { moduleKey: "prompts-id", params };
  }

  // skills/[id], skills/[id]/download
  if (p.length === 2 && p[0] === "skills") {
    params.id = p[1];
    return { moduleKey: "skills-id", params };
  }
  if (p.length === 3 && p[0] === "skills" && p[2] === "download") {
    params.id = p[1];
    return { moduleKey: "skills-id-download", params };
  }

  // install/[id]
  if (p.length === 2 && p[0] === "install") {
    params.id = p[1];
    return { moduleKey: "install-id", params };
  }

  // for-agents/skill.md
  if (p.length === 2 && p[0] === "for-agents" && p[1] === "skill.md")
    return { moduleKey: "for-agents-skill-md", params };

  return null;
}
