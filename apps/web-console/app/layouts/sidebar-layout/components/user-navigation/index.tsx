import { Avatar, AvatarFallback, AvatarImage } from "@roppoh/shadcn/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@roppoh/shadcn/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@roppoh/shadcn/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";

import { auth } from "@/libs/better-auth";

import { LogoutButton } from "./components/logout-button";
import { ThemeSwitcher } from "./components/theme-switcher";

export function UserNavigation() {
  const { isMobile } = useSidebar();
  const { data } = auth.useSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={`${data?.user.name}-icon`} src={data?.user.image || ""} />
                  <AvatarFallback className="rounded-lg">{data?.user.name}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{data?.user.name}</span>
                  <span className="truncate text-xs">{data?.user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <ThemeSwitcher />
              <LogoutButton />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
