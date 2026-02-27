import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  const where = q
    ? {
        status: "approved",
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { status: "approved" };
  const prompts = await prisma.prompt.findMany({
    where,
    take: 100,
    orderBy: { downloads: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isPremium: true,
      priceUsdCents: true,
      downloads: true,
      createdAt: true,
      submitter: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ items: prompts });
}
