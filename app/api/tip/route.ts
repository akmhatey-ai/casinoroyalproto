import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentRequired, getPaymentHeader, verifyPayment } from "@/lib/x402";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tip
 * Body: { userId: string, amountCents: number }
 * - If no X-PAYMENT: return 402 with payment requirements
 * - If X-PAYMENT present and valid: credit recipient, record transaction, return 200
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId: recipientId, amountCents } = body as { userId?: string; amountCents?: number };
  if (!recipientId || typeof amountCents !== "number" || amountCents < 1) {
    return NextResponse.json(
      { error: "userId and amountCents (positive number) are required" },
      { status: 400 }
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const paymentHeader = getPaymentHeader(req);
  if (paymentHeader) {
    const result = await verifyPayment(paymentHeader);
    if (result.verified) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId: recipientId,
            itemType: "tip",
            itemId: session.user.id,
            amountCents,
            chain: result.chain ?? "evm",
            txHash: result.txHash ?? undefined,
            status: "completed",
          },
        }),
        prisma.user.update({
          where: { id: recipientId },
          data: { earningsCents: { increment: amountCents } },
        }),
      ]);
      return NextResponse.json({ ok: true });
    }
  }

  const { status, body: payBody, headers } = buildPaymentRequired(
    amountCents,
    `Tip to user ${recipientId}`
  );
  return new NextResponse(JSON.stringify(payBody), {
    status,
    headers: { ...headers },
  });
}
