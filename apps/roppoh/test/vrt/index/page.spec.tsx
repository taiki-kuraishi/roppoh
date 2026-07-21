import { expect, test } from "@playwright/test";

import { createLoggedInUser } from "../../helpers/create-logged-in-user";
import { setTheme } from "../__helpers/theme";

// "/" is guarded (AuthGuard), so it needs an authenticated user to render.
test.describe("vrt /", () => {
  test("dark", async ({ context, page }) => {
    // Arrange
    await createLoggedInUser({ context });
    await setTheme({ page, theme: "dark" });

    // Act
    await page.goto("/", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test("light", async ({ context, page }) => {
    // Arrange
    await createLoggedInUser({ context });
    await setTheme({ page, theme: "light" });

    // Act
    await page.goto("/", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
