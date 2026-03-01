import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/diagnostic
 * Returns JSON with env and DB checks (no secrets). Use to debug auth on live deploy.
 */
export async function GET() {
  const checks: Record<string, unknown> = {
    AUTH_SECRET: !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    AUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "NOT SET",
    DATABASE_URL_prefix: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.slice(0, 50)}...`
      : "NOT SET",
    GITHUB_ID: !!process.env.GITHUB_ID,
    GITHUB_SECRET: !!process.env.GITHUB_SECRET,
  };

  if (!process.env.DATABASE_URL) {
    checks.db_connection = "SKIP (no DATABASE_URL)";
    checks.accounts_table = "SKIP";
    checks.sessions_table = "SKIP";
    return NextResponse.json(checks);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db_connection = "ok";
  } catch (e: unknown) {
    checks.db_connection = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    checks.accounts_table = "SKIP (DB unreachable)";
    checks.sessions_table = "SKIP (DB unreachable)";
    return NextResponse.json(checks);
  }

  try {
    const count = await prisma.account.count();
    checks.accounts_table = `ok (${count} rows)`;
  } catch (e: unknown) {
    checks.accounts_table = `MISSING or ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  try {
    const count = await prisma.session.count();
    checks.sessions_table = `ok (${count} rows)`;
  } catch (e: unknown) {
    checks.sessions_table = `MISSING or ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}
