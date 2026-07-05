import { expect, test } from "@playwright/test";

import { baseHandlers } from "../helpers/discovery-handler";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

// Public page — no auth/session needed (no .layout).
test.describe("vrt /login", () => {
  testWithMswMock(baseHandlers)("dark", async ({ page }) => {
    // Arrange
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/login", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  testWithMswMock(baseHandlers)("light", async ({ page }) => {
    // Arrange
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/login", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
