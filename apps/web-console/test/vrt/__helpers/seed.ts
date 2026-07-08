import { schema } from "@roppoh/better-auth";

import type { TestBetterAuthDatabase } from "../../helpers/test-better-auth-database";

type Auth = Awaited<ReturnType<TestBetterAuthDatabase["getTestBetterAuth"]>>;

// Replaces the hand-written test/vrt/user/fixtures.ts admin/list-users JSON:
// Real users written through testUtils, returned by the real admin.listUsers
// Endpoint once create-better-auth-handler.ts delegates the request.
export async function seedUsers(auth: Auth) {
  const admin = auth.createUser({
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    email: "alice@example.com",
    name: "Alice Admin",
    role: "admin",
  });
  await auth.saveUser(admin);

  const bannedUser = auth.createUser({
    banned: true,
    banReason: "Spam",
    createdAt: new Date("2024-01-02T00:00:00.000Z"),
    email: "bob@example.com",
    name: "Bob User",
    role: "user",
  });
  await auth.saveUser(bannedUser);

  return { admin, bannedUser };
}

// Replaces the hand-written test/vrt/oidc-client/fixtures.ts
// Oauth2/get-clients JSON. /oauth2/get-clients only returns oauthClient rows
// Scoped to the current session's user, so `ownerUserId` must be the logged-in
// User's id. clientId is a fixed literal because it's rendered in the UI.
export async function seedOidcClients(testAuth: TestBetterAuthDatabase, ownerUserId: string) {
  await testAuth
    .getDrizzle()
    .insert(schema.oauthClient)
    .values([
      {
        clientId: "client-1-id",
        clientSecret: "secret-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        disabled: false,
        id: "oidc-client-1",
        name: "Test Client 1",
        redirectUris: ["http://localhost:3000/callback"],
        userId: ownerUserId,
      },
      {
        clientId: "client-2-id",
        clientSecret: "secret-2",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
        disabled: true,
        id: "oidc-client-2",
        name: null,
        redirectUris: ["http://localhost:4000/callback"],
        userId: ownerUserId,
      },
    ]);
}
