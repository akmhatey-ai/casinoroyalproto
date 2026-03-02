import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { TicketCreateForm } from "@/components/dashboard/TicketCreateForm";

export default async function DashboardTicketsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
          Support tickets
        </h1>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          ← Dashboard
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="font-display mb-4 text-xl font-bold text-[var(--color-text)]">New ticket</h2>
        <TicketCreateForm />
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-[var(--color-text)]">Your tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No tickets yet.</p>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/tickets/${t.id}`}
                  className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--color-text)]">{t.title}</span>
                    <span className="rounded px-2 py-0.5 text-xs font-medium uppercase text-[var(--color-text-muted)]">
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {t._count.comments} comment{t._count.comments !== 1 ? "s" : ""} · Updated {t.updatedAt.toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
