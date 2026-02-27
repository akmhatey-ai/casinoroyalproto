import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const skill = await prisma.skill.findFirst({
    where: { id, status: "approved" },
    include: { submitter: { select: { id: true, name: true, image: true } } },
  });
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { skillMd, ...rest } = skill;
  return NextResponse.json({ ...rest, hasContent: !!skillMd });
}
