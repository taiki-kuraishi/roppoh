import type { ReactNode } from "react";

import { AdminGuard } from "@/guards/admin-guard";
import { AuthGuard } from "@/guards/auth-guard";

import { SidebarLayout } from "./sidebar-layout";

// Inertia persistent layouts (Page.layout), replacing the nested
// `Root > authenticated-layout > sidebar-layout` react-router route tree
// (apps/ura-roppoh/src/router.ts).
export const appLayout = (page: ReactNode) => (
  <AuthGuard>
    <SidebarLayout>{page}</SidebarLayout>
  </AuthGuard>
);

export const adminLayout = (page: ReactNode) => (
  <AuthGuard>
    <SidebarLayout>
      <AdminGuard>{page}</AdminGuard>
    </SidebarLayout>
  </AuthGuard>
);
