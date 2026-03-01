import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      name: true,
      bio: true,
      website: true,
      twitter: true,
      github: true,
      profilePublic: true,
      image: true,
      walletSolana: true,
      walletEvm: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    username,
    bio,
    website,
    twitter,
    github,
    profilePublic,
  } = body as {
    username?: string;
    bio?: string;
    website?: string;
    twitter?: string;
    github?: string;
    profilePublic?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (typeof username === "string") {
    const u = username.trim().replace(/^@/, "").slice(0, 64);
    if (u && /^[a-zA-Z0-9_-]+$/.test(u)) data.username = u;
  }
  if (typeof bio === "string") data.bio = bio.slice(0, 2000);
  if (typeof website === "string") data.website = website.trim().slice(0, 512) || null;
  if (typeof twitter === "string") data.twitter = twitter.trim().replace(/^@/, "").slice(0, 64) || null;
  if (typeof github === "string") data.github = github.trim().replace(/^@/, "").slice(0, 64) || null;
  if (typeof profilePublic === "boolean") data.profilePublic = profilePublic;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("Unique constraint") || message.includes("username")) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
