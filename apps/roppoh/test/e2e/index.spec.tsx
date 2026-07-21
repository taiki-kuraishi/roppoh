import { expect, test } from "@playwright/test";

import { createLoggedInUser } from "../helpers/create-logged-in-user";
import { baseHandlers } from "../helpers/discovery-handler";
import { testWithMswMock } from "../helpers/test-with-msw-mock";

// AuthGuard behaviour: "/" is guarded client-side (app/layouts/compose.tsx).
test.describe("e2e / (auth guard)", () => {
  testWithMswMock(baseHandlers)(
    "redirects unauthenticated visitors to /login",
    async ({ page }) => {
      // Act
      await page.goto("/");

      // Assert
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByText("Welcome back")).toBeVisible();
    },
  );

  testWithMswMock(baseHandlers)(
    "renders Hello world for an authenticated user",
    async ({ context, page }) => {
      // Arrange
      await createLoggedInUser({ context });

      // Act
      await page.goto("/");

      // Assert
      await expect(page.getByText("Hello world")).toBeVisible();
      await expect(page).toHaveURL("/");
    },
  );
});
