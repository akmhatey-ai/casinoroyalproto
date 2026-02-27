import { NextResponse } from "next/server";

// Auth is enforced in server layouts (dashboard, submit) to keep Edge bundle under Vercel's 1 MB limit.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
