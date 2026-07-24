import { useAuth } from "@roppoh/oidc-client";
import { DropdownMenuItem } from "@roppoh/shadcn/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

import { auth } from "@/libs/better-auth";

export function LogoutButton() {
  const oidc = useAuth();

  const handleLogout = async () => {
    // Clear the better-auth session (系B) first, then redirect to the OIDC
    // End-session endpoint (系A); it returns to the app origin, where the
    // AuthGuard bounces the now-unauthenticated user to /login.
    await auth.signOut();
    await oidc.signoutRedirect();
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut />
      Logout
    </DropdownMenuItem>
  );
}
