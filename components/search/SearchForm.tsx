"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
type Props = { initialQ?: string; initialType?: string; initialPremium?: string };

export function SearchForm({ initialQ, initialType, initialPremium }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    const type = (form.elements.namedItem("type") as HTMLSelectElement).value;
    const premium = (form.elements.namedItem("premium") as HTMLSelectElement).value;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type && type !== "all") params.set("type", type);
    if (premium && premium !== "all") params.set("premium", premium);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <input
        type="search"
        name="q"
        defaultValue={initialQ ?? searchParams.get("q") ?? ""}
        placeholder="Search..."
        className="min-w-[200px] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[#525252] focus:border-[rgba(255,149,0,0.5)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,149,0,0.1)]"
      />
      <select
        name="type"
        defaultValue={initialType ?? searchParams.get("type") ?? "all"}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-[rgba(255,149,0,0.5)] focus:outline-none"
      >
        <option value="all">All</option>
        <option value="prompt">Prompts</option>
        <option value="skill">Skills</option>
      </select>
      <select
        name="premium"
        defaultValue={initialPremium ?? searchParams.get("premium") ?? "all"}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-[rgba(255,149,0,0.5)] focus:outline-none"
      >
        <option value="all">All</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
      <button type="submit" disabled={isPending} className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50">
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
