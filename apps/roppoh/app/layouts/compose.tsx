import type { ReactNode } from "react";

import { router } from "@inertiajs/react";
import { useAuth } from "@roppoh/oidc-client";
import { useEffect } from "react";
import { toast } from "sonner";

// Client-side auth guard, merged into the layout. roppoh has no sidebar/admin
// (minimal scope), so the guarded layout is just this effect — there is no
// Second guard or layout to compose. Hono never inspects auth (dumb Inertia
// Renderer), so this is the only guard: unauthenticated users are bounced to
// /login. (web-console keeps guards/ and layouts/ separate because it has
// Multiple guards + a sidebar layout; roppoh does not.)
function AuthGuard({ children }: { children: ReactNode }): ReactNode {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Login required.");
      router.visit("/login");
    }
  }, [isLoading, isAuthenticated]);

  return children;
}

// Inertia persistent layout for guarded pages (Index.layout = appLayout).
export const appLayout = (page: ReactNode) => <AuthGuard>{page}</AuthGuard>;
