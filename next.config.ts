import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma out of serverless bundle (avoids size limits)
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
