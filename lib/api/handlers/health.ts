import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const checkDb = req.url?.includes("db=1");
  if (!checkDb) return NextResponse.json({ status: "ok" });
  if (!process.env.DATABASE_URL)
    return NextResponse.json(
      { status: "degraded", error: "DATABASE_URL not set" },
      { status: 503 }
    );
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
