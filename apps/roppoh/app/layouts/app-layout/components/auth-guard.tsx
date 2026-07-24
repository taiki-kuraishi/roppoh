import type { ReactNode } from "react";

import { router } from "@inertiajs/react";
import { useAuth } from "@roppoh/oidc-client";
import { useEffect } from "react";
import { toast } from "sonner";

// Client-side auth guard. roppoh has no sidebar/admin (minimal scope), so
// This is the only guard: unauthenticated users are bounced to /login.
// Hono never inspects auth (dumb Inertia renderer). (web-console keeps
// Guards/ and layouts/ separate because it has multiple guards + a sidebar
// Layout; roppoh does not.)
export function AuthGuard({ children }: { children: ReactNode }): ReactNode {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Login required.");
      router.visit("/login");
    }
  }, [isLoading, isAuthenticated]);

  return children;
}
