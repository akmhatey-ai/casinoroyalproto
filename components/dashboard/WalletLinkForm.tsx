"use client";

import { useState } from "react";

export function WalletLinkForm() {
  const [chain, setChain] = useState<"solana" | "evm">("solana");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address: address.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
      setStatus("success");
      setAddress("");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 max-w-md space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">Chain</label>
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value as "solana" | "evm")}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] backdrop-blur-[12px] focus:border-[rgba(212,168,75,0.4)] focus:outline-none"
        >
          <option value="solana">Solana</option>
          <option value="evm">EVM (Ethereum, Base, etc.)</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#D4D4D8]">Wallet address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={chain === "solana" ? "e.g. 5FHne..." : "0x..."}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[#D4D4D8] placeholder:text-zinc-500 backdrop-blur-[12px] focus:border-[rgba(212,168,75,0.4)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !address.trim()}
        className="rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {status === "loading" ? "Saving..." : "Save wallet"}
      </button>
      {status === "success" && <p className="text-sm text-emerald-400">Wallet saved.</p>}
      {status === "error" && <p className="text-sm text-amber-400">Could not save. Try again.</p>}
    </form>
  );
}
