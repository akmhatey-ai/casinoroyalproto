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
  const { title, description, content, isPremium, priceUsdCents, category } = body as {
    title?: string;
    description?: string;
    content?: string;
    isPremium?: boolean;
    priceUsdCents?: number;
    category?: string;
  };

  if (!title?.trim() || !description?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "title, description, and content are required" },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(title, async (s) => {
    const existing = await prisma.prompt.findUnique({ where: { slug: s } });
    return !!existing;
  });

  const prompt = await prisma.prompt.create({
    data: {
      title: title.trim(),
      slug,
      description: description.trim(),
      content: content.trim(),
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
      itemType: "prompt",
      itemId: prompt.id,
      status: "pending",
    },
  });

  return NextResponse.json({ id: prompt.id, slug: prompt.slug });
}
