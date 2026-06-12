import { BetterAuthQueryProvider } from "@roppoh/better-auth-query";
import { Toaster } from "@roppoh/shadcn/components/ui/sonner";
import { Ssgoi } from "@ssgoi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Outlet, ScrollRestoration } from "react-router";

import { auth } from "@/libs/better-auth";
import { config } from "@/libs/ssgoi";
import { AuthProvider } from "@/root/components/auth-provider";

import { useTheme, useThemeProvider } from "./components/theme-provider";

export function Root() {
  const queryClient = new QueryClient();
  // oxlint-disable-next-line no-empty-pattern
  const {} = useThemeProvider();

  return (
    <>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <BetterAuthQueryProvider authClient={auth}>
            <Ssgoi config={config}>
              <div style={{ minHeight: "100vh", position: "relative" }}>
                <AuthProvider
                  issuer={import.meta.env.VITE_OIDC_ISSUER}
                  clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
                >
                  <Outlet />
                </AuthProvider>
              </div>
            </Ssgoi>
          </BetterAuthQueryProvider>
        </QueryClientProvider>
      </NuqsAdapter>
      <Toaster useTheme={useTheme} />
      <ScrollRestoration />
    </>
  );
}
