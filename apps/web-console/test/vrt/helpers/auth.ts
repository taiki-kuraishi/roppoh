import type { Page } from "@playwright/test";

// Web-console is client-driven (decision #1 in the migration plan): the
// AuthGuard checks apps/web-console/app/providers/auth-provider/use-auth.ts's
// `isAuthenticated` (= Boolean(stored.user)), which reads the jotai
// AtomWithStorage-backed "oidc:state" localStorage key — NOT a server
// Session. Seed it before navigation to simulate an already-logged-in user.
// (Separately, better-auth's own session — used by AdminGuard/UserNavigation
// Via auth.useSession() — is mocked over the network via MSW, see
// Helpers' *.handler.ts files.)
export const setAuthenticated = async (page: Page) =>
  await page.context().addInitScript(() => {
    localStorage.setItem(
      "oidc:state",
      JSON.stringify({
        user: { email: "admin@example.com", name: "Admin User" },
      }),
    );
  });
