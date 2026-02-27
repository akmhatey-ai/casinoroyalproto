import { NextRequest, NextResponse } from "next/server";

/**
 * Agent-friendly install endpoint.
 * GET /api/install?skill_id=xxx
 * - For free skills: redirects to download or returns content (same as /api/skills/[id]/download)
 * - For premium: returns 402 (x402 payment required)
 */
export async function GET(req: NextRequest) {
  const skillId = req.nextUrl.searchParams.get("skill_id");
  if (!skillId) {
    return NextResponse.json({ error: "skill_id is required" }, { status: 400 });
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? req.nextUrl.origin;
  const downloadUrl = `${base}/api/skills/${skillId}/download`;
  return NextResponse.redirect(downloadUrl, 302);
}
