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
      select: { earningsCents: true, walletSolana: true, walletEvm: true, email: true, name: true },
    }),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <AppShell>
      <h1 className="font-display mb-10 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        Dashboard
      </h1>

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
            {submissions.map((s) => (
              <li key={s.id} className="text-sm text-[#A0A0A0]">
                {s.itemType} #{s.itemId.slice(0, 8)} — {s.status}
              </li>
            ))}
          </ul>
        )}
        <Link href="/submit" className="mt-2 inline-block text-sm font-bold text-[#FF9500] hover:underline">
          Submit a prompt or skill
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
