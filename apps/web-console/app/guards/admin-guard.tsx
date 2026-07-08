import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

import { auth } from "@/libs/better-auth";

// NEW (decision #4 in the migration plan): admin-only page gate. Neither
// Apps/roppoh nor apps/ura-roppoh had a role gate before this migration —
// Any authenticated user could open the admin pages (data itself was
// Protected server-side by neo-fujimatsu's admin API role checks).
export function AdminGuard({ children }: { children: React.ReactNode }): React.ReactNode {
  const { data, isPending } = auth.useSession();

  // Better-auth's admin plugin can store comma-separated roles.
  const roles = (data?.user.role ?? "").split(",");
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!isPending && !isAdmin) {
      toast.error("Admin access required.");
      router.visit("/");
    }
  }, [isPending, isAdmin]);

  // Unlike AuthGuard, this doesn't gate rendering on isPending/isAdmin: the
  // Backend admin APIs already return 403 for non-admins, so briefly
  // Rendering the page shell while the redirect above kicks in leaks nothing.
  return children;
}
