import type { RequestHandler } from "msw";

import { HttpResponse, http } from "msw";

const createdAt = "2024-01-01T00:00:00.000Z";

const mockUsers = [
  {
    banExpires: null,
    banned: false,
    banReason: null,
    createdAt,
    email: "alice@example.com",
    emailVerified: true,
    id: "user-1-id",
    image: null,
    name: "Alice Admin",
    role: "admin",
    updatedAt: createdAt,
  },
  {
    banExpires: null,
    banned: true,
    banReason: "Spam",
    createdAt,
    email: "bob@example.com",
    emailVerified: false,
    id: "user-2-id",
    image: null,
    name: "Bob User",
    role: "user",
    updatedAt: createdAt,
  },
];

export const listUsersHandler = http.get("*/admin/list-users", () =>
  HttpResponse.json({ limit: 100, offset: 0, total: mockUsers.length, users: mockUsers }),
) satisfies RequestHandler;
