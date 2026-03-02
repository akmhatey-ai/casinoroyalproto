import { NextResponse } from "next/server";

// Empty matcher = middleware never runs; kept for compatibility.
// Auth is enforced in server layouts to keep Edge bundle under Vercel's 1 MB limit.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
