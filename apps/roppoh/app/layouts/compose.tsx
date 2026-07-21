import type { ReactNode } from "react";

import { AuthGuard } from "@/guards/auth-guard";

// Inertia persistent layout for guarded pages. roppoh has no sidebar/admin
// (minimal scope), so the app layout is just the client-side AuthGuard.
export const appLayout = (page: ReactNode) => <AuthGuard>{page}</AuthGuard>;
