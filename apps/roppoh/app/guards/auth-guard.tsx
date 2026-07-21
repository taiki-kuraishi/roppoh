import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";

// Client-side auth guard (ported from apps/web-console/app/guards/auth-guard.tsx).
// Hono never inspects auth (dumb Inertia renderer) — this effect is the only
// Guard: unauthenticated users are bounced to /login.
export function AuthGuard({ children }: { children: React.ReactNode }): React.ReactNode {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Login required.");
      router.visit("/login");
    }
  }, [isLoading, isAuthenticated]);

  return children;
}
