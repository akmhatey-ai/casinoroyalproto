import { prisma } from "@/lib/prisma";
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  switch (item.type) {
    case "mcp": {
      const config = (item.configJson as Record<string, unknown>) ?? {};
      const remotes = (config.remotes as Array<{ type?: string; url?: string }>) ?? [];
      const url = remotes[0]?.url ?? item.installUrl ?? "";
      const snippet = {
        mcpServers: {
          [item.slug.replace(/^mcp-/, "")]: url ? { url } : { command: "npx", args: ["-y", item.installUrl ?? ""] },
        },
      };
      return NextResponse.json({
        type: "mcp",
        instructions: "Add to .cursor/mcp.json or Claude Desktop config:",
        config: snippet,
        raw: config,
      });
    }
    case "skill": {
      if (!item.isFree && (item.priceUsdCents ?? 0) > 0) {
        return NextResponse.json(
          {
            type: "skill",
            paymentRequired: true,
            amountCents: item.priceUsdCents,
            downloadUrl: `${baseUrl}/api/items/${id}/download`,
            message: "Premium skill: pay via x402 then GET downloadUrl with PAYMENT-SIGNATURE header.",
          },
          { status: 402 }
        );
      }
      const content = item.content ?? `# ${item.name}\n\n${item.description}`;
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="SKILL-${item.name.replace(/[^a-z0-9-_]/gi, "-")}.md"`,
        },
      });
    }
    case "prompt": {
      const text = item.content ?? item.description;
      return NextResponse.json({
        type: "prompt",
        name: item.name,
        content: text,
        copyPaste: text,
      });
    }
    default:
      return NextResponse.json({
        type: item.type,
        name: item.name,
        description: item.description,
        installUrl: item.installUrl ?? `${baseUrl}/api/install/${item.id}`,
      });
  }
}
