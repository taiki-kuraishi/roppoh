import { expect, test } from "@playwright/test";

test.describe("e2e /", () => {
  test("renders Hello world", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Hello world")).toBeVisible();
  });
});
