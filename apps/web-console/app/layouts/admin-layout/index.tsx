import type { ReactNode } from "react";

import { AdminGuard } from "@/guards/admin-guard";
import { AuthGuard } from "@/guards/auth-guard";
import { SidebarLayout } from "@/layouts/sidebar-layout";

// Inertia persistent layout (Page.layout) for admin-only pages.
export const adminLayout = (page: ReactNode) => (
  <AuthGuard>
    <SidebarLayout>
      <AdminGuard>{page}</AdminGuard>
    </SidebarLayout>
  </AuthGuard>
);
