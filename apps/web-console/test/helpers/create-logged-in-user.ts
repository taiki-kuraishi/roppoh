import type { BrowserContext } from "@playwright/test";

import { oidcUserStorageKey, serializeOidcUser } from "@roppoh/oidc-client/testing";

import type { TestBetterAuthDatabase } from "./test-better-auth-database";

type Auth = Awaited<ReturnType<TestBetterAuthDatabase["getTestBetterAuth"]>>;
const API_HOST = "neo-fujimatsu.tsar-bmb.org";
// Must match apps/web-console/wrangler.jsonc vars — the oidc-client-ts storage
// Key is derived from the issuer + client_id.
const OIDC_ISSUER = "https://neo-fujimatsu.tsar-bmb.org/api";
const OIDC_CLIENT_ID = "kNQlBnNvdBPhYFKmdDRHbBzFVtHYiggd";

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

  const oidcKey = oidcUserStorageKey(OIDC_ISSUER, OIDC_CLIENT_ID);
  const oidcValue = serializeOidcUser({ email: created.email, name: created.name });
  await context.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    oidcKey,
    oidcValue,
  ] as const);

  return { user: created };
}
