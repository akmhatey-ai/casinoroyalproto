import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

async function withErrorCapture(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
) {
  try {
    return await handler(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const url = new URL("/auth/error", req.url);
    url.searchParams.set("error", "Callback");
    url.searchParams.set("error_description", message.slice(0, 200));
    return NextResponse.redirect(url);
  }
}

export async function GET(req: NextRequest) {
  return withErrorCapture(req, (r) => handlers.GET(r));
}

export async function POST(req: NextRequest) {
  return withErrorCapture(req, (r) => handlers.POST(r));
}
