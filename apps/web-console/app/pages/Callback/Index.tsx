import { router } from "@inertiajs/react";
import { useAuth } from "@roppoh/oidc-client";
import { useEffect } from "react";

// Public page — no .layout. Ported from apps/ura-roppoh/src/pages/callback/page.tsx;
// React-router's useNavigate() -> Inertia's router.visit().
export default function Callback() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.visit("/");
    }
  }, [isLoading, isAuthenticated]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
