import type { DefaultBodyType, RequestHandler, StrictRequest } from "msw";

import { HttpResponse, http } from "msw";

import type { TestBetterAuthDatabase } from "./test-better-auth-database";

const ORIGIN = "https://neo-fujimatsu.tsar-bmb.org";

const corsPreflightResponse = (origin: string) =>
  new HttpResponse(null, {
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Max-Age": "600",
      ...(origin === "*" ? {} : { Vary: "Origin" }),
    },
    status: 204,
  });

const delegateToBetterAuth = async (
  testAuth: TestBetterAuthDatabase,
  request: StrictRequest<DefaultBodyType>,
  origin: string,
) => {
  // Cast: better-auth's handler() is typed against the Cloudflare Workers
  // `Request` (this app has @cloudflare/workers-types globally, for
  // Wrangler), which structurally differs from MSW's fetch-spec Request only
  // In an optional `cf` property. Both are plain Fetch API Requests at
  // Runtime, so this is a type-only mismatch.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const res = await testAuth.getBetterAuthInstance().handler(request as unknown as Request);
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Expose-Headers", "Content-Length");
  if (origin !== "*") {
    headers.append("Vary", "Origin");
  }
  return new HttpResponse(res.body, { headers, status: res.status, statusText: res.statusText });
};

// Delegates the whole better-auth surface (get-session, admin/*, oauth2/*)
// That app/libs/better-auth.ts's client calls to the real test instance's
// Handler, instead of hand-written per-endpoint JSON. The page origin
// (127.0.0.1:51732) differs from the API origin and the client uses
// `credentials: "include"`, so CORS headers are required.
export const createBetterAuthHandler = (testAuth: TestBetterAuthDatabase): RequestHandler =>
  http.all(`${ORIGIN}/api/*`, async ({ request }) => {
    const origin = request.headers.get("origin") ?? "*";
    if (request.method === "OPTIONS") {
      return corsPreflightResponse(origin);
    }
    return delegateToBetterAuth(testAuth, request, origin);
  });
