"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Icon } from "@iconify/react";
import { useRef, useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/submit", label: "Submit" },
  { href: "/pricing", label: "Pricing" },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarSearch, setNavbarSearch] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  function handleNavbarSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = navbarSearch.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}${aiSearch ? "&ai=1" : ""}`);
    setMobileMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg)]/90"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo: PH badge + wordmark */}
        <Link
          href="/"
          className="font-display flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-[var(--color-text)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-primary)] text-sm font-black text-black">
            PH
          </span>
          <span className="hidden sm:inline">PromptHub</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-surface)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {session && (
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/dashboard")
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Navbar search (desktop) — keyword + AI toggle */}
        <form
          onSubmit={handleNavbarSearch}
          className="hidden flex-1 max-w-xs lg:flex lg:max-w-sm items-center gap-2"
        >
          <div className="relative flex-1">
            <Icon
              icon="lucide:search"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="search"
              value={navbarSearch}
              onChange={(e) => setNavbarSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setAiSearch((x) => !x)}
            className={`shrink-0 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
              aiSearch
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
            }`}
            title="Toggle AI semantic search"
          >
            AI
          </button>
        </form>

        {/* CTAs: Submit Prompt (orange) + Sign In (ghost) */}
        <div className="flex shrink-0 items-center gap-2" ref={ref}>
          <Link
            href="/submit"
            className="hidden rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[var(--color-primary-dark)] sm:inline-block"
          >
            Submit Prompt
          </Link>
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface)]" />
          ) : session?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-1.5 pr-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
                aria-expanded={open}
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <Icon
                    icon="lucide:user"
                    className="h-5 w-5 text-[var(--color-text-muted)]"
                  />
                )}
                <span className="max-w-[100px] truncate hidden xs:inline">
                  {session.user.name ?? session.user.email ?? "Account"}
                </span>
                <Icon icon="lucide:chevron-down" className="h-4 w-4 text-[var(--color-text-muted)]" />
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-xl">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((x) => !x)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] md:hidden"
            aria-label="Open menu"
          >
            <Icon icon={mobileMenuOpen ? "lucide:x" : "lucide:menu"} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {session && (
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>
          <form onSubmit={handleNavbarSearch} className="mt-3 flex gap-2">
            <input
              type="search"
              value={navbarSearch}
              onChange={(e) => setNavbarSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
            />
            <button
              type="button"
              onClick={() => setAiSearch((x) => !x)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                aiSearch ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              AI
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-black"
            >
              Search
            </button>
          </form>
          <div className="mt-3 flex gap-2">
            <Link
              href="/submit"
              className="flex-1 rounded-lg bg-[var(--color-primary)] py-2.5 text-center text-sm font-bold text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit Prompt
            </Link>
            {!session && (
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-[var(--color-primary)] py-2.5 text-center text-sm font-medium text-[var(--color-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}