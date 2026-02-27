"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[#525252] focus:border-[rgba(255,149,0,0.5)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,149,0,0.1)]";
const labelClass = "mb-1 block text-sm font-medium text-[#A0A0A0]";

type Tab = "prompt" | "skill";

export function SubmitForm() {
  const [tab, setTab] = useState<Tab>("prompt");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();

  async function submitPrompt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    try {
      const res = await fetch("/api/prompts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (form.elements.namedItem("title") as HTMLInputElement).value.trim(),
          description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim(),
          content: (form.elements.namedItem("content") as HTMLTextAreaElement).value.trim(),
          category: (form.elements.namedItem("category") as HTMLInputElement).value.trim() || undefined,
          isPremium: (form.elements.namedItem("isPremium") as HTMLInputElement).checked,
          priceUsdCents: (form.elements.namedItem("priceUsdCents") as HTMLInputElement).value
            ? Math.round(parseFloat((form.elements.namedItem("priceUsdCents") as HTMLInputElement).value) * 100)
            : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setStatus("success");
      router.push("/dashboard");
    } catch {
      setStatus("error");
    }
  }

  async function submitSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    try {
      const res = await fetch("/api/skills/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
          description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim(),
          skillMd: (form.elements.namedItem("skillMd") as HTMLTextAreaElement).value.trim(),
          category: (form.elements.namedItem("category") as HTMLInputElement).value.trim() || undefined,
          isPremium: (form.elements.namedItem("isPremium") as HTMLInputElement).checked,
          priceUsdCents: (form.elements.namedItem("priceUsdCents") as HTMLInputElement).value
            ? Math.round(parseFloat((form.elements.namedItem("priceUsdCents") as HTMLInputElement).value) * 100)
            : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setStatus("success");
      router.push("/dashboard");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("prompt")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === "prompt" ? "bg-[#FF9500] text-black font-bold" : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"}`}
        >
          Prompt
        </button>
        <button
          type="button"
          onClick={() => setTab("skill")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === "skill" ? "bg-[#FF9500] text-black font-bold" : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"}`}
        >
          Skill (SKILL.md)
        </button>
      </div>

      {tab === "prompt" && (
        <form onSubmit={submitPrompt} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input name="title" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea name="description" required rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Content (markdown) *</label>
            <textarea name="content" required rows={8} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Category (optional)</label>
            <input name="category" className={inputClass} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <input type="checkbox" name="isPremium" className="rounded border-white/20" />
              Premium (paid)
            </label>
            <input type="number" name="priceUsdCents" step="0.01" min="0" placeholder="Price (USD)" className={`w-24 ${inputClass}`} />
          </div>
          <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50">{status === "loading" ? "Submitting..." : "Submit prompt"}</button>
          {status === "error" && <p className="text-sm text-amber-400">Submission failed. Try again.</p>}
        </form>
      )}

      {tab === "skill" && (
        <form onSubmit={submitSkill} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required className={inputClass} placeholder="e.g. my-skill" />
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea name="description" required rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SKILL.md content (YAML frontmatter + markdown) *</label>
            <textarea name="skillMd" required rows={12} className={`${inputClass} font-mono`} placeholder="---\nname: ...\ndescription: ...\n---\n\n# Instructions..." />
          </div>
          <div>
            <label className={labelClass}>Category (optional)</label>
            <input name="category" className={inputClass} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <input type="checkbox" name="isPremium" className="rounded border-white/20" />
              Premium (paid)
            </label>
            <input type="number" name="priceUsdCents" step="0.01" min="0" placeholder="Price (USD)" className={`w-24 ${inputClass}`} />
          </div>
          <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50">{status === "loading" ? "Submitting..." : "Submit skill"}</button>
          {status === "error" && <p className="text-sm text-amber-400">Submission failed. Try again.</p>}
        </form>
      )}
    </div>
  );
}
