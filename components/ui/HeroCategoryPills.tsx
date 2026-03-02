"use client";

import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "marketing", label: "Marketing" },
  { id: "data", label: "Data" },
  { id: "devops", label: "DevOps" },
  { id: "agent", label: "Agent" },
  { id: "image", label: "Image Gen" },
  { id: "research", label: "Research" },
  { id: "productivity", label: "Productivity" },
  { id: "other", label: "Other" },
];

export function HeroCategoryPills({ current }: { current?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = (current ?? "all") === cat.id;
        const href = cat.id === "all" ? "/search" : `/search?category=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-primary)] text-black"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text)]"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
