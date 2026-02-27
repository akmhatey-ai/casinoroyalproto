import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/user/payout
 * Request payout to linked wallet. Stub: decrement earnings and record payout transaction.
 * In production: trigger actual on-chain transfer to user's walletSolana or walletEvm.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { earningsCents: true, walletSolana: true, walletEvm: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const wallet = user.walletSolana ?? user.walletEvm;
  if (!wallet) {
    return NextResponse.json(
      { error: "Link a wallet in Settings before requesting payout" },
      { status: 400 }
    );
  }

  const amountCents = user.earningsCents;
  if (amountCents < 100) {
    return NextResponse.json(
      { error: "Minimum payout is $1.00 (100 cents)" },
      { status: 400 }
    );
  }

  // Stub: record payout and zero out earnings. In production, send tx to wallet.
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        itemType: "payout",
        itemId: wallet,
        amountCents,
        chain: user.walletSolana ? "solana" : "evm",
        txHash: `payout-stub-${Date.now()}`,
        status: "completed",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { earningsCents: 0 },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    message: "Payout recorded. In production, funds would be sent to your wallet.",
    amountCents,
    wallet: wallet.slice(0, 8) + "...",
  });
}
