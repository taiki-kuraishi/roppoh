import type { Auth } from "better-auth/types";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { admin, jwt } from "better-auth/plugins";

import * as schema from "./auth-schema";

export const config = {
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  basePath: "",
  baseURL: "https://zunpachi.tsar-bmb.org",
  database: drizzleAdapter({}, { provider: "sqlite", schema }),
  disabledPaths: ["/token"],
  plugins: [
    admin(),
    jwt({
      disableSettingJwtHeader: true,
      jwks: { keyPairConfig: { alg: "RS256" } },
    }),
    oauthProvider({
      consentPage: "/consent",
      loginPage: "/sign-in",
    }),
    passkey({
      rpName: "Fujimatsu",
    }),
  ] as const,
  secret: "",
  session: {
    storeSessionInDatabase: true, // For oidc
    // FYI: https://www.better-auth.com/docs/guides/optimizing-for-performance
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    expiresIn: 604_800, // 7 days
    updateAge: 86_400, // 1 day
  },
  socialProviders: {
    discord: {
      clientId: "DISCORD_CLIENT_ID",
      clientSecret: "DISCORD_CLIENT_SECRET",
      disableSignUp: true,
    },
  },
  telemetry: { enabled: true },
  trustedOrigins: ["*"],
} satisfies BetterAuthOptions;

// For better-auth cli generate script config
export const auth: Auth<typeof config> = betterAuth(config);

export const createBetterAuth = <T extends typeof config>(override: T): Auth<T> =>
  betterAuth({ ...config, ...override });

export type BetterAuth = ReturnType<typeof createBetterAuth>;
