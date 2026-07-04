import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { adminSessionHandler, baseHandlers } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";
import { listUsersHandler } from "./fixtures";

// Proves the nuqs ?dialog=create URL state (decision #9, vendored
// @nuqs/adapter-inertia) opens the dialog on direct navigation, without a
// Server round trip.
const handlers = [...baseHandlers, adminSessionHandler, listUsersHandler];

testWithMswMock(handlers)("vrt /user create dialog dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/user?dialog=create", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt /user create dialog light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/user?dialog=create", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
