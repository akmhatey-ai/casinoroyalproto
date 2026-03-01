"use client";

import Link from "next/link";

type FilterPillsProps = {
  current?: "all" | "prompt" | "skill";
  /** Preserve q and premium when switching type */
  searchParams?: { q?: string; premium?: string };
};

function buildSearchHref(type: string | null, searchParams?: { q?: string; premium?: string }) {
  const params = new URLSearchParams();
  if (searchParams?.q?.trim()) params.set("q", searchParams.q.trim());
  if (searchParams?.premium) params.set("premium", searchParams.premium);
  if (type) params.set("type", type);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

const pillClass = (active: boolean) =>
  active
    ? "bg-[#FF9500] text-black font-bold"
    : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20";

export function FilterPills({ current = "all", searchParams }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={buildSearchHref(null, searchParams)}
        className={`rounded-full px-8 py-2.5 text-sm font-bold tracking-wide transition-all ${pillClass(current === "all")}`}
      >
        All
      </Link>
      <Link
        href={buildSearchHref("prompt", searchParams)}
        className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${pillClass(current === "prompt")}`}
      >
        Prompts
      </Link>
      <Link
        href={buildSearchHref("skill", searchParams)}
        className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${pillClass(current === "skill")}`}
      >
        Skills
      </Link>
      <Link
        href={buildSearchHref(null, { ...searchParams, premium: "free" })}
        className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${pillClass(searchParams?.premium === "free")}`}
      >
        Free
      </Link>
      <Link
        href={buildSearchHref(null, { ...searchParams, premium: "premium" })}
        className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${pillClass(searchParams?.premium === "premium")}`}
      >
        Premium
      </Link>
    </div>
  );
}
