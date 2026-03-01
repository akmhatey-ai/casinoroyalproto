"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";

type Props = { initialQ?: string; initialType?: string; initialPremium?: string };

export function SearchFormClient({ initialQ, initialType, initialPremium }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const type = initialType ?? searchParams.get("type") ?? undefined;
  const current = type === "prompt" ? "prompt" : type === "skill" ? "skill" : "all";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    const premium = initialPremium ?? searchParams.get("premium");
    if (premium) params.set("premium", premium);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="mb-8">
      {type && <input type="hidden" name="type" value={type} />}
      {(initialPremium ?? searchParams.get("premium")) && (
        <input type="hidden" name="premium" value={initialPremium ?? searchParams.get("premium") ?? ""} />
      )}
      <SearchInput
        name="q"
        defaultValue={initialQ ?? searchParams.get("q") ?? ""}
        placeholder="Search prompts, skills, and AI tools"
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <FilterPills
          current={current}
          searchParams={{
            q: initialQ ?? searchParams.get("q") ?? undefined,
            premium: (initialPremium ?? searchParams.get("premium")) ?? undefined,
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
