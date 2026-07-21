import { expect, test } from "@playwright/test";

test.describe("vrt /", () => {
  test("index", async ({ page }) => {
    // Act
    await page.goto("/", { waitUntil: "networkidle" });

    // Assert
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
