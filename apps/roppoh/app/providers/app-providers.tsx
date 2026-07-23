import { OidcAuthProvider } from "@roppoh/oidc-client";
import { Toaster } from "@roppoh/shadcn/components/ui/sonner";

import { useTheme, useThemeProvider } from "./theme-provider";

// Minimal auth wiring: react-oidc-context (via @roppoh/oidc-client) owns the
// OIDC login flow, PKCE, and token storage. roppoh only guards "/" via
// UseAuth() and never uses better-auth sessions.
export function AppProviders({ children }: { children: React.ReactNode }) {
  // oxlint-disable-next-line no-empty-pattern
  const {} = useThemeProvider();
  // Calling the hook here (instead of handing the hook itself to <Toaster>)
  // Satisfies the rule that hooks must be called, not passed around as values.
  const theme = useTheme();

  return (
    <>
      <div style={{ minHeight: "100dvh", position: "relative" }}>
        <OidcAuthProvider
          issuer={import.meta.env.VITE_OIDC_ISSUER}
          clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
        >
          {children}
        </OidcAuthProvider>
      </div>
      <Toaster useTheme={() => theme} />
    </>
  );
}
