import { expect, test } from "@playwright/test";

import { createBetterAuthHandler } from "../../helpers/create-better-auth-handler";
import { createLoggedInUser } from "../../helpers/create-logged-in-user";
import { baseHandlers } from "../../helpers/discovery-handler";
import { TestBetterAuthDatabase } from "../../helpers/test-better-auth-database";
import { testWithMswMock } from "../../helpers/test-with-msw-mock";
import { setTheme } from "../__helpers/theme";

// AppLayout only (no adminLayout) — any authenticated user, admin or not,
// Can reach "/". Uses a non-admin session to also prove the sidebar's
// "Management" group (admin-only, decision #4) is hidden for this role.
test.describe("vrt /", () => {
  const testAuth = new TestBetterAuthDatabase();
  test.beforeEach(async () => testAuth.begin());
  test.afterEach(async () => testAuth.cleanup());

  const handlers = [...baseHandlers, createBetterAuthHandler(testAuth)];

  testWithMswMock(handlers)("dark", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    await createLoggedInUser({
      auth,
      context,
      user: { email: "user@example.com", name: "Regular User", role: "user" },
    });
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  testWithMswMock(handlers)("light", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    await createLoggedInUser({
      auth,
      context,
      user: { email: "user@example.com", name: "Regular User", role: "user" },
    });
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
