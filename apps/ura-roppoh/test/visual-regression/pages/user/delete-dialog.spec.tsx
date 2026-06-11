import type { ReactNode } from "react";

import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { auth } from "@/libs/better-auth";

import { textMatrix } from "../../constant";
import { createRootRouteStub } from "../../helpers/route-stub";
import { setTheme } from "../../helpers/theme";
import { setViewPort } from "../../helpers/view-port";
import { PATH, mockUser, mockUsers, routeChildren } from "./fixtures";

vi.mock("nuqs/adapters/react-router/v7", () => ({
  NuqsAdapter: ({ children }: { children: ReactNode }): ReactNode => children,
}));

vi.mock("@/libs/better-auth", () => ({
  auth: {
    admin: {
      getUser: vi.fn(),
      listUserSessions: vi.fn(),
      listUsers: vi.fn(),
    },
    useSession: vi.fn().mockReturnValue({ data: null, error: null, isPending: false }),
  },
}));

describe("VRT user page - delete dialog", async () => {
  beforeEach(() => {
    vi.mocked(auth.admin.listUsers).mockResolvedValue({
      data: { users: mockUsers, total: mockUsers.length },
      error: null,
    });
    vi.mocked(auth.admin.getUser).mockResolvedValue({ data: mockUser, error: null });
  });

  it.each(textMatrix)("$name", async ({ theme, device }) => {
    // Arrange
    await setViewPort({ page, type: device });
    setTheme({ theme });
    const Stub = createRootRouteStub({ routeChildren });

    // Act
    const { container } = await render(<Stub initialEntries={[PATH]} />, {
      wrapper: withNuqsTestingAdapter({
        searchParams: { user_id: mockUser.id, dialog: "delete" },
      }),
    });

    // Assert
    await expect(container).toMatchScreenshot();
  });
});
