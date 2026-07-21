import type { RequestHandler } from "msw";

import { HttpResponse, http } from "msw";

// Stubs the OIDC discovery request AuthProvider fires on mount
// (oauth4webapi's discoveryRequest against `${issuer}/.well-known/openid-configuration`).
// Nothing under test calls login()/logout(), so only enough fields to let
// DiscoveryRequest/processDiscoveryResponse resolve without throwing.
const discoveryHandler = http.get("*/.well-known/openid-configuration", ({ request }) => {
  const url = new URL(request.url);
  // The `issuer` in the response must equal VITE_OIDC_ISSUER
  // (https://neo-fujimatsu.tsar-bmb.org/api) or processDiscoveryResponse throws
  // And `as` never resolves — which would leave AuthGuard's isLoading stuck.
  const issuer = url.href.replace(/\/\.well-known\/openid-configuration$/, "");
  const { origin } = url;
  return HttpResponse.json({
    authorization_endpoint: `${origin}/oauth2/authorize`,
    end_session_endpoint: `${origin}/oauth2/end-session`,
    issuer,
    jwks_uri: `${origin}/oauth2/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    token_endpoint: `${origin}/oauth2/token`,
    userinfo_endpoint: `${origin}/oauth2/userinfo`,
  });
});

export const baseHandlers = [discoveryHandler] satisfies RequestHandler[];
