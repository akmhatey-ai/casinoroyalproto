import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug, slugify } from "@/lib/slug";
import { NextRequest, NextResponse } from "next/server";

const TYPES = ["mcp", "skill", "prompt", "tool"] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    type,
    name,
    description,
    content,
    repoUrl,
    walletSolana,
    walletEvm,
    priceUsdCents,
    tags,
    configJson,
    installUrl,
  } = body as {
    type?: string;
    name?: string;
    description?: string;
    content?: string;
    repoUrl?: string;
    walletSolana?: string;
    walletEvm?: string;
    priceUsdCents?: number;
    tags?: string[];
    configJson?: unknown;
    installUrl?: string;
  };

  if (!type || !TYPES.includes(type as (typeof TYPES)[number])) {
    return NextResponse.json({ error: "type must be one of: mcp, skill, prompt, tool" }, { status: 400 });
  }
  if (!name?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "name and description are required" }, { status: 400 });
  }

  const slugBase = `${type}-${slugify(name)}`;
  const slug = await uniqueSlug(slugBase, async (s) => {
    const existing = await prisma.item.findUnique({ where: { slug: s } });
    return !!existing;
  });

  const isFree = !priceUsdCents || priceUsdCents === 0;
  const price = isFree ? null : Math.round(priceUsdCents);

  const item = await prisma.item.create({
    data: {
      type: type as (typeof TYPES)[number],
      name: name.trim(),
      slug,
      description: description.trim(),
      content: content?.trim() || null,
      repoUrl: repoUrl?.trim() || null,
      installUrl: installUrl?.trim() || null,
      authorId: session.user.id,
      walletSolana: walletSolana?.trim() || null,
      walletEvm: walletEvm?.trim() || null,
      priceUsdCents: price,
      isFree,
      tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string").slice(0, 20) : [],
      configJson: configJson != null ? (configJson as object) : undefined,
      status: "pending",
    },
  });

  await prisma.submission.create({
    data: {
      userId: session.user.id,
      itemType: "item",
      itemId: item.id,
      status: "pending",
    },
  });

  return NextResponse.json({ id: item.id, slug: item.slug });
}
