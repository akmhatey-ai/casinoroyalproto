import { SidebarRail } from "@/components/ui/SidebarRail";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <TopBar />
      <div className="flex">
        <SidebarRail />
        <main className="ml-0 min-h-screen flex-1 p-6 md:p-10 lg:p-12 md:ml-[72px]">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
