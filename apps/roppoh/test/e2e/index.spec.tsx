import { expect, test } from "@playwright/test";

import { createLoggedInUser } from "../helpers/create-logged-in-user";

// AuthGuard behaviour: "/" is guarded client-side (app/layouts/app-layout/**).
test.describe("e2e / (auth guard)", () => {
  test("redirects unauthenticated visitors to /login", async ({ page }) => {
    // Act
    await page.goto("/");

    // Assert
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("renders Hello world for an authenticated user", async ({ context, page }) => {
    // Arrange
    await createLoggedInUser({ context });

    // Act
    await page.goto("/");

    // Assert
    await expect(page.getByText("Hello world")).toBeVisible();
    await expect(page).toHaveURL("/");
  });
});
