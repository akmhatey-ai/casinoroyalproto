"use client";

import { useState } from "react";

type Props = { skillId: string; isPremium: boolean; name: string };

export function InstallSkillButton({ skillId, isPremium, name }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleInstall() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/skills/${skillId}/download`);
      if (res.status === 402) {
        const data = await res.json();
        alert(`Premium skill. Payment required: ${data.amountCents ? `$${data.amountCents / 100}` : ""}. Use x402 client or add X-PAYMENT header.`);
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SKILL-${name.replace(/[^a-z0-9-_]/gi, "-")}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleInstall}
        disabled={status === "loading"}
        className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {status === "loading" ? "Downloading..." : status === "done" ? "Downloaded" : isPremium ? "Pay & download" : "Download SKILL.md"}
      </button>
      {status === "error" && <span className="text-sm text-amber-400">Failed. Try again.</span>}
    </div>
  );
}
