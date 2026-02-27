import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  try {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/auth/");
    if (!isLoggedIn && !isAuthPage && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/submit"))) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  } catch {
    // Allow request through if auth fails (e.g. DB unavailable)
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/submit/:path*", "/login", "/auth/:path*"],
};
