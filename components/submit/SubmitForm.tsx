"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[#525252] focus:border-[rgba(255,149,0,0.5)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,149,0,0.1)]";
const labelClass = "mb-1 block text-sm font-medium text-[#A0A0A0]";

type Tab = "prompt" | "skill" | "mcp" | "tool";

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

  async function submitUnified(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    try {
      const priceVal = (form.elements.namedItem("priceUsdCents") as HTMLInputElement).value;
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
          description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim(),
          content: (form.elements.namedItem("content") as HTMLTextAreaElement).value.trim() || undefined,
          repoUrl: (form.elements.namedItem("repoUrl") as HTMLInputElement).value.trim() || undefined,
          walletSolana: (form.elements.namedItem("walletSolana") as HTMLInputElement).value.trim() || undefined,
          walletEvm: (form.elements.namedItem("walletEvm") as HTMLInputElement).value.trim() || undefined,
          priceUsdCents: priceVal ? Math.round(parseFloat(priceVal) * 100) : undefined,
          tags: ((form.elements.namedItem("tags") as HTMLInputElement).value.trim() || "").split(/[,\s]+/).filter(Boolean),
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
      <div className="mb-6 flex flex-wrap gap-2">
        {(["prompt", "skill", "mcp", "tool"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#FF9500] text-black font-bold" : "border border-white/10 bg-white/5 text-[#D1D5DB] hover:border-white/20"}`}
          >
            {t === "mcp" ? "MCP" : t === "tool" ? "Tool" : t === "skill" ? "Skill (SKILL.md)" : "Prompt"}
          </button>
        ))}
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
            <label className={labelClass}>Category / tags (optional)</label>
            <input name="category" className={inputClass} placeholder="e.g. writing, code" />
          </div>
          <div>
            <label className={labelClass}>Repo URL (optional)</label>
            <input name="repoUrl" type="url" className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <input type="checkbox" name="isPremium" className="rounded border-white/20" />
              Premium (paid)
            </label>
            <input type="number" name="priceUsdCents" step="0.01" min="0" placeholder="Price (USD)" className={`w-24 ${inputClass}`} />
          </div>
          <p className="text-xs text-[#71717A]">Connect wallet in Dashboard for payouts.</p>
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
            <label className={labelClass}>Category / tags (optional)</label>
            <input name="category" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Repo URL (optional)</label>
            <input name="repoUrl" type="url" className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <input type="checkbox" name="isPremium" className="rounded border-white/20" />
              Premium (paid)
            </label>
            <input type="number" name="priceUsdCents" step="0.01" min="0" placeholder="Price (USD)" className={`w-24 ${inputClass}`} />
          </div>
          <p className="text-xs text-[#71717A]">Connect wallet in Dashboard for payouts.</p>
          <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50">{status === "loading" ? "Submitting..." : "Submit skill"}</button>
          {status === "error" && <p className="text-sm text-amber-400">Submission failed. Try again.</p>}
        </form>
      )}

      {(tab === "mcp" || tab === "tool") && (
        <form onSubmit={submitUnified} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required className={inputClass} placeholder={tab === "mcp" ? "e.g. my-mcp-server" : "e.g. my-tool"} />
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea name="description" required rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Content or config (optional)</label>
            <textarea name="content" rows={6} className={`${inputClass} font-mono`} placeholder="Markdown or JSON (e.g. server.json)" />
          </div>
          <div>
            <label className={labelClass}>GitHub / repo URL (optional)</label>
            <input name="repoUrl" type="url" className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className={labelClass}>Wallet for payouts (Solana or EVM, recommended)</label>
            <input name="walletSolana" className={inputClass} placeholder="Solana address" />
            <input name="walletEvm" className={`mt-2 ${inputClass}`} placeholder="EVM address (0x...)" />
          </div>
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input name="tags" className={inputClass} placeholder="mcp, api, tools" />
          </div>
          <div className="flex items-center gap-4">
            <input type="number" name="priceUsdCents" step="0.01" min="0" placeholder="Price (USD, 0 = free)" className={`w-32 ${inputClass}`} />
          </div>
          <button type="submit" disabled={status === "loading"} className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50">{status === "loading" ? "Submitting..." : `Submit ${tab}`}</button>
          {status === "error" && <p className="text-sm text-amber-400">Submission failed. Try again.</p>}
        </form>
      )}
    </div>
  );
}
