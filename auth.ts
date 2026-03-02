import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Twitter from "next-auth/providers/twitter";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";

// Force canonical auth URL so OAuth redirect_uri matches GitHub/Google (critical on Vercel/serverless)

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
  Credentials({
    id: "wallet",
    name: "Wallet",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" },
      chain: { label: "Chain", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.message || !credentials?.signature || !credentials?.chain) return null;
      const chain = String(credentials.chain);
      if (chain !== "evm") return null; // Solana SIWS can be added similarly
      try {
        const siweMessage = new SiweMessage(credentials.message as string);
        const result = await siweMessage.verify({
          signature: credentials.signature as string,
          nonce: siweMessage.nonce,
        });
        if (!result.success) return null;
        const address = result.data.address.toLowerCase();
        let user = await prisma.user.findFirst({
          where: { walletEvm: { equals: address, mode: "insensitive" } },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              walletEvm: address,
              name: `${address.slice(0, 6)}…${address.slice(-4)}`,
            },
          });
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      } catch {
        return null;
      }
    },
  }),
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
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
});
