import { expect, test } from "@playwright/test";

import { createBetterAuthHandler } from "../helpers/create-better-auth-handler";
import { createLoggedInUser } from "../helpers/create-logged-in-user";
import { baseHandlers } from "../helpers/discovery-handler";
import { TestBetterAuthDatabase } from "../helpers/test-better-auth-database";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

// NEW role gate (decision #4): a non-admin authenticated user hitting an
// Admin-only route sees the AdminGuard 403, not the page content.
test.describe("vrt /organization forbidden (non-admin)", () => {
  const testAuth = new TestBetterAuthDatabase();
  test.beforeEach(async () => testAuth.begin());
  test.afterEach(() => testAuth.cleanup());

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
    await page.goto("/organization", { waitUntil: "networkidle" });

    // Assert
    await expect(page.getByText("403")).toBeVisible();
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
    await page.goto("/organization", { waitUntil: "networkidle" });

    // Assert
    await expect(page.getByText("403")).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
