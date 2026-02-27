import Link from "next/link";
import { auth } from "@/auth";

export async function Header() {
  const session = await auth();
  return (
    <header className="border-b bg-background">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Prompt Hub
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-muted-foreground hover:text-foreground text-sm">
            Search
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">
                Dashboard
              </Link>
              <Link href="/submit" className="text-muted-foreground hover:text-foreground text-sm">
                Submit
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
