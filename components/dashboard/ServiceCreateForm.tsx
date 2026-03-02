"use client";

import { useState } from "react";

export function ServiceCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsdCents, setPriceUsdCents] = useState("");
  const [preferredChain, setPreferredChain] = useState<"evm" | "solana">("evm");
  const [payoutWalletEvm, setPayoutWalletEvm] = useState("");
  const [payoutWalletSolana, setPayoutWalletSolana] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          priceUsdCents: Math.round(parseFloat(priceUsdCents || "0") * 100),
          preferredChain,
          payoutWalletEvm: payoutWalletEvm.trim() || undefined,
          payoutWalletSolana: payoutWalletSolana.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create service");
        return;
      }
      setDone(true);
      setName("");
      setDescription("");
      setPriceUsdCents("");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-[var(--color-primary)] font-medium">
        Service created. Refresh the page to see it in the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Price (USD)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={priceUsdCents}
          onChange={(e) => setPriceUsdCents(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Preferred chain</label>
        <select
          value={preferredChain}
          onChange={(e) => setPreferredChain(e.target.value as "evm" | "solana")}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
        >
          <option value="evm">EVM (Base)</option>
          <option value="solana">Solana</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Payout wallet EVM (optional)</label>
        <input
          type="text"
          value={payoutWalletEvm}
          onChange={(e) => setPayoutWalletEvm(e.target.value)}
          placeholder="0x..."
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Payout wallet Solana (optional)</label>
        <input
          type="text"
          value={payoutWalletSolana}
          onChange={(e) => setPayoutWalletSolana(e.target.value)}
          placeholder="Base58..."
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[var(--color-primary)] px-4 py-2 font-bold text-black disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create service"}
      </button>
    </form>
  );
}
