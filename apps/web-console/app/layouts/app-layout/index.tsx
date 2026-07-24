import type { ReactNode } from "react";

import { AuthGuard } from "@/guards/auth-guard";
import { SidebarLayout } from "@/layouts/sidebar-layout";

// Inertia persistent layout (Page.layout), replacing the nested
// `Root > authenticated-layout > sidebar-layout` react-router route tree
// (apps/ura-roppoh/src/router.ts).
export const appLayout = (page: ReactNode) => (
  <AuthGuard>
    <SidebarLayout>{page}</SidebarLayout>
  </AuthGuard>
);
