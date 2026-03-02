import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep Prisma out of serverless bundle (avoids size limits)
  serverExternalPackages: ["@prisma/client"],
  // Do NOT use output: 'standalone' or output: 'export' — breaks Vercel deploy
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
