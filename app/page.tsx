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
        Discover prompts & skills for AI agents
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-[#A0A0A0]">
        Search, browse, and one-click install. Free and premium content. Pay with x402.
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

      <section>
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
    </AppShell>
  );
}
