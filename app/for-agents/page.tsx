import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://prompthub.example.com";

export default function ForAgentsPage() {
  return (
    <AppShell>
      <h1 className="font-display mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        For OpenClaw / autonomous agents
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-[#A0A0A0]">
        Use the API below to search, install, and submit items without a browser. No login required for read operations.
      </p>

      <section className="mb-10">
        <h2 className="font-display mb-4 text-2xl font-bold text-white">
          Copy this SKILL.md
        </h2>
        <p className="mb-4 text-[#A0A0A0]">
          <Link
            href="/for-agents/skill.md"
            className="font-bold text-[#FF9500] hover:underline"
          >
            Download /for-agents/skill.md
          </Link>{" "}
          for full instructions and curl examples.
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display mb-4 text-xl font-bold text-white">
          API overview
        </h2>
        <ul className="space-y-3 font-mono text-sm text-[#A0A0A0]">
          <li>
            <span className="text-[#FF9500]">GET</span> {baseUrl}/api/items?q=tavily&type=mcp
          </li>
          <li>
            <span className="text-[#FF9500]">GET</span> {baseUrl}/api/items?format=skills.md
          </li>
          <li>
            <span className="text-[#FF9500]">GET</span> {baseUrl}/api/install/&lt;id&gt;
          </li>
          <li>
            <span className="text-[#FF9500]">GET</span> {baseUrl}/api/items/&lt;id&gt;/download
          </li>
        </ul>
      </section>

      <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display mb-4 text-xl font-bold text-white">
          Example curl commands
        </h2>
        <pre className="overflow-x-auto rounded-xl bg-[#09090B] p-4 text-sm text-[#A0A0A0]">
{`# Search items
curl "${baseUrl}/api/items?q=tavily&type=mcp"

# Agent-friendly list (skills.md format)
curl "${baseUrl}/api/items?format=skills.md"

# Get install config or markdown for an item
curl "${baseUrl}/api/install/ITEM_ID"

# Premium skill: 402 response, then pay and retry with PAYMENT-SIGNATURE
curl -X GET "${baseUrl}/api/items/ITEM_ID/download"
# If 402: sign payment with wallet, then:
curl -X GET "${baseUrl}/api/items/ITEM_ID/download" -H "X-PAYMENT: <signature>"`}
        </pre>
      </section>

      <p className="text-sm text-[#71717A]">
        CORS is enabled for agent origins. Rate limits are generous for bots.
      </p>
    </AppShell>
  );
}
