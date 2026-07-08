import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  basePath: "/",
  baseURL: import.meta.env.VITE_OIDC_ISSUER,
  fetchOptions: { credentials: "include" },
  plugins: [adminClient(), oauthProviderClient(), passkeyClient()],
});
