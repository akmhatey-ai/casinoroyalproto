import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketCreatedEmail } from "@/lib/notify-ticket";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!title || !description) {
    return NextResponse.json({ error: "title and description required" }, { status: 400 });
  }
  const ticket = await prisma.supportTicket.create({
    data: { userId: session.user.id, title, description, status: "open" },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
  if (user?.email) {
    sendTicketCreatedEmail({ to: user.email, ticketId: ticket.id, title, appUrl }).catch(() => {});
  }
  return NextResponse.json(ticket);
}
