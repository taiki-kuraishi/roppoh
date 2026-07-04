import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { baseHandlers, userSessionHandler } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

// NEW role gate (decision #4): a non-admin authenticated user hitting an
// Admin-only route sees the AdminGuard 403, not the page content.
const handlers = [...baseHandlers, userSessionHandler];

testWithMswMock(handlers)("vrt /organization forbidden (non-admin) dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/organization", { waitUntil: "networkidle" });
  await expect(page.getByText("403")).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt /organization forbidden (non-admin) light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/organization", { waitUntil: "networkidle" });
  await expect(page.getByText("403")).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
