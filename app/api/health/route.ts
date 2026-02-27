import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Returns 200 if app is up. If ?db=1, also checks DB connectivity (200 = OK, 503 = DB down).
 */
export async function GET(req: Request) {
  const checkDb = req.url?.includes("db=1");
  if (!checkDb) {
    return NextResponse.json({ status: "ok" });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { status: "degraded", error: "DATABASE_URL not set" },
      { status: 503 }
    );
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json(
      { status: "degraded", error: "Database unreachable" },
      { status: 503 }
    );
  }
}
