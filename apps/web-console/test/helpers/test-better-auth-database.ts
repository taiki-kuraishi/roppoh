import type { Client, Transaction } from "@libsql/client";

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
// Whole test run, and each test opens its own interactive transaction (via
// @libsql/client's `client.transaction()`) instead of recreating the
// Database. Plain `client.execute("BEGIN"/"ROLLBACK")` was tried first, but
// @libsql/client documents that every `Client.execute()` call runs "in its
// Own logical database connection" — so a bare BEGIN/ROLLBACK pair sent that
// Way never actually wraps the statements in between, and test data silently
// Leaked across tests. `client.transaction()` returns a `Transaction` object
// That keeps one connection open across all of its own `.execute()` calls
// Until `.rollback()`/`.commit()`, which is what real per-test isolation
// Needs. This is safe against @better-auth/drizzle-adapter's own writes too:
// The adapter only opens its own internal transaction when the adapter's
// `transaction` option is explicitly enabled (it isn't here), so its writes
// Just run as statements against our already-open transaction.
export class TestBetterAuthDatabase {
  private tx: Transaction | undefined;
  private instance: ReturnType<typeof createInstance> | undefined;

  // BeforeEach
  public async begin() {
    const client = await getSharedBetterAuthSqlite();
    this.tx = await client.transaction("write");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    this.instance = createInstance(this.tx as unknown as Client);
  }

  // AfterEach
  public async cleanup() {
    await this.tx?.rollback();
    this.tx = undefined;
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
    if (!this.tx) {
      throw new Error("call begin() before accessing the database");
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return drizzle(this.tx as unknown as Client, { schema });
  }
}
