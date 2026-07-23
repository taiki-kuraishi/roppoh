import { Hono } from "hono";

import { betterAuthCorsMiddleware, injectDependenciesMiddleware } from "./middlewares";
import { oauthAuthorizationServerRoute } from "./routes/.well-known/oauth-authorization-server";
import { openidConfigurationRoute } from "./routes/.well-known/openid-configuration";
import { betterAuthRoute } from "./routes/better-auth";
import { health } from "./routes/health";

export const app = new Hono()
  .get("/", (c) => c.redirect("/sign-in"))
  .route("/health", health)
  // Middleware
  .use("*", injectDependenciesMiddleware)
  .use("*", betterAuthCorsMiddleware)
  // Handler
  .route("/api/.well-known/openid-configuration", openidConfigurationRoute)
  .route("/.well-known/oauth-authorization-server/api", oauthAuthorizationServerRoute)
  .route("/api/*", betterAuthRoute);
