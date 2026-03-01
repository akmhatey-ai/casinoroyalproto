"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Server config problem. On Vercel: set AUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, and run migrations (npx prisma migrate deploy).",
  AccessDenied:
    "Sign-in was denied (e.g. by signIn callback). Check auth callbacks if you restrict access.",
  Verification:
    "Email verification link expired or already used. Request a new sign-in link.",
  Callback:
    "OAuth callback failed (often database). On Vercel: set DATABASE_URL, run npx prisma migrate deploy, and set AUTH_SECRET.",
  Default:
    "Sign-in failed (often database or adapter). On Vercel: ensure DATABASE_URL is set, migrations are applied, and AUTH_SECRET is set.",
};

function AuthErrorContent() {
  const search = useSearchParams();
  const error = search.get("error") ?? "Default";
  const errorDescription = search.get("error_description") ?? null;
  const hint = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
          Authentication error
        </h1>
        <p className="text-[#A0A0A0]">
          Something went wrong during sign in. Please try again.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#FF9500]">
            Error: {error}
          </p>
          {errorDescription && (
            <p className="mb-2 text-xs text-[#A0A0A0]">{errorDescription}</p>
          )}
          <p className="text-sm text-[#A0A0A0]">{hint}</p>
        </div>
        <p className="text-xs text-[#71717A]">
          Open <strong>/api/auth-check</strong> in your browser to see what’s missing (database, AUTH_SECRET, etc.).
        </p>
        <p className="text-sm">
          <a href="/api/auth-check" className="font-bold text-[#FF9500] hover:underline">Check auth setup</a>
          {" · "}
          <Link href="/login" className="font-bold text-[#FF9500] hover:underline">Back to sign in</Link>
        </p>
      </div>
  );
}

export default function AuthErrorPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="mx-auto max-w-md text-center text-[#A0A0A0]">Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </AppShell>
  );
}
