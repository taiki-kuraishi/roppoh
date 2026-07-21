import { inertia } from "@hono/inertia";
import { Hono } from "hono";

import { rootView } from "./root-view";

// Minimal Inertia renderer (see apps/web-console for the fuller pattern).
// `/health` returns JSON before Inertia rendering, so it can be exercised
// In-process via `app.request("/health")` from bun test without vite.
export const app = new Hono()
  .use(inertia({ rootView, version: "v1" }))
  .get("/health", (c) => c.json({ message: "ok" }, 200))
  // Public pages (no auth guard)
  .get("/login", (c) => c.render("Login/Index", {}))
  .get("/callback", (c) => c.render("Callback/Index", {}))
  // Guarded page — the client decides (see app/guards/**, app/layouts/compose.tsx).
  // Hono never inspects auth/session (dumb Inertia renderer).
  .get("/", (c) => c.render("Index", {}));

export default { fetch: app.fetch } satisfies ExportedHandler<Cloudflare.Env>;
