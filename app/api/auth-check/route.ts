import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/auth-check
 * Returns which auth/database env are set (no secrets). Use to debug "Authentication error".
 */
export async function GET() {
  const databaseUrlSet = !!process.env.DATABASE_URL;
  const authSecretSet = !!(
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  );
  const nextAuthUrlSet = !!(
    process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL
  );

  let databaseConnected = false;
  if (databaseUrlSet) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      // leave false
    }
  }

  const ok =
    databaseUrlSet && authSecretSet && nextAuthUrlSet && databaseConnected;

  return NextResponse.json({
    ok,
    databaseUrlSet,
    authSecretSet,
    nextAuthUrlSet,
    databaseConnected,
    message: ok
      ? "Auth env and DB look good. If sign-in still fails, check GitHub OAuth callback URL and Vercel env."
      : [
          !databaseUrlSet && "Set DATABASE_URL in Vercel (Supabase connection string).",
          !authSecretSet && "Set AUTH_SECRET in Vercel (e.g. openssl rand -base64 32).",
          !nextAuthUrlSet && "Set NEXTAUTH_URL (or AUTH_URL / NEXT_PUBLIC_APP_URL) in Vercel.",
          databaseUrlSet &&
            !databaseConnected &&
            "DB unreachable. On Vercel use Supabase Transaction pooler URL (port 6543). Run: npx prisma migrate deploy",
        ]
          .filter(Boolean)
          .join(" "),
  });
}
