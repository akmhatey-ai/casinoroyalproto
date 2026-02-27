import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthErrorPage() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Authentication error</h1>
        <p className="text-[#A0A0A0]">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/login" className="text-sm font-bold text-[#FF9500] hover:underline">
          Back to sign in
        </Link>
      </div>
    </AppShell>
  );
}
