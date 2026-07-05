import type { RequestHandler } from "msw";

import { HttpResponse, http } from "msw";

// Stubs the OIDC discovery request AuthProvider fires on mount
// (oauth4webapi's discoveryRequest against `${issuer}/.well-known/openid-configuration`).
// Nothing under test calls login()/logout(), so only enough fields to let
// DiscoveryRequest/processDiscoveryResponse resolve without throwing.
// Kept as a stub (not delegated to the real better-auth instance) since no
// VRT test completes a real OIDC flow and delegating risks an issuer-mismatch
// Error against VITE_OIDC_ISSUER for no screenshot benefit.
const discoveryHandler = http.get("*/.well-known/openid-configuration", ({ request }) => {
  const issuer = new URL(request.url).origin;
  return HttpResponse.json({
    authorization_endpoint: `${issuer}/oauth2/authorize`,
    end_session_endpoint: `${issuer}/oauth2/end-session`,
    issuer,
    jwks_uri: `${issuer}/oauth2/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    token_endpoint: `${issuer}/oauth2/token`,
    userinfo_endpoint: `${issuer}/oauth2/userinfo`,
  });
});

// Better-auth's own session (auth.useSession(), used by AdminGuard /
// SidebarStaticContent / UserNavigation) is no longer stubbed here — it's
// Served by a real better-auth instance via createBetterAuthHandler(), see
// Helpers/test-better-auth-database.ts and helpers/create-logged-in-user.ts.
export const baseHandlers = [discoveryHandler] satisfies RequestHandler[];
