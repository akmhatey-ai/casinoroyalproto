"use client";

import { useState } from "react";
import Link from "next/link";

type Props = { skillId: string; isPremium: boolean; name: string };

type Payment402 = {
  amountCents?: number;
  description?: string;
  accepts?: Array<{ scheme: string; price: string; network: string; payTo: string }>;
};

export function InstallSkillButton({ skillId, isPremium, name }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [paymentRequired, setPaymentRequired] = useState<Payment402 | null>(null);

  async function handleInstall() {
    setStatus("loading");
    setPaymentRequired(null);
    try {
      const res = await fetch(`/api/skills/${skillId}/download`);
      if (res.status === 402) {
        const data = (await res.json()) as Payment402;
        setPaymentRequired(data);
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
    <div className="flex flex-col gap-2">
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
      {paymentRequired && (
        <div className="rounded-xl border border-[#FF9500]/40 bg-[#FF9500]/10 p-4 text-sm">
          <p className="font-semibold text-white">Payment required (x402)</p>
          <p className="mt-1 text-[#A0A0A0]">
            {paymentRequired.amountCents ? `$${(paymentRequired.amountCents / 100).toFixed(2)}` : ""} — {paymentRequired.description ?? "Premium content"}
          </p>
          <p className="mt-2 text-[#A0A0A0]">
            Pay with Solana or EVM via x402, then retry with your wallet. For agents: add <code className="rounded bg-white/10 px-1">X-PAYMENT</code> header after payment.
          </p>
          <Link href="/for-agents" className="mt-2 inline-block font-bold text-[#FF9500] hover:underline">
            API / agent instructions →
          </Link>
          <button
            type="button"
            onClick={() => setPaymentRequired(null)}
            className="mt-2 block text-xs text-[#71717A] hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
