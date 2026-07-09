import { Link } from "@inertiajs/react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@roppoh/shadcn/components/ui/sidebar";

import { auth } from "@/libs/better-auth";

import { sidebarContentList } from "./constant";

export function SidebarStaticContent() {
  const { data } = auth.useSession();
  const roles = (data?.user.role ?? "").split(",");
  const isAdmin = roles.includes("admin");

  const groups = sidebarContentList
    .map((content) => ({
      groupTitle: content.groupTitle,
      items: content.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((content) => content.items.length > 0);

  return (
    <>
      {groups.map((content) => (
        <SidebarGroup key={content.groupTitle}>
          <SidebarGroupLabel>{content.groupTitle}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {content.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href}>
                    <SidebarMenuButton>
                      <item.icon />
                      {item.title}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
