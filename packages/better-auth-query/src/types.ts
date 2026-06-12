import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const createAuthClientFn = () =>
  createAuthClient({
    fetchOptions: { credentials: "include" },
    plugins: [adminClient(), oauthProviderClient(), passkeyClient()],
  });

export type AuthClient = ReturnType<typeof createAuthClientFn>;
