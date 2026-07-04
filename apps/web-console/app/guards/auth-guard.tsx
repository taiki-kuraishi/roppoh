import { router } from "@inertiajs/react";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";

// Ported from apps/ura-roppoh/src/layouts/authenticated-layout.tsx: replaces
// React-router's <Outlet/>/useNavigate() with Inertia's persistent-layout
// `children` prop and router.visit(). Hono never inspects auth (decision #3
// In the migration plan) — this client-side effect is the only guard.
export function AuthGuard({ children }: { children: React.ReactNode }): React.ReactNode {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.visit("/login");
    }
  }, [isLoading, isAuthenticated]);

  return children;
}
