import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const u = username?.trim();
  if (!u) notFound();

  const user = await prisma.user.findFirst({
    where: { username: u, profilePublic: true },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      website: true,
      twitter: true,
      github: true,
      _count: { select: { prompts: true, skills: true, items: true } },
    },
  });

  if (!user) notFound();

  const totalItems = (user._count.prompts ?? 0) + (user._count.skills ?? 0) + (user._count.items ?? 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-24 w-24 rounded-full border-2 border-white/10"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-4xl text-[#A0A0A0]">
              {(user.name ?? user.username ?? "?")[0]}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              {user.name ?? user.username ?? "Anonymous"}
            </h1>
            {user.username && (
              <p className="text-[#A0A0A0]">@{user.username}</p>
            )}
            {totalItems > 0 && (
              <p className="mt-1 text-sm text-[#A0A0A0]">
                {totalItems} submission{totalItems !== 1 ? "s" : ""} on PromptHub
              </p>
            )}
          </div>
        </div>

        {user.bio && (
          <GlassPanel className="mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Bio</h2>
            <p className="mt-2 whitespace-pre-wrap text-[#D4D4D8]">{user.bio}</p>
          </GlassPanel>
        )}

        <GlassPanel>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Links</h2>
          <ul className="mt-3 space-y-2">
            {user.website && (
              <li>
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF9500] hover:underline"
                >
                  {user.website}
                </a>
              </li>
            )}
            {user.twitter && (
              <li>
                <a
                  href={`https://x.com/${user.twitter.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF9500] hover:underline"
                >
                  @{user.twitter.replace(/^@/, "")}
                </a>
              </li>
            )}
            {user.github && (
              <li>
                <a
                  href={`https://github.com/${user.github.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF9500] hover:underline"
                >
                  github.com/{user.github.replace(/^@/, "")}
                </a>
              </li>
            )}
            {!user.website && !user.twitter && !user.github && (
              <li className="text-sm text-[#A0A0A0]">No links added</li>
            )}
          </ul>
        </GlassPanel>

        <p className="mt-8 text-center text-sm text-[#A0A0A0]">
          <Link href="/search" className="text-[#FF9500] hover:underline">
            Browse all prompts & skills
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
