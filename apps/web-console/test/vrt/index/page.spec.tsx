import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { baseHandlers, userSessionHandler } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

// AppLayout only (no adminLayout) — any authenticated user, admin or not,
// Can reach "/". Uses a non-admin session to also prove the sidebar's
// "Management" group (admin-only, decision #4) is hidden for this role.
const handlers = [...baseHandlers, userSessionHandler];

testWithMswMock(handlers)("vrt / dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt / light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
