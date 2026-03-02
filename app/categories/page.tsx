import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { id: "coding", label: "Coding", icon: "lucide:code" },
  { id: "writing", label: "Writing", icon: "lucide:pen-line" },
  { id: "marketing", label: "Marketing", icon: "lucide:megaphone" },
  { id: "data", label: "Data Analysis", icon: "lucide:bar-chart-3" },
  { id: "devops", label: "DevOps", icon: "lucide:server" },
  { id: "agent", label: "Agent Workflows", icon: "lucide:bot" },
  { id: "image", label: "Image Gen", icon: "lucide:image" },
  { id: "research", label: "Research", icon: "lucide:search" },
  { id: "productivity", label: "Productivity", icon: "lucide:zap" },
  { id: "other", label: "Other", icon: "lucide:folder" },
];

export default async function CategoriesPage() {
  let counts: Record<string, number> = {};
  if (process.env.DATABASE_URL) {
    try {
      const [prompts, skills] = await Promise.all([
        prisma.prompt.groupBy({ by: ["category"], where: { status: "approved" }, _count: true }),
        prisma.skill.groupBy({ by: ["category"], where: { status: "approved" }, _count: true }),
      ]);
      for (const p of prompts) {
        const cat = (p.category ?? "other").toLowerCase();
        counts[cat] = (counts[cat] ?? 0) + p._count;
      }
      for (const s of skills) {
        const cat = (s.category ?? "other").toLowerCase();
        counts[cat] = (counts[cat] ?? 0) + s._count;
      }
    } catch {
      // DB not available
    }
  }

  return (
    <AppShell>
      <h1 className="font-display mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
        Categories
      </h1>
      <p className="mb-10 text-[var(--color-text-muted)]">
        Browse prompts and skills by category.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const count = counts[cat.id] ?? 0;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="glass-card flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-hover)]"
            >
              <span className="font-display text-lg font-bold text-[var(--color-text)]">
                {cat.label}
              </span>
              <span className="mt-1 text-sm text-[var(--color-text-muted)]">
                {count} prompt{count !== 1 ? "s" : ""}
              </span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
