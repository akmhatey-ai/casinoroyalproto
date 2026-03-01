import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

export async function GET(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { items: [], error: "Database not configured" },
      { status: 200, headers: CORS_HEADERS }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type"); // mcp | skill | prompt | tool
  const free = searchParams.get("free"); // true | false
  const sort = searchParams.get("sort") ?? "downloads"; // downloads | new
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const cursor = searchParams.get("cursor");
  const format = searchParams.get("format"); // skills.md for agent-friendly

  const where: {
    status: string;
    type?: string;
    isFree?: boolean;
    OR?: Array<{ name?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" }; tags?: { has: string } }>;
  } = { status: "approved" };
  if (type) where.type = type;
  if (free === "true") where.isFree = true;
  if (free === "false") where.isFree = false;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  const orderBy = sort === "new"
    ? { createdAt: "desc" as const }
    : { downloads: "desc" as const };

  const items = await prisma.item.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy,
    select: {
      id: true,
      type: true,
      name: true,
      slug: true,
      description: true,
      installUrl: true,
      isFree: true,
      priceUsdCents: true,
      downloads: true,
      configJson: true,
      repoUrl: true,
    },
  });

  const nextCursor = items.length > limit ? items[limit - 1]?.id : null;
  const list = items.slice(0, limit);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (format === "skills.md") {
    const agentItems = list.map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      description: item.description,
      installUrl: item.installUrl ?? `${baseUrl}/api/install/${item.id}`,
      isPremium: !item.isFree,
      priceUsdCents: item.priceUsdCents,
    }));
    return NextResponse.json(
      { items: agentItems, nextCursor },
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  return NextResponse.json(
    { items: list, nextCursor },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
