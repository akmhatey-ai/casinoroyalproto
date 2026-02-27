import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type"); // prompt | skill | all
  const premium = searchParams.get("premium"); // all | free | premium
  const format = searchParams.get("format"); // skills.md for agent-friendly

  const baseWhere = {
    status: "approved" as const,
    ...(premium === "free" && { isPremium: false }),
    ...(premium === "premium" && { isPremium: true }),
  };

  const results: { type: string; id: string; slug: string; title: string; name?: string; description: string; isPremium: boolean; priceUsdCents: number | null; downloads: number }[] = [];

  if (type !== "skill") {
    const promptWhere = q
      ? { ...baseWhere, OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }
      : baseWhere;
    const prompts = await prisma.prompt.findMany({
      where: promptWhere,
      take: 50,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        isPremium: true,
        priceUsdCents: true,
        downloads: true,
      },
    });
    results.push(
      ...prompts.map((p) => ({
        type: "prompt" as const,
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        isPremium: p.isPremium,
        priceUsdCents: p.priceUsdCents,
        downloads: p.downloads,
      }))
    );
  }

  if (type !== "prompt") {
    const skillWhere = q
      ? { ...baseWhere, OR: [{ name: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }
      : baseWhere;
    const skills = await prisma.skill.findMany({
      where: skillWhere,
      take: 50,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isPremium: true,
        priceUsdCents: true,
        downloads: true,
      },
    });
    results.push(
      ...skills.map((s) => ({
        type: "skill" as const,
        id: s.id,
        slug: s.slug,
        title: s.name,
        name: s.name,
        description: s.description,
        isPremium: s.isPremium,
        priceUsdCents: s.priceUsdCents,
        downloads: s.downloads,
      }))
    );
  }

  if (format === "skills.md") {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
    return NextResponse.json({
      items: results
        .filter((r) => r.type === "skill")
        .map((s) => ({
          id: s.id,
          name: s.name ?? s.title,
          description: s.description,
          installUrl: `${baseUrl}/api/skills/${s.id}/download`,
          isPremium: s.isPremium,
        })),
    });
  }

  return NextResponse.json({ items: results });
}
