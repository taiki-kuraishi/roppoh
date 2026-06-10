import type { User } from "@/pages/user/types";

import SidebarLayout from "@/layouts/sidebar-layout";
import UserPage from "@/pages/user/page";

import type { RouteChildren } from "../../helpers/route-stub";

export const PATH = "/user";

export const routeChildren: RouteChildren = [
  {
    Component: SidebarLayout,
    children: [{ Component: UserPage, path: PATH }],
  },
];

const createdAt = new Date("2024-01-01T00:00:00.000Z");
const expiresAt = new Date("2024-01-08T00:00:00.000Z");

export const mockUser: User = {
  id: "user-1-id",
  name: "Alice Admin",
  email: "alice@example.com",
  emailVerified: true,
  image: null,
  role: "admin",
  banned: false,
  banReason: null,
  banExpires: null,
  createdAt,
  updatedAt: createdAt,
};

export const mockBannedUser: User = {
  id: "user-2-id",
  name: "Bob User",
  email: "bob@example.com",
  emailVerified: false,
  image: null,
  role: "user",
  banned: true,
  banReason: "Spam",
  banExpires: null,
  createdAt,
  updatedAt: createdAt,
};

export const mockUsers: User[] = [mockUser, mockBannedUser];

export const mockSessions = [
  {
    id: "session-1-id",
    token: "session-1-token",
    userId: "user-1-id",
    ipAddress: "192.168.0.1",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    createdAt,
    updatedAt: createdAt,
    expiresAt,
    impersonatedBy: null,
  },
];
