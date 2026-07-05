import type { BrowserContext } from "@playwright/test";

import type { TestBetterAuthDatabase } from "./test-better-auth-database";

type Auth = Awaited<ReturnType<TestBetterAuthDatabase["getTestBetterAuth"]>>;
const API_HOST = "neo-fujimatsu.tsar-bmb.org";

interface Args {
  auth: Auth;
  context: BrowserContext;
  user?: Parameters<Auth["createUser"]>[0];
}

// Authenticates both auth layers web-console guards check:
// - 系B (better-auth session, used by AdminGuard/UserNavigation via
//   Auth.useSession()): a real session cookie for the cross-origin API host,
//   Minted by testUtils' getCookies().
// - 系A (OIDC "oidc:state" localStorage, used by AuthGuard, unrelated to
//   Better-auth): seeded with the same identity for a coherent UI. Must be
//   Called before page.goto() (addInitScript only affects future navigations).
export async function createLoggedInUser({ auth, context, user }: Args) {
  const created = auth.createUser(user);
  await auth.saveUser(created);

  const cookies = await auth.getCookies({ domain: API_HOST, userId: created.id });
  await context.addCookies(cookies);

  await context.addInitScript(
    ([email, name]) =>
      localStorage.setItem("oidc:state", JSON.stringify({ user: { email, name } })),
    [created.email, created.name] as const,
  );

  return { user: created };
}
