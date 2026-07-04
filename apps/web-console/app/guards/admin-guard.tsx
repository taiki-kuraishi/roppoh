import { auth } from "@/libs/better-auth";

// NEW (decision #4 in the migration plan): admin-only page gate. Neither
// Apps/roppoh nor apps/ura-roppoh had a role gate before this migration —
// Any authenticated user could open the admin pages (data itself was
// Protected server-side by neo-fujimatsu's admin API role checks).
export function AdminGuard({ children }: { children: React.ReactNode }): React.ReactNode {
  const { data, isPending } = auth.useSession();

  if (isPending) {
    return null;
  }

  // Better-auth's admin plugin can store comma-separated roles.
  const roles = (data?.user.role ?? "").split(",");
  if (!roles.includes("admin")) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2">
        <h1 className="font-bold text-2xl">403 — Forbidden</h1>
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  return children;
}
