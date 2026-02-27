import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [prompts, skills] = await Promise.all([
      prisma.prompt.findMany({ where: { status: "approved" }, select: { slug: true, updatedAt: true } }),
      prisma.skill.findMany({ where: { status: "approved" }, select: { slug: true, updatedAt: true } }),
    ]);
    for (const p of prompts) {
      entries.push({
        url: `${baseUrl}/prompts/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const s of skills) {
      entries.push({
        url: `${baseUrl}/skills/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // DB not available at build time
  }

  return entries;
}
