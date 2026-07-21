import { Toaster } from "@roppoh/shadcn/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./auth-provider";
import { queryClient } from "./query-client";
import { useTheme, useThemeProvider } from "./theme-provider";

// Minimal auth wiring (ported from apps/web-console/app/providers/app-providers.tsx,
// Minus BetterAuthQueryProvider/NuqsAdapter/better-auth client): roppoh only
// Guards "/" via useAuth() (OIDC localStorage state), never useSession().
export function AppProviders({ children }: { children: React.ReactNode }) {
  // oxlint-disable-next-line no-empty-pattern
  const {} = useThemeProvider();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div style={{ minHeight: "100vh", position: "relative" }}>
          <AuthProvider
            issuer={import.meta.env.VITE_OIDC_ISSUER}
            clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
          >
            {children}
          </AuthProvider>
        </div>
      </QueryClientProvider>
      <Toaster useTheme={useTheme} />
    </>
  );
}
