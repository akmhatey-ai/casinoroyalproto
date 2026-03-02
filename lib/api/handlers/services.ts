import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const list = await prisma.service.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { id: true, name: true, username: true } } },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const priceUsdCents = Number(body.priceUsdCents ?? 0);
  const preferredChain = body.preferredChain === "solana" ? "solana" : "evm";

  if (!name || !description || priceUsdCents < 0) {
    return NextResponse.json({ error: "name, description, and non-negative priceUsdCents required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
  const service = await prisma.service.create({
    data: {
      vendorId: session.user.id,
      name,
      slug,
      description,
      priceUsdCents,
      preferredChain,
      status: "active",
      payoutWalletEvm: body.payoutWalletEvm ? String(body.payoutWalletEvm).trim() : null,
      payoutWalletSolana: body.payoutWalletSolana ? String(body.payoutWalletSolana).trim() : null,
    },
  });
  return NextResponse.json(service);
}
