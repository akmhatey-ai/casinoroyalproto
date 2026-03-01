import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let prompts: { id: string; slug: string; title: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }[] = [];
  let skills: { id: string; slug: string; name: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }[] = [];
  if (process.env.DATABASE_URL) {
    try {
      [prompts, skills] = await Promise.all([
      prisma.prompt.findMany({
        where: { status: "approved" },
        take: 6,
        orderBy: { downloads: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          isPremium: true,
          priceUsdCents: true,
          submitter: { select: { name: true } },
        },
      }),
      prisma.skill.findMany({
        where: { status: "approved" },
        take: 6,
        orderBy: { downloads: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          isPremium: true,
          priceUsdCents: true,
          submitter: { select: { name: true } },
        },
      }),
      ]);
    } catch {
      // DB not available
    }
  }

  return (
    <AppShell>
      <h1 className="font-display mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        PromptHub — Marketplace for MCPs, Skills, Tools & Prompts
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-[#A0A0A0]">
        One-click install to Claude, Cursor, OpenClaw. Free + premium paid via x402 on Solana/EVM.
      </p>

      <form action="/search" method="get" className="mb-10">
        <SearchInput name="q" placeholder="Search prompts, skills, and AI tools" />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <FilterPills current="all" />
          <button
            type="submit"
            className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      <section className="mb-16">
        <SectionHeader title="Popular Prompts" viewAllHref="/search?type=prompt" />
        {prompts.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">No prompts yet. Be the first to submit.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((p) => (
              <li key={p.id}>
                <GlassCard
                  as="a"
                  href={`/prompts/${p.slug}`}
                  type="prompt"
                  title={p.title}
                  description={p.description}
                  creator={p.submitter?.name ?? undefined}
                  price={p.isPremium ? `$${(p.priceUsdCents ?? 0) / 100}` : "Free"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-16">
        <SectionHeader title="Popular Skills" viewAllHref="/search?type=skill" />
        {skills.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">No skills yet. Be the first to submit.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <li key={s.id}>
                <GlassCard
                  as="a"
                  href={`/skills/${s.slug}`}
                  type="skill"
                  title={s.name}
                  description={s.description}
                  creator={s.submitter?.name ?? undefined}
                  price={s.isPremium ? `$${(s.priceUsdCents ?? 0) / 100}` : "Free"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-16 rounded-2xl border-2 border-[#FF9500]/40 bg-[#FF9500]/5 p-8">
        <h2 className="font-display mb-2 text-2xl font-bold text-white">
          For OpenClaw / autonomous agents
        </h2>
        <p className="mb-4 text-[#A0A0A0]">
          Use the API without login. Copy this SKILL.md for full instructions and curl examples.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/for-agents"
            className="rounded-full bg-[#FF9500] px-6 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90"
          >
            Agent API & docs
          </Link>
          <a
            href="/for-agents/skill.md"
            className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            download
          >
            Download SKILL.md
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="font-display mb-2 text-2xl font-bold text-white">
          Tip PromptHub
        </h2>
        <p className="mb-4 text-sm text-[#A0A0A0]">
          Support the project via x402. Send USDC to:
        </p>
        <div className="mb-4 space-y-2 font-mono text-xs text-[#A0A0A0]">
          {process.env.NEXT_PUBLIC_TIP_WALLET_SOL && (
            <p>Solana: {process.env.NEXT_PUBLIC_TIP_WALLET_SOL}</p>
          )}
          {process.env.NEXT_PUBLIC_TIP_WALLET_EVM && (
            <p>EVM (Base): {process.env.NEXT_PUBLIC_TIP_WALLET_EVM}</p>
          )}
          {!process.env.NEXT_PUBLIC_TIP_WALLET_SOL && !process.env.NEXT_PUBLIC_TIP_WALLET_EVM && (
            <p>Set NEXT_PUBLIC_TIP_WALLET_SOL and NEXT_PUBLIC_TIP_WALLET_EVM in .env to show addresses.</p>
          )}
        </div>
        <Link
          href="/api/tip?amount=1"
          className="inline-block rounded-full bg-[#FF9500] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90"
        >
          Tip 0.01 USDC via x402
        </Link>
      </section>
    </AppShell>
  );
}
