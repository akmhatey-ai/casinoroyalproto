import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Browse" },
  { href: "/submit", label: "Submit" },
  { href: "/pricing", label: "Pricing" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                {label}
              </Link>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              GitHub
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              Twitter / X
            </a>
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="font-display font-bold text-[var(--color-primary)]">PromptHub</span>
            {" — "}
            The World&apos;s Largest Prompt Marketplace
          </div>
        </div>
        <p className="mt-8 border-t border-[var(--color-border)] pt-8 text-xs text-[var(--color-text-muted)]">
          Not affiliated with Anthropic, OpenAI, or other AI providers. Prompts and skills are user-submitted.
        </p>
      </div>
    </footer>
  );
}
