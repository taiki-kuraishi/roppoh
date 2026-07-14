import { router } from "@inertiajs/react";
import { DropdownMenuItem } from "@roppoh/shadcn/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

import { auth } from "@/libs/better-auth";
import { useAuth } from "@/providers/auth-provider";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
    await auth.signOut({
      fetchOptions: { onSuccess: () => router.visit("/login") },
    });
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut />
      Logout
    </DropdownMenuItem>
  );
}
