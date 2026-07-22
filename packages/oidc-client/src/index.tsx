import type { ReactNode } from "react";

import { WebStorageStateStore } from "oidc-client-ts";
import { useMemo } from "react";
import { AuthProvider } from "react-oidc-context";

interface Props {
  issuer: string;
  clientId: string;
  children: ReactNode;
}

// Shared OIDC client for the repo's public-PKCE SPAs (web-console, roppoh),
// Which consume neo-fujimatsu's external OIDC issuer with no backend of their
// Own. Wraps react-oidc-context (oidc-client-ts) so PKCE, the redirect
// Callback, and token storage are handled by the library instead of by hand.
export function OidcAuthProvider({ issuer, clientId, children }: Props) {
  const userStore = useMemo(() => new WebStorageStateStore({ store: globalThis.localStorage }), []);

  return (
    <AuthProvider
      authority={issuer}
      client_id={clientId}
      redirect_uri={`${globalThis.location.origin}/callback`}
      post_logout_redirect_uri={globalThis.location.origin}
      scope="openid profile email"
      // Match the previous hand-rolled behaviour (no silent renew) and avoid
      // A hidden-iframe renew attempt in tests.
      automaticSilentRenew={false}
      userStore={userStore}
      // Strip the ?code&state params after a successful login.
      onSigninCallback={() => globalThis.history.replaceState({}, "", "/")}
    >
      {children}
    </AuthProvider>
  );
}

export { useAuth } from "react-oidc-context";
