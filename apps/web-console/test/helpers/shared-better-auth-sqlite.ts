import type { Client } from "@libsql/client";

import { createClient } from "@libsql/client";
import { schema } from "@roppoh/better-auth";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { drizzle } from "drizzle-orm/libsql";

let db: Client | undefined = undefined;

async function migrate(): Promise<Client> {
  const client = createClient({ url: ":memory:" });
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
// Pushed once on first access. Each test wraps its work in a BEGIN/ROLLBACK
// Around this same connection instead of recreating the database.
//
// Bun's built-in `bun:sqlite` was tried first, but Playwright always runs
// Test files under Node (its CLI shebangs to `node`, even when launched via
// `bun run`), and Node's ESM loader rejects `bun:` specifiers — so libsql
// (a plain npm package, works under Node) is used instead.
export async function getSharedBetterAuthSqlite(): Promise<Client> {
  db ??= await migrate();
  return db;
}
