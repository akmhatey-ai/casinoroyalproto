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
    select: { walletSolana: true, walletEvm: true },
  });
  return NextResponse.json({
    walletSolana: user?.walletSolana ?? null,
    walletEvm: user?.walletEvm ?? null,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { chain, address } = body as { chain: "solana" | "evm"; address: string };
  if (!chain || !address || typeof address !== "string") {
    return NextResponse.json({ error: "Invalid chain or address" }, { status: 400 });
  }
  const normalized = address.trim();
  if (!normalized) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }
  // In production: verify signed message from wallet before saving
  if (chain === "solana") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletSolana: normalized },
    });
  } else {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletEvm: normalized },
    });
  }
  return NextResponse.json({ ok: true });
}
