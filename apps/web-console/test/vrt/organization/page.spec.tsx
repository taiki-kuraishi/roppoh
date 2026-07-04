import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { adminSessionHandler, baseHandlers } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";

const handlers = [...baseHandlers, adminSessionHandler];

testWithMswMock(handlers)("vrt /organization dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/organization", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt /organization light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/organization", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
