"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function DashboardNav() {
  return (
    <header className="border-b">
      <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="font-medium">
            Prompt Hub
          </Link>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/dashboard/settings" className="text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <Link href="/submit" className="text-muted-foreground hover:text-foreground">
            Submit
          </Link>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}
