import { inertia } from "@hono/inertia";
import { Hono } from "hono";

import { rootView } from "./root-view";

// Dumb Inertia renderer: never inspects auth/session. Client owns auth
// Guarding, role gating, and data fetching (client-driven decision).
// Props are (near) empty everywhere — pages fetch their own data via
// React-query + @roppoh/better-auth-query, matching apps/roppoh/apps/ura-roppoh.
const app = new Hono()
  .use(inertia({ rootView, version: "spike-v1" }))
  .get("/health", (c) => c.json({ message: "ok" }, 200))
  // Public
  .get("/login", (c) => c.render("Login/Index", {}))
  .get("/callback", (c) => c.render("Callback/Index", {}))
  .get("/consent", (c) => c.render("Consent/Index", {}))
  // Guarded (client decides — see app/guards/**, app/layouts/app-layout/**, app/layouts/admin-layout/**)
  .get("/", (c) => c.render("Index", {}))
  .get("/organization", (c) => c.render("Organization/Index", {}))
  .get("/user", (c) => c.render("User/Index", {}))
  .get("/oidc-client", (c) => c.render("OidcClient/Index", {}));

export default { fetch: app.fetch } satisfies ExportedHandler<Cloudflare.Env>;
