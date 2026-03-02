import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { TicketCommentForm } from "@/components/dashboard/TicketCommentForm";

export default async function TicketDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await props.params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) notFound();
  const adminIds = (process.env.ADMIN_USER_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ticket.userId !== session.user.id && !adminIds.includes(session.user.id)) {
    redirect("/dashboard/tickets");
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/tickets" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← All tickets
        </Link>
        <span className="rounded px-2 py-1 text-xs font-medium uppercase text-[var(--color-text-muted)]">{ticket.status}</span>
      </div>
      <h1 className="font-display mb-2 text-2xl font-bold text-[var(--color-text)]">{ticket.title}</h1>
      <p className="mb-8 whitespace-pre-wrap text-[var(--color-text-muted)]">{ticket.description}</p>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Comments</h2>
        {ticket.comments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {ticket.comments.map((c) => (
              <li
                key={c.id}
                className={
                  c.isStaff
                    ? "rounded-lg border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5 p-3"
                    : "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                }
              >
                <p className="text-sm text-[var(--color-text)]">{c.body}</p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {c.isStaff ? "Staff" : "You"} · {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <TicketCommentForm ticketId={id} />
      </section>
    </AppShell>
  );
}
