import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@roppoh/shadcn/components/ui/sidebar";

import { Header } from "./components/header";
import { SidebarStaticContent } from "./components/sidebar-static-content";
import { UserNavigation } from "./components/user-navigation";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="pb-6">
          <Header />
        </SidebarHeader>
        <SidebarContent>
          <SidebarStaticContent />
        </SidebarContent>
        <SidebarFooter>
          <UserNavigation />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
