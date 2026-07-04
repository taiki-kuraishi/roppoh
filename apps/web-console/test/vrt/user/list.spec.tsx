import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { adminSessionHandler, baseHandlers } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";
import { listUsersHandler } from "./fixtures";

const handlers = [...baseHandlers, adminSessionHandler, listUsersHandler];

testWithMswMock(handlers)("vrt /user dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/user", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt /user light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/user", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
