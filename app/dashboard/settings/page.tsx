import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WalletLinkForm } from "@/components/dashboard/WalletLinkForm";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
          Settings
        </h1>

        <GlassPanel>
          <h2 className="font-display text-lg font-bold tracking-tight text-white">Profile (public page)</h2>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Set a username, bio, website, and socials. Choose whether your profile is publicly viewable.
          </p>
          <div className="mt-4">
            <ProfileForm />
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="font-display text-lg font-bold tracking-tight text-white">Connect wallet (for payouts)</h2>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Link your Solana or EVM wallet to receive earnings and tips.
          </p>
          <WalletLinkForm />
        </GlassPanel>
      </div>
    </AppShell>
  );
}
