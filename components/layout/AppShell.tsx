import { SidebarRail } from "@/components/ui/SidebarRail";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <SidebarRail />
      <main className="ml-[72px] min-h-screen p-8 md:p-12 lg:p-16">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
