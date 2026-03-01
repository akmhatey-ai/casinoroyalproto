import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DiagnosticPage() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    AUTH_URL: !!process.env.AUTH_URL,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    GITHUB_ID: !!process.env.GITHUB_ID,
    GITHUB_SECRET: !!process.env.GITHUB_SECRET,
  };

  let dbStatus: "ok" | "missing_url" | "error" = "ok";
  let dbMessage = "";

  let tablesOk = false;
  if (!process.env.DATABASE_URL) {
    dbStatus = "missing_url";
    dbMessage = "DATABASE_URL is not set.";
  } else {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbMessage = "Connected.";
      const r = await prisma.$queryRaw<[{ exists: boolean }]>`
        SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') as exists
      `;
      tablesOk = r[0]?.exists ?? false;
    } catch (e) {
      dbStatus = "error";
      dbMessage = e instanceof Error ? e.message : String(e);
    }
  }

  const allOk = env.DATABASE_URL && env.AUTH_SECRET && env.NEXTAUTH_URL && dbStatus === "ok" && tablesOk;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
          Auth diagnostic
        </h1>
        <p className="text-[#A0A0A0]">
          This page shows what the server can see (no secrets). Fix any red items
          in Vercel Environment Variables, then redeploy.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display mb-4 text-xl font-bold text-white">
            Environment variables (set or not)
          </h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(env).map(([key, value]) => (
              <li
                key={key}
                className={
                  value ? "text-[#22c55e]" : "text-[#ef4444]"
                }
              >
                {value ? "✓" : "✗"} {key}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display mb-4 text-xl font-bold text-white">
            Database
          </h2>
          <p
            className={
              dbStatus === "ok"
                ? "text-[#22c55e]"
                : dbStatus === "missing_url"
                  ? "text-[#f59e0b]"
                  : "text-[#ef4444]"
            }
          >
            {dbStatus === "ok" && "✓ "}
            {dbMessage}
          </p>
          {dbStatus === "ok" && (
            <p className={tablesOk ? "mt-1 text-[#22c55e]" : "mt-1 text-[#f59e0b]"}>
              {tablesOk ? "✓ Auth tables (users, accounts, sessions) present." : "✗ Auth tables missing — run: npx prisma migrate deploy"}
            </p>
          )}
          {dbStatus === "ok" && !tablesOk && (
            <p className="mt-2 text-xs text-[#f59e0b]">
              DB connected but <code>users</code> table missing. Run:{" "}
              <code>npx prisma migrate deploy</code> against this DB.
            </p>
          )}
          {dbStatus === "error" && (
            <p className="mt-2 text-xs text-[#A0A0A0]">
              On Vercel, use Supabase &quot;Transaction&quot; pooler URL (port
              6543), not the direct URL (5432). In Supabase: Settings → Database
              → Connection string → Transaction mode.
            </p>
          )}
        </div>

        {allOk ? (
          <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-6 text-[#22c55e]">
            <p className="font-semibold">All checks passed.</p>
            <p className="mt-1 text-sm">
              If sign-in still fails, check GitHub OAuth App: Authorization
              callback URL must be exactly{" "}
              {`${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://your-app.vercel.app"}/api/auth/callback/github`}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-6 text-[#ef4444]">
            <p className="font-semibold">Fix the red / error items above.</p>
            <p className="mt-2 text-sm">
              Set variables in Vercel → Project → Settings → Environment
              Variables (Production). Then Redeploy.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
