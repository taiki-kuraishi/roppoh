import { router } from "@inertiajs/react";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";

// Public page — no .layout. Once the OIDC redirect is processed and the user
// Is authenticated, send them to "/".
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
