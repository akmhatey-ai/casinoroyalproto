import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { prisma } from "@/lib/prisma";
import { SearchFormClient } from "@/components/search/SearchFormClient";

type SearchParams = { q?: string; type?: string; premium?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, type, premium } = await searchParams;
  const baseWherePrompt = { status: "approved" as const, ...(premium === "free" && { isPremium: false }), ...(premium === "premium" && { isPremium: true }) };
  const baseWhereSkill = { status: "approved" as const, ...(premium === "free" && { isPremium: false }), ...(premium === "premium" && { isPremium: true }) };
  const searchQ = q?.trim();
  const wherePrompt = searchQ
    ? { ...baseWherePrompt, OR: [{ title: { contains: searchQ, mode: "insensitive" as const } }, { description: { contains: searchQ, mode: "insensitive" as const } }] }
    : baseWherePrompt;
  const whereSkill = searchQ
    ? { ...baseWhereSkill, OR: [{ name: { contains: searchQ, mode: "insensitive" as const } }, { description: { contains: searchQ, mode: "insensitive" as const } }] }
    : baseWhereSkill;

  const [prompts, skills] = await Promise.all([
    type === "skill" ? [] : prisma.prompt.findMany({ where: wherePrompt, take: 50, orderBy: { downloads: "desc" }, select: { id: true, slug: true, title: true, description: true, isPremium: true, priceUsdCents: true, submitter: { select: { name: true } } } }),
    type === "prompt" ? [] : prisma.skill.findMany({ where: whereSkill, take: 50, orderBy: { downloads: "desc" }, select: { id: true, slug: true, name: true, description: true, isPremium: true, priceUsdCents: true, submitter: { select: { name: true } } } }),
  ]);

  return (
    <AppShell>
      <h1 className="font-display mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        Search
      </h1>
      <SearchFormClient initialQ={q} initialType={type} initialPremium={premium} />
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {type !== "skill" &&
          prompts.map((p: { id: string; slug: string; title: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }) => (
            <GlassCard
              key={p.id}
              as="a"
              href={`/prompts/${p.slug}`}
              type="prompt"
              title={p.title}
              description={p.description}
              creator={p.submitter?.name ?? undefined}
              price={p.isPremium ? `$${(p.priceUsdCents ?? 0) / 100}` : "Free"}
            />
          ))}
        {type !== "prompt" &&
          skills.map((s: { id: string; slug: string; name: string; description: string; isPremium: boolean; priceUsdCents: number | null; submitter: { name: string | null } }) => (
            <GlassCard
              key={s.id}
              as="a"
              href={`/skills/${s.slug}`}
              type="skill"
              title={s.name}
              description={s.description}
              creator={s.submitter?.name ?? undefined}
              price={s.isPremium ? `$${(s.priceUsdCents ?? 0) / 100}` : "Free"}
            />
          ))}
      </div>
      {prompts.length === 0 && skills.length === 0 && (
        <p className="mt-8 text-[#A0A0A0]">No results. Try different filters or search terms.</p>
      )}
    </AppShell>
  );
}
