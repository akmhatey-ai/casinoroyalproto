import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WithdrawButton } from "@/components/dashboard/WithdrawButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, submissions, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { earningsCents: true, walletSolana: true, walletEvm: true, email: true, name: true, image: true, username: true, profilePublic: true },
    }),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const itemIds = submissions.filter((s) => s.itemType === "item").map((s) => s.itemId);
  const promptIds = submissions.filter((s) => s.itemType === "prompt").map((s) => s.itemId);
  const skillIds = submissions.filter((s) => s.itemType === "skill").map((s) => s.itemId);
  const [items, prompts, skills] = await Promise.all([
    itemIds.length ? prisma.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, name: true, slug: true, type: true } }) : [],
    promptIds.length ? prisma.prompt.findMany({ where: { id: { in: promptIds } }, select: { id: true, title: true, slug: true } }) : [],
    skillIds.length ? prisma.skill.findMany({ where: { id: { in: skillIds } }, select: { id: true, name: true, slug: true } }) : [],
  ]);
  const itemMap = Object.fromEntries(items.map((i) => [i.id, { name: i.name, slug: i.slug, type: i.type }]));
  const promptMap = Object.fromEntries(prompts.map((p) => [p.id, { name: p.title, slug: p.slug }]));
  const skillMap = Object.fromEntries(skills.map((s) => [s.id, { name: s.name, slug: s.slug }]));
  const submissionNames: Record<string, { name: string; slug: string; type?: string }> = {};
  for (const s of submissions) {
    if (s.itemType === "item") submissionNames[s.itemId] = itemMap[s.itemId] ?? { name: s.itemId.slice(0, 8), slug: "" };
    else if (s.itemType === "prompt") submissionNames[s.itemId] = promptMap[s.itemId] ?? { name: s.itemId.slice(0, 8), slug: "" };
    else if (s.itemType === "skill") submissionNames[s.itemId] = skillMap[s.itemId] ?? { name: s.itemId.slice(0, 8), slug: "" };
  }

  return (
    <AppShell>
      <div className="mb-10 flex items-center gap-4">
        {user?.image && (
          <img src={user.image} alt="" className="h-14 w-14 rounded-full border border-white/10" />
        )}
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Dashboard
          </h1>
          <p className="mt-1 text-[#A0A0A0]">{user?.name ?? user?.email ?? "User"}</p>
          {user?.username && user?.profilePublic !== false && (
            <Link href={`/profile/${user.username}`} className="mt-2 inline-block text-sm font-medium text-[#FF9500] hover:underline">
              View public profile →
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <GlassPanel>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">
            Earnings
          </h2>
          <p className="mt-2 font-display text-3xl font-bold text-white">
            ${((user?.earningsCents ?? 0) / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[#A0A0A0]">Withdraw to your linked wallet in Settings.</p>
          <WithdrawButton earningsCents={user?.earningsCents ?? 0} hasWallet={!!(user?.walletSolana ?? user?.walletEvm)} />
        </GlassPanel>

        <GlassPanel>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">
            Wallets
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[#A0A0A0]">
            <li>Solana: {user?.walletSolana ? `${user.walletSolana.slice(0, 8)}...` : "Not linked"}</li>
            <li>EVM: {user?.walletEvm ? `${user.walletEvm.slice(0, 10)}...` : "Not linked"}</li>
          </ul>
          <Link href="/dashboard/settings" className="mt-3 inline-block text-sm text-[#FF9500] font-bold hover:underline">
            Connect wallet in Settings
          </Link>
        </GlassPanel>
      </div>

      <section className="mt-16">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight text-white">
          Recent submissions
        </h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">No submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((s) => {
              const info = submissionNames[s.itemId];
              const href = s.itemType === "prompt" ? `/prompts/${info?.slug}` : s.itemType === "skill" ? `/skills/${info?.slug}` : null;
              return (
                <li key={s.id} className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium uppercase text-[#A0A0A0]">
                    {s.itemType}
                  </span>
                  {href ? (
                    <Link href={href} className="font-medium text-white hover:text-[#FF9500]">
                      {info?.name ?? s.itemId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span>{info?.name ?? s.itemId.slice(0, 8)}</span>
                  )}
                  <span>— {s.status}</span>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/submit" className="mt-2 inline-block text-sm font-bold text-[#FF9500] hover:underline">
          Submit a prompt, skill, MCP, or tool
        </Link>
      </section>

      <section className="mt-16">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight text-white">
          Recent transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li key={t.id} className="text-sm text-[#A0A0A0]">
                {t.itemType} — ${(t.amountCents / 100).toFixed(2)} — {t.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
