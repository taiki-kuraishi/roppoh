import type { Client } from "@libsql/client";

import { createClient } from "@libsql/client";
import { schema } from "@roppoh/better-auth";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { drizzle } from "drizzle-orm/libsql";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

let db: Client | undefined = undefined;

async function migrate(): Promise<Client> {
  // Plain ":memory:" (and even the "cache=shared" in-memory URI) gives every
  // New logical connection its own database, or drops the data as soon as no
  // Connection references it, under @libsql/client's local sqlite3 driver —
  // Client.execute() and client.transaction() don't reliably share the same
  // Backing store. A real (if ephemeral) on-disk file behaves like a normal
  // Sqlite file: every connection opened against the same path sees the same
  // Data regardless of @libsql/client's internal connection lifecycle.
  const dbPath = path.join(tmpdir(), `web-console-test-better-auth-${process.pid}.sqlite`);
  rmSync(dbPath, { force: true });
  const client = createClient({ url: `file:${dbPath}` });
  await client.execute("PRAGMA foreign_keys = ON");
  const drz = drizzle(client, { schema });
  const push = await pushSQLiteSchema(schema, drz);
  if (push.statementsToExecute.length > 0) {
    await push.apply();
  }
  return client;
}

// One libsql connection for the whole test run (Playwright is pinned to a
// Single worker so this module is only ever loaded in one process), schema
// Pushed once on first access. Each test opens its own interactive
// Transaction on this client (see test-better-auth-database.ts) instead of
// Recreating the database.
//
// Bun's built-in `bun:sqlite` was tried first, but Playwright always runs
// Test files under Node (its CLI shebangs to `node`, even when launched via
// `bun run`), and Node's ESM loader rejects `bun:` specifiers — so libsql
// (a plain npm package, works under Node) is used instead.
export async function getSharedBetterAuthSqlite(): Promise<Client> {
  db ??= await migrate();
  return db;
}
