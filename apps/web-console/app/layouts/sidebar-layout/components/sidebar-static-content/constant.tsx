import type { JSX } from "react";

import { Building, Key, Users } from "lucide-react";

interface SidebarContent {
  groupTitle: string;
  items: {
    icon: () => JSX.Element;
    title: string;
    href: string;
    // NEW (decision #4): all three admin pages are gated by role in
    // Web-console; neither source app had this concept before.
    adminOnly?: boolean;
  }[];
}

export const sidebarContentList = [
  {
    groupTitle: "Management",
    items: [
      {
        adminOnly: true,
        href: "/oidc-client",
        icon: () => <Key />,
        title: "OIDC client",
      },
      {
        adminOnly: true,
        href: "/organization",
        icon: () => <Building />,
        title: "Organization",
      },
      {
        adminOnly: true,
        href: "/user",
        icon: () => <Users />,
        title: "User",
      },
    ],
  },
] as const satisfies SidebarContent[];
