import { prisma } from "@/lib/prisma";
import { buildPaymentRequired, getPaymentHeader, verifyPayment } from "@/lib/x402";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, status: "approved" },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (item.type === "skill" && !item.isFree && (item.priceUsdCents ?? 0) > 0) {
    const amountCents = item.priceUsdCents ?? 0;
    const paymentHeader = getPaymentHeader(req);
    if (paymentHeader) {
      const result = await verifyPayment(paymentHeader);
      if (result.verified && item.content) {
        await prisma.item.update({
          where: { id },
          data: { downloads: { increment: 1 } },
        });
        if (item.authorId) {
          await prisma.transaction.create({
            data: {
              userId: item.authorId,
              itemType: "item",
              itemId: id,
              amountCents,
              chain: result.chain ?? "evm",
              txHash: result.txHash ?? undefined,
              status: "completed",
            },
          });
          await prisma.user.update({
            where: { id: item.authorId },
            data: { earningsCents: { increment: amountCents } },
          });
        }
        const filename = `SKILL-${item.name.replace(/[^a-z0-9-_]/gi, "-")}.md`;
        return new NextResponse(item.content, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
    }
    const { status, body, headers } = buildPaymentRequired(
      amountCents,
      `Download skill: ${item.name}`
    );
    return new NextResponse(JSON.stringify(body), { status, headers: { ...headers } });
  }

  if (item.content) {
    await prisma.item.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
    const filename = item.type === "skill"
      ? `SKILL-${item.name.replace(/[^a-z0-9-_]/gi, "-")}.md`
      : `${item.slug}.md`;
    return new NextResponse(item.content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ error: "No downloadable content" }, { status: 404 });
}
