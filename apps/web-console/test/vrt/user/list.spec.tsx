import { expect, test } from "@playwright/test";

import { createBetterAuthHandler } from "../../helpers/create-better-auth-handler";
import { createLoggedInUser } from "../../helpers/create-logged-in-user";
import { baseHandlers } from "../../helpers/discovery-handler";
import { TestBetterAuthDatabase } from "../../helpers/test-better-auth-database";
import { testWithMswMock } from "../../helpers/test-with-msw-mock";
import { seedUsers } from "../__helpers/seed";
import { setTheme } from "../__helpers/theme";

test.describe("vrt /user", () => {
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
      user: { email: "admin@example.com", name: "Admin User", role: "admin" },
    });
    await seedUsers(auth);
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/user", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  testWithMswMock(handlers)("light", async ({ context, page }) => {
    // Arrange
    const auth = await testAuth.getTestBetterAuth();
    await createLoggedInUser({
      auth,
      context,
      user: { email: "admin@example.com", name: "Admin User", role: "admin" },
    });
    await seedUsers(auth);
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/user", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
