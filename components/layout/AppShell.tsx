import { SidebarRail } from "@/components/ui/SidebarRail";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <TopBar />
      <div className="flex flex-1">
        <SidebarRail />
        <main className="ml-0 flex-1 p-6 md:p-10 lg:p-12 md:ml-[72px]">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
