// Test helpers for seeding a logged-in user into oidc-client-ts storage.
// React-oidc-context reads the stored user on mount without re-validating the
// Token signature, so a minimal, non-expired User is enough to make
// `useAuth().isAuthenticated` true in Playwright tests.

export interface OidcTestUser {
  email: string;
  name: string;
  sub?: string;
}

// Mirrors oidc-client-ts UserManager's key: `${prefix}user:${authority}:${client_id}`
// With WebStorageStateStore's default prefix "oidc.".
export function oidcUserStorageKey(issuer: string, clientId: string): string {
  return `oidc.user:${issuer}:${clientId}`;
}

// Serializes a User the way User.toStorageString() would. expires_at is set far
// In the future so `user.expired` is false.
export function serializeOidcUser(user: OidcTestUser): string {
  return JSON.stringify({
    access_token: "test-access-token",
    expires_at: 4_102_444_800, // 2100-01-01
    profile: { email: user.email, name: user.name, sub: user.sub ?? "test-user" },
    scope: "openid profile email",
    token_type: "Bearer",
  });
}
