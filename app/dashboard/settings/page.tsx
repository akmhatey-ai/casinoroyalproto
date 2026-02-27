import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WalletLinkForm } from "@/components/dashboard/WalletLinkForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display mb-10 text-4xl font-extrabold tracking-tight text-white">
          Settings
        </h1>
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
