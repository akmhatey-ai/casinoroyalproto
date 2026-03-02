import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const databaseUrlSet = !!process.env.DATABASE_URL;
  const authSecretSet = !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
  const nextAuthUrlSet = !!(process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL);
  let databaseConnected = false;
  if (databaseUrlSet) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      // leave false
    }
  }
  const ok = databaseUrlSet && authSecretSet && nextAuthUrlSet && databaseConnected;
  return NextResponse.json({
    ok,
    databaseUrlSet,
    authSecretSet,
    nextAuthUrlSet,
    databaseConnected,
    message: ok
      ? "Auth env and DB look good."
      : [
          !databaseUrlSet && "Set DATABASE_URL in Vercel.",
          !authSecretSet && "Set AUTH_SECRET in Vercel.",
          !nextAuthUrlSet && "Set NEXTAUTH_URL in Vercel.",
          databaseUrlSet && !databaseConnected && "DB unreachable.",
        ]
          .filter(Boolean)
          .join(" "),
  });
}
