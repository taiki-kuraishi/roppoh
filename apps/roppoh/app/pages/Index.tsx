import { appLayout } from "@/layouts/app-layout";

// Guarded page (see app/layouts/app-layout → AuthGuard). Unauthenticated
// Visitors are redirected to /login by the guard.
function Index() {
  return <h1>Hello world</h1>;
}

Index.layout = appLayout;

export default Index;
