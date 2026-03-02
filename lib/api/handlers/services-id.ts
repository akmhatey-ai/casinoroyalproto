import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Record<string, string> };

export async function GET(_req: Request, ctx: Ctx) {
  const id = ctx.params.id;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { vendor: { select: { id: true, name: true, username: true } } },
  });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(service);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = ctx.params.id;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (service.vendorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(body.name != null && { name: String(body.name).trim() }),
      ...(body.description != null && { description: String(body.description).trim() }),
      ...(body.priceUsdCents != null && { priceUsdCents: Number(body.priceUsdCents) }),
      ...(body.preferredChain != null && { preferredChain: body.preferredChain === "solana" ? "solana" : "evm" }),
      ...(body.status != null && ["draft", "active", "archived"].includes(body.status) && { status: body.status }),
      ...(body.payoutWalletEvm != null && { payoutWalletEvm: String(body.payoutWalletEvm).trim() || null }),
      ...(body.payoutWalletSolana != null && { payoutWalletSolana: String(body.payoutWalletSolana).trim() || null }),
    },
  });
  return NextResponse.json(updated);
}
