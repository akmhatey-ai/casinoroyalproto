import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentRequired, getPaymentHeader, verifyPayment } from "@/lib/x402";
import { getOwnerWallets } from "@/lib/payment-config";
import { PLATFORM_FEE_PERCENT } from "@/lib/payment-config";

type Ctx = { params: Record<string, string> };

export async function GET(req: Request, ctx: Ctx) {
  const id = ctx.params.id;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { vendor: true },
  });
  if (!service || service.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paymentHeader = getPaymentHeader(req);
  if (!paymentHeader) {
    const owner = getOwnerWallets();
    const vendor = service.vendor;
    const payToEvm = service.preferredChain === "evm"
      ? (service.payoutWalletEvm ?? vendor.walletEvm ?? owner.evm)
      : owner.evm;
    const payToSolana = service.preferredChain === "solana"
      ? (service.payoutWalletSolana ?? vendor.walletSolana ?? owner.solana)
      : owner.solana;

    const { status, body: payBody, headers } = buildPaymentRequired(
      service.priceUsdCents,
      `Service: ${service.name}`,
      {
        payToEvm: payToEvm || undefined,
        payToSolana: payToSolana || undefined,
        preferredChain: service.preferredChain as "evm" | "solana",
      }
    );
    return NextResponse.json(payBody, { status, headers });
  }

  const verification = await verifyPayment(paymentHeader);
  if (!verification.verified) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
  }

  const platformCents = Math.floor((service.priceUsdCents * PLATFORM_FEE_PERCENT) / 100);
  const vendorCents = service.priceUsdCents - platformCents;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? "anonymous";

  await prisma.transaction.create({
    data: {
      userId,
      itemType: "service",
      itemId: service.id,
      amountCents: service.priceUsdCents,
      platformCents,
      vendorCents,
      vendorId: service.vendorId,
      serviceId: service.id,
      chain: verification.chain ?? "evm",
      txHash: verification.txHash ?? undefined,
      status: "completed",
    },
  });

  await prisma.user.update({
    where: { id: service.vendorId },
    data: { earningsCents: { increment: vendorCents } },
  });

  return NextResponse.json({
    ok: true,
    service: {
      id: service.id,
      name: service.name,
      description: service.description,
    },
    txHash: verification.txHash,
    platformCents,
    vendorCents,
  });
}
