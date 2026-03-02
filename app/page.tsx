import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeroLogo } from "@/components/ui/HeroLogo";
import { SearchInput } from "@/components/ui/SearchInput";
import { HeroCategoryPills } from "@/components/ui/HeroCategoryPills";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let prompts: { id: string; slug: string; title: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }[] = [];
  let skills: { id: string; slug: string; name: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }[] = [];
  let stats = { prompts: 0, skills: 0 };
  if (process.env.DATABASE_URL) {
    try {
      const [promptsList, skillsList, promptCount, skillCount] = await Promise.all([
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
        prisma.prompt.count({ where: { status: "approved" } }),
        prisma.skill.count({ where: { status: "approved" } }),
      ]);
      prompts = promptsList;
      skills = skillsList;
      stats = { prompts: promptCount, skills: skillCount };
    } catch {
      // DB not available
    }
  }

  return (
    <AppShell>
      {/* Hero: headline + subheadline */}
      <section className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-4 flex justify-center">
          <HeroLogo />
        </div>
        <h1 className="font-display mb-3 text-4xl font-extrabold tracking-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
          The World&apos;s Largest Prompt Marketplace
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-muted)] md:text-xl">
          Search, browse, and one-click install. Free and premium prompts & skills.
        </p>
      </section>

      {/* Hero search bar — large, centered */}
      <form action="/search" method="get" className="mx-auto mb-8 max-w-3xl">
        <SearchInput name="q" placeholder="Search prompts, skills, and AI tools" className="mx-auto" />
        <div className="mt-4 flex justify-center">
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-primary)] px-10 py-3 text-base font-bold text-black transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Search
          </button>
        </div>
      </form>

      {/* Stat counters */}
      <div className="mb-8 flex flex-wrap justify-center gap-8 text-center">
        <div>
          <span className="font-display text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
            {stats.prompts >= 1000 ? `${Math.floor(stats.prompts / 1000)}K+` : `${stats.prompts}+`}
          </span>
          <span className="ml-1.5 text-[var(--color-text-muted)]">Prompts</span>
        </div>
        <div>
          <span className="font-display text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
            {stats.skills >= 1000 ? `${Math.floor(stats.skills / 1000)}K+` : `${stats.skills}+`}
          </span>
          <span className="ml-1.5 text-[var(--color-text-muted)]">Skills</span>
        </div>
        <div>
          <span className="font-display text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
            Free & Premium
          </span>
        </div>
      </div>

      {/* Category pill filters */}
      <div className="mb-14">
        <HeroCategoryPills />
      </div>

      <section className="mb-16">
        <SectionHeader title="Popular Prompts" viewAllHref="/search?type=prompt" />
        {prompts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No prompts yet. Be the first to submit.</p>
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
          <p className="text-sm text-[var(--color-text-muted)]">No skills yet. Be the first to submit.</p>
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

      <section className="mb-16 rounded-lg border-2 border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 p-8">
        <h2 className="font-display mb-2 text-2xl font-bold text-[var(--color-text)]">
          For OpenClaw / autonomous agents
        </h2>
        <p className="mb-4 text-[var(--color-text-muted)]">
          Use the API without login. Copy this SKILL.md for full instructions and curl examples.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/for-agents"
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Agent API & docs
          </Link>
          <a
            href="/for-agents/skill.md"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            download
          >
            Download SKILL.md
          </a>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h2 className="font-display mb-2 text-2xl font-bold text-[var(--color-text)]">
          Tip PromptHub
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          Support the project via x402. Send USDC to:
        </p>
        <div className="mb-4 space-y-2 font-mono text-xs text-[var(--color-text-muted)]">
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
          className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Tip 0.01 USDC via x402
        </Link>
      </section>
    </AppShell>
  );
}
