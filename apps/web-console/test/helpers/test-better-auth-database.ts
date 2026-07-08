import type { Client } from "@libsql/client";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { config, schema } from "@roppoh/better-auth";
import { betterAuth } from "better-auth/minimal";
import { testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";

import { getSharedBetterAuthSqlite } from "./shared-better-auth-sqlite";

// Must match apps/neo-fujimatsu's basePath/baseURL (see
// Dependency-injection.ts) and VITE_OIDC_ISSUER's origin, so
// Instance.handler() recognizes the URLs create-better-auth-handler.ts
// Intercepts.
const BASE_URL = "https://neo-fujimatsu.tsar-bmb.org";
const BASE_PATH = "/api";
const TEST_SECRET = "vrt-web-console-better-auth-secret"; // Signing only, test-local

// Calls betterAuth() directly (not the createBetterAuth() factory): that
// Factory's generic is constrained to `T extends typeof config`, which
// Rejects a `plugins` tuple with testUtils() appended (different length).
const createInstance = (db: Client) =>
  betterAuth({
    ...config,
    basePath: BASE_PATH,
    baseURL: BASE_URL,
    database: drizzleAdapter(drizzle(db, { schema }), { provider: "sqlite", schema }),
    plugins: [...config.plugins, testUtils()] as const,
    secret: TEST_SECRET,
    telemetry: { enabled: false },
  });

// Test-only better-auth instance backed by the shared in-memory sqlite DB
// (see shared-better-auth-sqlite.ts): the schema is pushed once for the
// Whole test run, and each test wraps its work in BEGIN/ROLLBACK on that same
// Connection instead of recreating the database. This is safe because
// @better-auth/drizzle-adapter only opens its own internal transaction when
// The adapter's `transaction` option is explicitly enabled (it isn't here),
// So better-auth's writes just run as statements against the already-open
// Outer transaction.
export class TestBetterAuthDatabase {
  private db: Client | undefined;
  private instance: ReturnType<typeof createInstance> | undefined;

  // BeforeEach
  public async begin() {
    this.db = await getSharedBetterAuthSqlite();
    await this.db.execute("BEGIN");
    this.instance = createInstance(this.db);
  }

  // AfterEach
  public async cleanup() {
    await this.db?.execute("ROLLBACK");
    this.db = undefined;
    this.instance = undefined;
  }

  public getBetterAuthInstance() {
    if (!this.instance) {
      throw new Error("call begin() before accessing the better-auth instance");
    }
    return this.instance;
  }

  public async getTestBetterAuth() {
    const ctx = await this.getBetterAuthInstance().$context;
    return ctx.test;
  }

  public getDrizzle() {
    if (!this.db) {
      throw new Error("call begin() before accessing the database");
    }
    return drizzle(this.db, { schema });
  }
}
