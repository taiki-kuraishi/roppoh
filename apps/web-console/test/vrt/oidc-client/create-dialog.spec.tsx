import { expect, test } from "@playwright/test";

import { createBetterAuthHandler } from "../helpers/create-better-auth-handler";
import { createLoggedInUser } from "../helpers/create-logged-in-user";
import { baseHandlers } from "../helpers/discovery-handler";
import { seedOidcClients } from "../helpers/seed";
import { TestBetterAuthDatabase } from "../helpers/test-better-auth-database";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

test.describe("vrt /oidc-client create dialog", () => {
  const testAuth = new TestBetterAuthDatabase();
  test.beforeEach(async () => testAuth.begin());
  test.afterEach(() => testAuth.cleanup());

  const handlers = [...baseHandlers, createBetterAuthHandler(testAuth)];

  testWithMswMock(handlers)("dark", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    const { user } = await createLoggedInUser({
      auth,
      context,
      user: { email: "admin@example.com", name: "Admin User", role: "admin" },
    });
    await seedOidcClients(testAuth, user.id);
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/oidc-client?dialog=create", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  testWithMswMock(handlers)("light", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    const { user } = await createLoggedInUser({
      auth,
      context,
      user: { email: "admin@example.com", name: "Admin User", role: "admin" },
    });
    await seedOidcClients(testAuth, user.id);
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/oidc-client?dialog=create", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
