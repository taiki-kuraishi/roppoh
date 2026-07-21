import type { BrowserContext } from "@playwright/test";

interface User {
  email: string;
  name: string;
}

interface Args {
  context: BrowserContext;
  user?: User;
}

// Seeds the single auth layer roppoh's AuthGuard checks: the OIDC "oidc:state"
// LocalStorage entry read via useAuth() (isAuthenticated = Boolean(user)).
// Roppoh has no session-cookie guard (no useSession()), so unlike web-console
// This does not mint a real better-auth session. Must be called before
// Page.goto() — addInitScript only affects future navigations.
export async function createLoggedInUser({
  context,
  user = { email: "user@example.com", name: "Regular User" },
}: Args) {
  await context.addInitScript(
    ([email, name]) =>
      localStorage.setItem("oidc:state", JSON.stringify({ user: { email, name } })),
    [user.email, user.name] as const,
  );

  return { user };
}
