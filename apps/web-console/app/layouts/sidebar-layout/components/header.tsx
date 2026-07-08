import { SidebarMenu, SidebarMenuItem } from "@roppoh/shadcn/components/ui/sidebar";

export const Header = () => (
  <SidebarMenu>
    <SidebarMenuItem className="flex items-center justify-start">
      <img alt="Web Console" className="w-8 rounded-md" src="/icons/tsar-192x192.png" />
      <div className="grid flex-1 pl-2 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Web Console</span>
        <span className="truncate text-xs">web-console.tsar-bmb.org</span>
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
);
