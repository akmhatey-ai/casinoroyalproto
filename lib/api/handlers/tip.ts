import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentRequired, getPaymentHeader, verifyPayment } from "@/lib/x402";
import { getOwnerWallets } from "@/lib/payment-config";

const MIN_TIP_CENTS = 1;
const MAX_TIP_CENTS = 500; // $5

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountCents = Number(body.amountCents ?? 0);
    const toUserId = body.toUserId as string | undefined;
    const toVendorId = body.toVendorId as string | undefined;
    const preferredChain = (body.chain as "evm" | "solana") || "evm";

    if (amountCents < MIN_TIP_CENTS || amountCents > MAX_TIP_CENTS) {
      return NextResponse.json(
        { error: `Tip amount must be between $${MIN_TIP_CENTS / 100} and $${MAX_TIP_CENTS / 100}` },
        { status: 400 }
      );
    }

    const paymentHeader = getPaymentHeader(req);
    if (!paymentHeader) {
      const owner = getOwnerWallets();
      let payToEvm = owner.evm;
      let payToSolana = owner.solana;
      let description = `Tip $${(amountCents / 100).toFixed(2)} to platform`;
      if (toUserId || toVendorId) {
        const user = await prisma.user.findFirst({
          where: { id: toUserId ?? toVendorId! },
        });
        if (user) {
          const useEvm = preferredChain === "evm" && user.walletEvm;
          const useSol = preferredChain === "solana" && user.walletSolana;
          if (useEvm) payToEvm = user.walletEvm!;
          if (useSol) payToSolana = user.walletSolana!;
          description = `Tip $${(amountCents / 100).toFixed(2)} to ${user.name ?? user.email ?? "vendor"}`;
        }
      }
      const { status, body: payBody, headers } = buildPaymentRequired(amountCents, description, {
        payToEvm: payToEvm || undefined,
        payToSolana: payToSolana || undefined,
        preferredChain,
      });
      return NextResponse.json(payBody, { status, headers });
    }

    const verification = await verifyPayment(paymentHeader);
    if (!verification.verified) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
    }

    const owner = getOwnerWallets();
    let toWalletEvm = owner.evm;
    let toWalletSol = owner.solana;
    let toUserIdRecord: string | null = toUserId ?? toVendorId ?? null;

    if (toUserIdRecord) {
      const user = await prisma.user.findUnique({ where: { id: toUserIdRecord } });
      if (user) {
        if (verification.chain === "evm" && user.walletEvm) toWalletEvm = user.walletEvm;
        if (verification.chain === "solana" && user.walletSolana) toWalletSol = user.walletSolana;
      }
    }
    const toWallet = verification.chain === "evm" ? toWalletEvm : toWalletSol;
    if (!toWallet) {
      return NextResponse.json({ error: "No recipient wallet configured" }, { status: 400 });
    }

    const session = await auth();
    const fromWallet = (session?.user as { id?: string })?.id
      ? (await prisma.user.findUnique({ where: { id: (session.user as { id: string }).id } }))?.walletEvm ?? "unknown"
      : "anonymous";

    await prisma.tip.create({
      data: {
        fromWallet,
        toWallet,
        amountCents,
        chain: verification.chain ?? "evm",
        txHash: verification.txHash ?? null,
      },
    });

    const txUserId = toUserIdRecord ?? (session?.user as { id?: string })?.id;
    if (txUserId) {
      await prisma.transaction.create({
        data: {
          userId: txUserId,
          itemType: "tip",
          itemId: "tip-" + Date.now(),
          amountCents,
          chain: verification.chain ?? "evm",
          txHash: verification.txHash ?? undefined,
          status: "completed",
        },
      });
    }

    if (toUserIdRecord) {
      await prisma.user.update({
        where: { id: toUserIdRecord },
        data: { earningsCents: { increment: amountCents } },
      });
    }

    return NextResponse.json({
      ok: true,
      amountCents,
      chain: verification.chain,
      txHash: verification.txHash,
    });
  } catch (e) {
    console.error("Tip error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
