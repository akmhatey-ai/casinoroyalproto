/**
 * One-time seed: copy approved prompts and skills into the unified items table.
 * Run: npx tsx scripts/seed-items-from-legacy.ts
 * Requires DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const prompts = await prisma.prompt.findMany({
    where: { status: "approved" },
    include: { submitter: { select: { id: true, walletSolana: true, walletEvm: true } } },
  });
  const skills = await prisma.skill.findMany({
    where: { status: "approved" },
    include: { submitter: { select: { id: true, walletSolana: true, walletEvm: true } } },
  });

  let created = 0;
  for (const p of prompts) {
    const slug = `prompt-${p.slug}`;
    await prisma.item.upsert({
      where: { slug },
      create: {
        type: "prompt",
        name: p.title,
        slug,
        description: p.description,
        content: p.content,
        authorId: p.submitterId,
        walletSolana: p.submitter?.walletSolana ?? null,
        walletEvm: p.submitter?.walletEvm ?? null,
        priceUsdCents: p.priceUsdCents,
        isFree: !p.isPremium,
        downloads: p.downloads,
        status: "approved",
        tags: p.category ? [p.category] : [],
      },
      update: {
        downloads: p.downloads,
        updatedAt: new Date(),
      },
    });
    created += 1;
  }
  for (const s of skills) {
    const slug = `skill-${s.slug}`;
    await prisma.item.upsert({
      where: { slug },
      create: {
        type: "skill",
        name: s.name,
        slug,
        description: s.description,
        content: s.skillMd,
        configJson: s.integrations ?? undefined,
        authorId: s.submitterId,
        walletSolana: s.submitter?.walletSolana ?? null,
        walletEvm: s.submitter?.walletEvm ?? null,
        priceUsdCents: s.priceUsdCents,
        isFree: !s.isPremium,
        downloads: s.downloads,
        status: "approved",
        tags: s.category ? [s.category] : [],
      },
      update: {
        downloads: s.downloads,
        updatedAt: new Date(),
      },
    });
    created += 1;
  }
  console.log(`Seeded ${created} items (${prompts.length} prompts, ${skills.length} skills).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
