import { NextResponse } from "next/server";
import { buildPaymentRequired } from "@/lib/x402";
import { getOwnerWallets } from "@/lib/payment-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payments?type=service&id=xxx | type=tip&amountCents=100&toUserId=...
 * Returns 402 with payment requirement (PAYMENT-REQUIRED headers + body).
 * Client can then pay and retry with PAYMENT-SIGNATURE.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const amountCents = Number(url.searchParams.get("amountCents") ?? 0);
  const toUserId = url.searchParams.get("toUserId") ?? undefined;
  const preferredChain = (url.searchParams.get("chain") as "evm" | "solana") || "evm";

  if (type === "service" && id) {
    const service = await prisma.service.findUnique({ where: { id }, include: { vendor: true } });
    if (!service || service.status !== "active") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const owner = getOwnerWallets();
    const v = service.vendor;
    const payToEvm = service.preferredChain === "evm"
      ? (service.payoutWalletEvm ?? v.walletEvm ?? owner.evm)
      : owner.evm;
    const payToSolana = service.preferredChain === "solana"
      ? (service.payoutWalletSolana ?? v.walletSolana ?? owner.solana)
      : owner.solana;
    const { status, body, headers } = buildPaymentRequired(
      service.priceUsdCents,
      `Service: ${service.name}`,
      { payToEvm: payToEvm || undefined, payToSolana: payToSolana || undefined, preferredChain: service.preferredChain as "evm" | "solana" }
    );
    return NextResponse.json(body, { status, headers });
  }

  if (type === "tip" && amountCents >= 1 && amountCents <= 500) {
    let payToEvm = getOwnerWallets().evm;
    let payToSolana = getOwnerWallets().solana;
    let description = `Tip $${(amountCents / 100).toFixed(2)} to platform`;
    if (toUserId) {
      const user = await prisma.user.findUnique({ where: { id: toUserId } });
      if (user) {
        if (preferredChain === "evm" && user.walletEvm) payToEvm = user.walletEvm;
        if (preferredChain === "solana" && user.walletSolana) payToSolana = user.walletSolana;
        description = `Tip $${(amountCents / 100).toFixed(2)} to ${user.name ?? user.email ?? "vendor"}`;
      }
    }
    const { status, body, headers } = buildPaymentRequired(amountCents, description, {
      payToEvm: payToEvm || undefined,
      payToSolana: payToSolana || undefined,
      preferredChain,
    });
    return NextResponse.json(body, { status, headers });
  }

  return NextResponse.json({ error: "Invalid request: type=service&id=... or type=tip&amountCents=1-500" }, { status: 400 });
}
