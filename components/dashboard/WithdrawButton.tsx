"use client";

import { useState } from "react";

type Props = { earningsCents: number; hasWallet: boolean };

export function WithdrawButton({ earningsCents, hasWallet }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (earningsCents < 100 || !hasWallet) return null;

  async function handleWithdraw() {
    setStatus("loading");
    try {
      const res = await fetch("/api/user/payout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("done");
      window.location.reload();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={status === "loading"}
        className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#A0A0A0] transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
      >
        {status === "loading" ? "Withdrawing..." : status === "done" ? "Withdrawn" : "Withdraw to wallet"}
      </button>
      {status === "error" && <p className="mt-1 text-sm text-amber-400">Withdrawal failed.</p>}
    </div>
  );
}
