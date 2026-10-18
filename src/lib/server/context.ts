import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { config } from "./config";
import { createDb, type Db } from "./db";

let db: Db | undefined;

export function getDb(): Db {
  if (!db) {
    mkdirSync(config.dataDir, { recursive: true });
    db = createDb(join(config.dataDir, "gigorga.db"));
  }
  return db;
}
