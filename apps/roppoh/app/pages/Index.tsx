import { appLayout } from "@/layouts/compose";

// Guarded page (see app/layouts/compose.tsx → AuthGuard). Unauthenticated
// Visitors are redirected to /login by the guard.
function Index() {
  return <h1>Hello world</h1>;
}

Index.layout = appLayout;

export default Index;
