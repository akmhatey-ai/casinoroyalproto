import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/analytics
 * Returns aggregate stats for the site (or for the current user if authenticated).
 * Stub: total prompts, skills, downloads.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { prompts: 0, skills: 0, totalDownloads: 0 },
      { status: 200 }
    );
  }
  try {
    const session = await auth();

    const [promptCount, skillCount, totalPromptDownloads, totalSkillDownloads] = await Promise.all([
    prisma.prompt.count({ where: { status: "approved" } }),
    prisma.skill.count({ where: { status: "approved" } }),
    prisma.prompt.aggregate({ where: { status: "approved" }, _sum: { downloads: true } }),
    prisma.skill.aggregate({ where: { status: "approved" }, _sum: { downloads: true } }),
  ]);

  const stats = {
    prompts: promptCount,
    skills: skillCount,
    totalDownloads: (totalPromptDownloads._sum.downloads ?? 0) + (totalSkillDownloads._sum.downloads ?? 0),
  };

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { earningsCents: true },
    });
    const myPrompts = await prisma.prompt.count({ where: { submitterId: session.user.id } });
    const mySkills = await prisma.skill.count({ where: { submitterId: session.user.id } });
    return NextResponse.json({
      ...stats,
      me: {
        earningsCents: user?.earningsCents ?? 0,
        promptsSubmitted: myPrompts,
        skillsSubmitted: mySkills,
      },
    });
  }

  return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
