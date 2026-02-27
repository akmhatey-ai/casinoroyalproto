"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const navItems = [
  { href: "/", label: "Home", icon: "lucide:home" },
  { href: "/search", label: "Search", icon: "lucide:search" },
  { href: "/dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
  { href: "/submit", label: "Submit", icon: "lucide:plus-circle" },
];

export function SidebarRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[72px] flex-col items-center border-r border-white/5 bg-[#09090B] py-8">
      <Link href="/" className="mb-12 flex items-center justify-center">
        <div className="font-display flex items-center text-xl font-extrabold leading-none tracking-tight">
          <span className="text-white">P</span>
          <span className="ml-0.5 rounded-[4px] bg-[#FF9500] px-1 py-0.5 text-black">H</span>
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
                  className="absolute left-0 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-[#FF9500] to-[#FF5E00]"
                  aria-hidden
                />
              )}
              <Icon
                icon={icon}
                className="text-2xl text-[#A0A0A0] transition-colors group-hover:text-white"
                style={isActive ? { color: "#FF9500" } : undefined}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/login"
          className="flex items-center justify-center text-[#A0A0A0] transition-colors hover:text-white"
          title="Sign in"
        >
          <Icon icon="lucide:user-circle" className="text-2xl" />
        </Link>
      </div>
    </aside>
  );
}
