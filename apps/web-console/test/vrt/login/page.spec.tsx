import { expect } from "@playwright/test";

import { baseHandlers } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

// Public page — no auth/session needed (no .layout).
testWithMswMock(baseHandlers)("vrt /login dark", async ({ page }) => {
  await setTheme({ page, theme: "dark" });
  await page.goto("/login", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(baseHandlers)("vrt /login light", async ({ page }) => {
  await setTheme({ page, theme: "light" });
  await page.goto("/login", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
