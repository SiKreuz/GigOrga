import { DatabaseSync } from "node:sqlite";

import sqlite from "@prisma/orm-sqlite/runtime";
import sqliteStatic from "@prisma/orm-sqlite/static";

import type { Contract } from "../../../prisma/contract";
import contractJson from "../../../prisma/contract.json" with { type: "json" };

export function createDb(path: string) {
  const setup = new DatabaseSync(path);
  setup.exec("PRAGMA journal_mode = WAL");
  setup.close();
  return sqlite<Contract>({ contractJson, path });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type Reader = Pick<Db, "orm">;

export const rawSql = sqliteStatic<Contract>({ contractJson }).raw.sql;

// Each Prisma transaction opens its own connection, so overlapping writes fail with SQLITE_BUSY.
const pendingWrites = new WeakMap<Db, Promise<unknown>>();

export function transaction<R>(db: Db, fn: (tx: Tx) => Promise<R>): Promise<R> {
  const previous = pendingWrites.get(db) ?? Promise.resolve();
  const next = previous.then(() => db.transaction(fn));
  pendingWrites.set(
    db,
    next.catch(() => null),
  );
  return next;
}
