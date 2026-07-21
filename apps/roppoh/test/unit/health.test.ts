import { expect, test } from "bun:test";

import { app } from "@/server";

// `/health` returns JSON before Inertia rendering, so app.request runs the
// Hono app fully in-process — no vite, no workerd, no Cloudflare bindings.
test("GET /health returns 200 ok", async () => {
  const res = await app.request("/health");
  const body: unknown = await res.json();

  expect(res.status).toBe(200);
  expect(body).toEqual({ message: "ok" });
});
