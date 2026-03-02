import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Record<string, string> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = ctx.params.id;
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ticket.userId !== session.user.id && !process.env.ADMIN_USER_ID?.includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const comments = await prisma.ticketComment.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = ctx.params.id;
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const adminIds = (process.env.ADMIN_USER_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isAdmin = adminIds.includes(session.user.id);
  if (ticket.userId !== session.user.id && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const bodyText = String(body.body ?? "").trim();
  if (!bodyText) return NextResponse.json({ error: "body required" }, { status: 400 });

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      body: bodyText,
      isStaff: isAdmin,
    },
  });
  await prisma.supportTicket.update({
    where: { id },
    data: { status: isAdmin ? "pending" : ticket.status, updatedAt: new Date() },
  });
  return NextResponse.json(comment);
}
