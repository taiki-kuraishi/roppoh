import { expect } from "@playwright/test";

import { setAuthenticated } from "../helpers/auth";
import { adminSessionHandler, baseHandlers } from "../helpers/session-handlers";
import { testWithMswMock } from "../helpers/test-with-msw-mock";
import { setTheme } from "../helpers/theme";
import { getClientsHandler } from "./fixtures";

const handlers = [...baseHandlers, adminSessionHandler, getClientsHandler];

testWithMswMock(handlers)("vrt /oidc-client create dialog dark", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "dark" });
  await page.goto("/oidc-client?dialog=create", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});

testWithMswMock(handlers)("vrt /oidc-client create dialog light", async ({ page }) => {
  await setAuthenticated(page);
  await setTheme({ page, theme: "light" });
  await page.goto("/oidc-client?dialog=create", { waitUntil: "networkidle" });
  await expect(page).toHaveScreenshot({ fullPage: true });
});
