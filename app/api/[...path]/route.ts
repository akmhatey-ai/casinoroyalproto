import { NextResponse } from "next/server";
import { resolveRoute } from "@/lib/api/resolve-route";

type ApiContext = { params: Record<string, string> };
type Handler = (req: Request, ctx: ApiContext) => Promise<Response>;

const HANDLER_MODULES: Record<string, () => Promise<{ GET?: Handler; POST?: Handler; PATCH?: Handler; PUT?: Handler; DELETE?: Handler; OPTIONS?: Handler }>> = {
  health: () => import("@/lib/api/handlers/health"),
  "auth-check": () => import("@/lib/api/handlers/auth-check"),
  diagnostic: () => import("@/lib/api/handlers/diagnostic"),
  "user-wallet": () => import("@/lib/api/handlers/user-wallet"),
  "user-profile": () => import("@/lib/api/handlers/user-profile"),
  "user-payout": () => import("@/lib/api/handlers/user-payout"),
  items: () => import("@/lib/api/handlers/items"),
  "items-id-download": () => import("@/lib/api/handlers/items-id-download"),
  prompts: () => import("@/lib/api/handlers/prompts"),
  "prompts-id": () => import("@/lib/api/handlers/prompts-id"),
  "prompts-create": () => import("@/lib/api/handlers/prompts-create"),
  skills: () => import("@/lib/api/handlers/skills"),
  "skills-id": () => import("@/lib/api/handlers/skills-id"),
  "skills-id-download": () => import("@/lib/api/handlers/skills-id-download"),
  "skills-create": () => import("@/lib/api/handlers/skills-create"),
  submit: () => import("@/lib/api/handlers/submit"),
  tip: () => import("@/lib/api/handlers/tip"),
  vote: () => import("@/lib/api/handlers/vote"),
  search: () => import("@/lib/api/handlers/search"),
  install: () => import("@/lib/api/handlers/install"),
  "install-id": () => import("@/lib/api/handlers/install-id"),
  analytics: () => import("@/lib/api/handlers/analytics"),
  "fetch-server-json": () => import("@/lib/api/handlers/fetch-server-json"),
  "for-agents-skill-md": () => import("@/lib/api/handlers/for-agents-skill-md"),
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "PATCH");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "GET");
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "POST");
}
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "PUT");
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "DELETE");
}
export async function OPTIONS(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return dispatch(req, await params, "OPTIONS");
}

async function dispatch(
  req: Request,
  { path }: { path?: string[] },
  method: string
) {
  const segments = path ?? [];
  if (segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const resolved = resolveRoute(segments);
  if (!resolved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const loader = HANDLER_MODULES[resolved.moduleKey];
  if (!loader) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const mod = await loader();
  const handler = (mod as Record<string, Handler | undefined>)[method as string];
  if (!handler) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
  const ctx: ApiContext = { params: resolved.params };
  return handler(req, ctx);
}
