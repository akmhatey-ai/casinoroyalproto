import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await prisma.prompt.findFirst({
    where: { slug, status: "approved" },
    include: { submitter: { select: { id: true, name: true } } },
  });
  if (!prompt) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link href="/search" className="mb-6 inline-block text-sm font-medium text-[#FF9500] hover:underline">
          ← Back to search
        </Link>
        <article>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            {prompt.title}
          </h1>
          <p className="mt-2 text-[#A0A0A0]">
            by {prompt.submitter.name ?? "Anonymous"} · {prompt.isPremium ? `$${(prompt.priceUsdCents ?? 0) / 100}` : "Free"} · {prompt.downloads} views
          </p>
          <p className="mt-4 text-[#A0A0A0]">{prompt.description}</p>
          <GlassPanel className="mt-6">
            <pre className="whitespace-pre-wrap font-sans text-sm text-[#A0A0A0]">{prompt.content}</pre>
          </GlassPanel>
        </article>
      </div>
    </AppShell>
  );
}
