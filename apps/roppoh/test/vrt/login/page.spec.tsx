import { expect, test } from "@playwright/test";

import { setTheme } from "../__helpers/theme";

// Public page — no auth needed (no .layout).
test.describe("vrt /login", () => {
  test("dark", async ({ page }) => {
    // Arrange
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/login", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test("light", async ({ page }) => {
    // Arrange
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/login", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
