import { BetterAuthQueryProvider } from "@roppoh/better-auth-query";
import { Toaster } from "@roppoh/shadcn/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Outlet, ScrollRestoration } from "react-router";

import { authClient } from "@/client/libs/better-auth";

import { useTheme, useThemeProvider } from "./components/theme-provider";

export function Root() {
  const queryClient = new QueryClient();
  // oxlint-disable-next-line no-empty-pattern
  const {} = useThemeProvider();

  return (
    <>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <BetterAuthQueryProvider authClient={authClient}>
            <Outlet />
          </BetterAuthQueryProvider>
        </QueryClientProvider>
      </NuqsAdapter>
      <Toaster useTheme={useTheme} />
      <ScrollRestoration />
    </>
  );
}
