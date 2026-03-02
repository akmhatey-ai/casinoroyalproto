import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    desc: "Browse and use free prompts & skills. One-click copy and install.",
    features: ["Unlimited browsing", "Free prompts & skills", "Copy to clipboard", "Basic search"],
    cta: "Get started",
    href: "/search",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Pay per use",
    desc: "Access premium prompts and skills. Pay with x402 (USDC on Solana/EVM).",
    features: ["Everything in Free", "Premium prompts & skills", "x402 micro-payments", "No subscription"],
    cta: "Submit & earn",
    href: "/submit",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "Custom",
    desc: "For teams and high-volume use. Custom pricing and support.",
    features: ["Everything in Pro", "Bulk install", "Priority support", "Custom integrations"],
    cta: "Contact us",
    href: "/submit",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <AppShell>
      <h1 className="font-display mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
        Pricing
      </h1>
      <p className="mb-12 text-[var(--color-text-muted)]">
        Free to browse. Pay only for premium content via x402.
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border bg-[var(--color-surface)] p-8 ${
              plan.highlighted
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                : "border-[var(--color-border)]"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-4 inline-block rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-black">
                Recommended
              </span>
            )}
            <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
              {plan.name}
            </h2>
            <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{plan.price}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{plan.desc}</p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--color-text)]">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-bold ${
                plan.highlighted
                  ? "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)]"
                  : "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
