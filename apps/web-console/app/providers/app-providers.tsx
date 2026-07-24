import { BetterAuthQueryProvider } from "@roppoh/better-auth-query";
import { OidcAuthProvider } from "@roppoh/oidc-client";
import { Toaster } from "@roppoh/shadcn/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";
import { NuqsAdapter } from "@/libs/nuqs-adapter";

import { queryClient } from "./query-client";
import { useTheme, useThemeProvider } from "./theme-provider";

// Ported from apps/ura-roppoh/src/root/index.tsx's <Root> providers, minus
// React-router's <Outlet/>/<ScrollRestoration/> (Inertia owns navigation) and
// <Ssgoi> (dropped for phase 1 — decision #6 in the migration plan).
export function AppProviders({ children }: { children: React.ReactNode }) {
  // oxlint-disable-next-line no-empty-pattern
  const {} = useThemeProvider();
  // `useThemeProvider()` above already subscribes to the same theme atom, so
  // Calling the hook here (instead of handing the hook itself to <Toaster>)
  // Adds no extra re-renders while satisfying the rule that hooks must be
  // Called, not passed around as values.
  const theme = useTheme();

  return (
    <>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <BetterAuthQueryProvider authClient={auth}>
            <div style={{ minHeight: "100dvh", position: "relative" }}>
              <OidcAuthProvider
                issuer={import.meta.env.VITE_OIDC_ISSUER}
                clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
              >
                {children}
              </OidcAuthProvider>
            </div>
          </BetterAuthQueryProvider>
        </QueryClientProvider>
      </NuqsAdapter>
      <Toaster useTheme={() => theme} />
    </>
  );
}
