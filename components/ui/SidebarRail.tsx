"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Home", icon: "lucide:home" },
  { href: "/search", label: "Browse", icon: "lucide:search" },
  { href: "/categories", label: "Categories", icon: "lucide:grid-3x3" },
  { href: "/submit", label: "Submit", icon: "lucide:plus-circle" },
  { href: "/dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
];

export function SidebarRail() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
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

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[72px] flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-bg)] py-8">
      <Link href="/" className="mb-12 flex items-center justify-center">
        <div className="font-display flex items-center text-xl font-extrabold leading-none tracking-tight">
          <span className="text-[var(--color-text)]">P</span>
          <span className="ml-0.5 rounded-[4px] bg-[var(--color-primary)] px-1 py-0.5 text-black">H</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-10">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center justify-center"
              title={label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
<div
                className="absolute left-0 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-dark)]"
                  aria-hidden
                />
              )}
              <Icon
                icon={icon}
                className="text-2xl text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]"
                style={isActive ? { color: "var(--color-primary)" } : undefined}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto" ref={ref}>
        {status === "loading" ? (
          <div className="flex items-center justify-center text-[var(--color-text-muted)]">
            <Icon icon="lucide:user-circle" className="text-2xl" />
          </div>
        ) : session?.user ? (
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              title={session.user.name ?? session.user.email ?? "Account"}
              aria-expanded={open}
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full border border-[var(--color-border)]"
                />
              ) : (
                <Icon icon="lucide:user-circle" className="text-2xl" />
              )}
            </button>
            {open && (
              <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-xl">
                <Link href="/dashboard" className="block px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/dashboard/services" className="block px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]" onClick={() => setOpen(false)}>
                  My services
                </Link>
                <Link href="/dashboard/tickets" className="block px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]" onClick={() => setOpen(false)}>
                  Support tickets
                </Link>
                <Link href="/dashboard/settings" className="block px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]" onClick={() => setOpen(false)}>
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
            className="flex items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            title="Sign in"
          >
            <Icon icon="lucide:user-circle" className="text-2xl" />
          </Link>
        )}
      </div>
    </aside>
  );
}
