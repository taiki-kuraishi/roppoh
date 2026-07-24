import type { BrowserContext } from "@playwright/test";

import { oidcUserStorageKey, serializeOidcUser } from "@roppoh/oidc-client/testing";

// Must match apps/roppoh/wrangler.jsonc vars / .env.local — the oidc-client-ts
// Storage key is derived from the issuer + client_id.
const ISSUER = "https://neo-fujimatsu.tsar-bmb.org/api";
const CLIENT_ID = "ZagxZfQuBthqZGMZZNPzSMKSmAfTVAXy";

interface Args {
  context: BrowserContext;
}

// Seeds a logged-in user into oidc-client-ts storage so react-oidc-context's
// UseAuth().isAuthenticated is true (the only auth layer roppoh's AuthGuard
// Checks). Must be called before page.goto() — addInitScript only affects
// Future navigations.
export async function createLoggedInUser({ context }: Args) {
  const key = oidcUserStorageKey(ISSUER, CLIENT_ID);
  const value = serializeOidcUser({ email: "user@example.com", name: "Regular User" });

  await context.addInitScript(([k, v]) => localStorage.setItem(k, v), [key, value] as const);
}
