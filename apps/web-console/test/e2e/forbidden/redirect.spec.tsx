import { expect, test } from "@playwright/test";

import { createBetterAuthHandler } from "../../helpers/create-better-auth-handler";
import { createLoggedInUser } from "../../helpers/create-logged-in-user";
import { baseHandlers } from "../../helpers/discovery-handler";
import { TestBetterAuthDatabase } from "../../helpers/test-better-auth-database";
import { testWithMswMock } from "../../helpers/test-with-msw-mock";

// NEW role gate (decision #4): a non-admin authenticated user hitting an
// Admin-only route is toast-notified and redirected to "/", instead of
// Seeing the admin page content. Behavioral only, so it lives under test/e2e
// (no toHaveScreenshot): the redirect target "/" already has its own visual
// Coverage in vrt/index/page.spec.tsx, and theme doesn't affect this guard's
// Logic.
test.describe("e2e /organization forbidden (non-admin)", () => {
  const testAuth = new TestBetterAuthDatabase();
  test.beforeEach(async () => testAuth.begin());
  test.afterEach(() => testAuth.cleanup());

  const handlers = [...baseHandlers, createBetterAuthHandler(testAuth)];

  testWithMswMock(handlers)("redirects to / with a toast", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    await createLoggedInUser({
      auth,
      context,
      user: { email: "user@example.com", name: "Regular User", role: "user" },
    });

    // Act
    await page.goto("/organization", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Admin access required.")).toBeVisible();
  });
});
