import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { ServiceCreateForm } from "@/components/dashboard/ServiceCreateForm";

export default async function DashboardServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const services = await prisma.service.findMany({
    where: { vendorId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
          My services
        </h1>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          ← Dashboard
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="font-display mb-4 text-xl font-bold text-[var(--color-text)]">Create a service</h2>
        <ServiceCreateForm />
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-[var(--color-text)]">Your services</h2>
        {services.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No services yet. Create one above.</p>
        ) : (
          <ul className="space-y-4">
            {services.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{s.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">{s.description}</p>
                    <p className="mt-2 text-sm font-medium text-[var(--color-primary)]">
                      ${(s.priceUsdCents / 100).toFixed(2)} · {s.preferredChain} · {s.status}
                    </p>
                  </div>
                  <Link
                    href={`/api/services/${s.id}/access`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-bold text-black hover:opacity-90"
                  >
                    Pay / Access
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
