import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
  const hasGitHub = !!(process.env.GITHUB_ID?.trim() && process.env.GITHUB_SECRET?.trim());
  const hasTwitter = !!(process.env.TWITTER_CLIENT_ID?.trim() && process.env.TWITTER_CLIENT_SECRET?.trim());
  const hasAnyOAuth = hasGoogle || hasGitHub || hasTwitter;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
          Sign in
        </h1>
        <GlassPanel className="w-full">
          <p className="mb-6 text-center text-[#A0A0A0]">
            Sign in to submit prompts and skills, earn from tips, and manage your content.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {hasGoogle && (
              <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#FF9500] px-8 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95 sm:w-auto"
                >
                  Sign in with Google
                </button>
              </form>
            )}
            {hasGitHub && (
              <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}>
                <button
                  type="submit"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-medium text-[#A0A0A0] transition-colors hover:border-white/20 hover:text-white sm:w-auto"
                >
                  Sign in with GitHub
                </button>
              </form>
            )}
            {hasTwitter && (
              <form action={async () => { "use server"; await signIn("twitter", { redirectTo: "/dashboard" }); }}>
                <button
                  type="submit"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-medium text-[#A0A0A0] transition-colors hover:border-white/20 hover:text-white sm:w-auto"
                >
                  Sign in with X
                </button>
              </form>
            )}
            {!hasAnyOAuth && (
              <p className="text-center text-sm text-[#A0A0A0]">
                Add GOOGLE_CLIENT_ID, GITHUB_ID, or TWITTER_CLIENT_ID (and secrets) to .env to enable sign-in.
              </p>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-[#A0A0A0]">
            Connect a wallet later in Dashboard for payouts.
          </p>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
