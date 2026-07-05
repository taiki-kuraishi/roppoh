import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { config, schema } from "@roppoh/better-auth";
import { betterAuth } from "better-auth/minimal";
import { testUtils } from "better-auth/plugins";
import Database from "better-sqlite3";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { drizzle } from "drizzle-orm/better-sqlite3";

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
const createInstance = (db: Database.Database) =>
  betterAuth({
    ...config,
    basePath: BASE_PATH,
    baseURL: BASE_URL,
    database: drizzleAdapter(drizzle(db, { schema }), { provider: "sqlite", schema }),
    plugins: [...config.plugins, testUtils()] as const,
    secret: TEST_SECRET,
    telemetry: { enabled: false },
  });

// Test-only better-auth instance backed by an in-memory sqlite DB (matches
// Packages/better-auth's sqlite schema/provider). A fresh DB is created per
// Test (begin/cleanup) rather than a shared DB + transaction rollback: the
// Drizzle adapter opens its own internal transactions on writes, which risks
// Nesting conflicts under an outer rollback. Recreating + pushing the schema
// Is cheap for this table count.
export class TestBetterAuthDatabase {
  private db: Database.Database | undefined;
  private instance: ReturnType<typeof createInstance> | undefined;

  // BeforeEach
  public async begin() {
    this.db = new Database(":memory:");
    this.db.pragma("foreign_keys = ON");
    const drz = drizzle(this.db, { schema });
    // PushSQLiteSchema is typed against drizzle-orm/libsql's LibSQLDatabase
    // (a type-only mismatch drizzle-orm/better-sqlite3 also structurally
    // Satisfies). Its own apply() is unusable here though: it runs every
    // Generated statement through drizzleInstance.all(), and better-sqlite3's
    // .all() throws on DDL ("This statement does not return data") — a
    // Runtime assumption that only holds for libsql-style drivers. Apply the
    // Generated DDL ourselves via the native Database.exec(), which has no
    // Such restriction.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const push = await pushSQLiteSchema(schema, drz as unknown as LibSQLDatabase<typeof schema>);
    if (push.statementsToExecute.length > 0) {
      this.db.exec(push.statementsToExecute.join(";\n"));
    }
    this.instance = createInstance(this.db);
  }

  // AfterEach
  public cleanup() {
    this.db?.close();
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
