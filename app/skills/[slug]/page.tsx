import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { InstallSkillButton } from "@/components/skills/InstallSkillButton";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = await prisma.skill.findFirst({
    where: { slug, status: "approved" },
    include: { submitter: { select: { id: true, name: true } } },
  });
  if (!skill) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link href="/search" className="mb-6 inline-block text-sm font-medium text-[#FF9500] hover:underline">
          ← Back to search
        </Link>
        <article>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            {skill.name}
          </h1>
          <p className="mt-2 text-[#A0A0A0]">
            by {skill.submitter.name ?? "Anonymous"} · {skill.isPremium ? `$${(skill.priceUsdCents ?? 0) / 100}` : "Free"} · {skill.downloads} downloads
          </p>
          <p className="mt-4 text-[#A0A0A0]">{skill.description}</p>
          <div className="mt-6 flex gap-3">
            <InstallSkillButton skillId={skill.id} isPremium={skill.isPremium} name={skill.name} />
          </div>
          <GlassPanel className="mt-6">
            <pre className="whitespace-pre-wrap overflow-x-auto font-sans text-sm text-[#A0A0A0]">{skill.skillMd}</pre>
          </GlassPanel>
        </article>
      </div>
    </AppShell>
  );
}
