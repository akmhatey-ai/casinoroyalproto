"use client";

import Link from "next/link";

type FilterPillsProps = {
  current?: "all" | "prompt" | "skill";
};

export function FilterPills({ current = "all" }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/search"
        className={`rounded-full px-8 py-2.5 text-sm font-bold tracking-wide transition-all ${
          current === "all"
            ? "bg-[#FF9500] text-black"
            : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"
        }`}
      >
        All
      </Link>
      <Link
        href="/search?type=prompt"
        className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${
          current === "prompt"
            ? "bg-[#FF9500] text-black font-bold"
            : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"
        }`}
      >
        Prompts
      </Link>
      <Link
        href="/search?type=skill"
        className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${
          current === "skill"
            ? "bg-[#FF9500] text-black font-bold"
            : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"
        }`}
      >
        Skills
      </Link>
    </div>
  );
}
