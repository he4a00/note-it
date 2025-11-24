import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/Notes/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="p-4 flex items-center gap-2">
          <SidebarTrigger />
          <div className="h-4 w-[1px] bg-border" />
          <DashboardHeader />

          {/* Breadcrumbs could go here */}
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
