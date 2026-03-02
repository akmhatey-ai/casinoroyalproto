"use client";

import { useState } from "react";

type PaymentButtonProps =
  | { type: "tip"; amountCents: number; toUserId?: string; label?: string }
  | { type: "service"; serviceId: string; label?: string };

/**
 * Triggers x402 flow: fetches payment requirement (402), shows amount and pay options.
 * User pays via wallet (WalletConnect / Phantom / MetaMask) then retries with PAYMENT-SIGNATURE.
 */
export function PaymentButton(props: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [requirement, setRequirement] = useState<{ amountCents: number; description: string; accepts: Array<{ network: string; payTo: string; price: string }> } | null>(null);
  const [error, setError] = useState("");

  const label = props.label ?? (props.type === "tip" ? `Tip $${(props.amountCents / 100).toFixed(2)}` : "Pay with USDC");

  async function handleClick() {
    setError("");
    setRequirement(null);
    setLoading(true);
    try {
      const url =
        props.type === "tip"
          ? `/api/payments?type=tip&amountCents=${props.amountCents}${props.toUserId ? `&toUserId=${props.toUserId}` : ""}`
          : `/api/payments?type=service&id=${props.serviceId}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setRequirement(data);
        return;
      }
      if (!res.ok) setError(data.error ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-[var(--color-primary)] px-4 py-2 font-bold text-black disabled:opacity-50"
      >
        {loading ? "Loading…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {requirement && (
        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
          <p className="font-medium text-[var(--color-text)]">{requirement.description}</p>
          <p className="mt-1 text-[var(--color-text-muted)]">Amount: ${(requirement.amountCents / 100).toFixed(2)} USDC</p>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Pay with your wallet (Phantom, MetaMask, or WalletConnect), then retry this request with the <strong>PAYMENT-SIGNATURE</strong> header.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-muted)]">
            {requirement.accepts?.slice(0, 3).map((a: { network: string; payTo: string; price: string }, i: number) => (
              <li key={i}>{a.network}: {a.payTo.slice(0, 12)}… — {a.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
