import type { RequestHandler } from "msw";

import { HttpResponse, http } from "msw";

// Stubs the OIDC discovery request AuthProvider fires on mount
// (oauth4webapi's discoveryRequest against `${issuer}/.well-known/openid-configuration`).
// Nothing under test calls login()/logout(), so only enough fields to let
// DiscoveryRequest/processDiscoveryResponse resolve without throwing.
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

const makeSessionHandler = (role: "admin" | "user") =>
  http.get("*/get-session", () =>
    HttpResponse.json({
      session: {
        createdAt: "2024-01-01T00:00:00.000Z",
        expiresAt: "2099-01-01T00:00:00.000Z",
        id: "session-1",
        ipAddress: null,
        updatedAt: "2024-01-01T00:00:00.000Z",
        userAgent: null,
        userId: "user-1",
      },
      user: {
        createdAt: "2024-01-01T00:00:00.000Z",
        email: "admin@example.com",
        emailVerified: true,
        id: "user-1",
        image: null,
        name: "Admin User",
        role,
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    }),
  );

// Better-auth's own session (auth.useSession(), used by AdminGuard /
// SidebarStaticContent / UserNavigation) — distinct from the OIDC
// "oidc:state" localStorage the AuthGuard checks (see helpers/auth.ts).
export const adminSessionHandler = makeSessionHandler("admin");
export const userSessionHandler = makeSessionHandler("user");

export const baseHandlers = [discoveryHandler] satisfies RequestHandler[];
