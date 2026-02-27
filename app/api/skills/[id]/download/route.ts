import { prisma } from "@/lib/prisma";
import { buildPaymentRequired, getPaymentHeader, verifyPayment } from "@/lib/x402";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const skill = await prisma.skill.findFirst({
    where: { id, status: "approved" },
    select: {
      name: true,
      skillMd: true,
      isPremium: true,
      priceUsdCents: true,
      submitterId: true,
    },
  });
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (skill.isPremium) {
    const amountCents = skill.priceUsdCents ?? 0;
    const paymentHeader = getPaymentHeader(req);
    if (paymentHeader) {
      const result = await verifyPayment(paymentHeader);
      if (result.verified) {
        await prisma.$transaction([
          prisma.skill.update({
            where: { id },
            data: { downloads: { increment: 1 } },
          }),
          prisma.transaction.create({
            data: {
              userId: skill.submitterId,
              itemType: "skill",
              itemId: id,
              amountCents,
              chain: result.chain ?? "evm",
              txHash: result.txHash ?? undefined,
              status: "completed",
            },
          }),
          prisma.user.update({
            where: { id: skill.submitterId },
            data: { earningsCents: { increment: amountCents } },
          }),
        ]);
        const content = skill.skillMd;
        const filename = `SKILL-${skill.name.replace(/[^a-z0-9-_]/gi, "-")}.md`;
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
    }
    const { status, body, headers } = buildPaymentRequired(
      amountCents,
      `Download skill: ${skill.name}`
    );
    return new NextResponse(JSON.stringify(body), {
      status,
      headers: { ...headers },
    });
  }

  await prisma.skill.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  const content = skill.skillMd;
  const filename = `SKILL-${skill.name.replace(/[^a-z0-9-_]/gi, "-")}.md`;
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
