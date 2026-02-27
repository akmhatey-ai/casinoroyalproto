import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vote
 * Body: { itemType: 'prompt' | 'skill', itemId: string, value: number }
 * value: 1 for upvote, or 1-5 for rating
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { itemType, itemId, value } = body as { itemType?: string; itemId?: string; value?: number };
  if (!itemType || !itemId || value == null || value < 1 || value > 5) {
    return NextResponse.json(
      { error: "itemType (prompt|skill), itemId, and value (1-5) required" },
      { status: 400 }
    );
  }

  if (itemType !== "prompt" && itemType !== "skill") {
    return NextResponse.json({ error: "itemType must be prompt or skill" }, { status: 400 });
  }

  await prisma.vote.upsert({
    where: {
      userId_itemType_itemId: {
        userId: session.user.id,
        itemType,
        itemId,
      },
    },
    create: {
      userId: session.user.id,
      itemType,
      itemId,
      value,
    },
    update: { value },
  });

  return NextResponse.json({ ok: true });
}
