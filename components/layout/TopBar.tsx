"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Icon } from "@iconify/react";
import { useRef, useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/submit", label: "Submit" },
];

export function TopBar() {
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
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#09090B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#09090B]/80">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
        <Link href="/" className="font-display flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
          <img src="/prompthub-icon.png" alt="" className="h-7 w-7 rounded" />
          <span>PromptHub</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-[#FF9500]" : "text-[#A0A0A0] hover:bg-white/5 hover:text-white"
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
                pathname.startsWith("/dashboard") ? "bg-white/10 text-[#FF9500]" : "text-[#A0A0A0] hover:bg-white/5 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2" ref={ref}>
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
          ) : session?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                aria-expanded={open}
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <Icon icon="lucide:user" className="text-lg text-[#A0A0A0]" />
                )}
                <span className="max-w-[120px] truncate text-[#D4D4D8]">
                  {session.user.name ?? session.user.email ?? "Account"}
                </span>
                <Icon icon="lucide:chevron-down" className="text-[#A0A0A0]" />
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-[#0a0a0a] py-1 shadow-xl">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#FF9500] px-6 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95"
            >
              Login / Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
