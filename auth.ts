import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Twitter from "next-auth/providers/twitter";
import { prisma } from "@/lib/prisma";

// Force canonical auth URL so OAuth redirect_uri matches GitHub/Google (critical on Vercel/serverless)
const canonicalUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL;
if (canonicalUrl) {
  const base = canonicalUrl.replace(/\/$/, "");
  if (!process.env.AUTH_URL) {
    process.env.AUTH_URL = base.startsWith("http") ? `${base}/api/auth` : `https://${base}/api/auth`;
  }
}

const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const githubId = process.env.GITHUB_ID?.trim();
const githubSecret = process.env.GITHUB_SECRET?.trim();
const twitterId = process.env.TWITTER_CLIENT_ID?.trim();
const twitterSecret = process.env.TWITTER_CLIENT_SECRET?.trim();

const providers = [
  ...(googleId && googleSecret
    ? [Google({ clientId: googleId, clientSecret: googleSecret, allowDangerousEmailAccountLinking: true })]
    : []),
  ...(githubId && githubSecret
    ? [GitHub({ clientId: githubId, clientSecret: githubSecret, allowDangerousEmailAccountLinking: true })]
    : []),
  ...(twitterId && twitterSecret
    ? [Twitter({ clientId: twitterId, clientSecret: twitterSecret })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined),
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
});
