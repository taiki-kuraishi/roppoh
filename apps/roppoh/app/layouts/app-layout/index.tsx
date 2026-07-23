import type { ReactNode } from "react";

import { AuthGuard } from "./components/auth-guard";

// Inertia persistent layout for guarded pages (Index.layout = appLayout).
export const appLayout = (page: ReactNode) => <AuthGuard>{page}</AuthGuard>;
