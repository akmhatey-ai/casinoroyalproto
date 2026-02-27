import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, skillMd, isPremium, priceUsdCents, category, integrations } = body as {
    name?: string;
    description?: string;
    skillMd?: string;
    isPremium?: boolean;
    priceUsdCents?: number;
    category?: string;
    integrations?: unknown;
  };

  if (!name?.trim() || !description?.trim() || !skillMd?.trim()) {
    return NextResponse.json(
      { error: "name, description, and skillMd are required" },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(name, async (s) => {
    const existing = await prisma.skill.findUnique({ where: { slug: s } });
    return !!existing;
  });

  const skill = await prisma.skill.create({
    data: {
      name: name.trim(),
      slug,
      description: description.trim(),
      skillMd: skillMd.trim(),
      integrations: integrations ?? undefined,
      isPremium: !!isPremium,
      priceUsdCents: isPremium && typeof priceUsdCents === "number" ? priceUsdCents : null,
      category: category?.trim() || null,
      submitterId: session.user.id,
      status: "pending",
    },
  });

  await prisma.submission.create({
    data: {
      userId: session.user.id,
      itemType: "skill",
      itemId: skill.id,
      status: "pending",
    },
  });

  return NextResponse.json({ id: skill.id, slug: skill.slug });
}
