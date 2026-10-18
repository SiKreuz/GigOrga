/// <reference types="bun" />
import { mkdirSync } from "node:fs";

import { defineConfig as ormConfig } from "@prisma/orm-sqlite/config";
import { definePrismaConfig } from "prisma/config";

const dataDir = Bun.env.DATA_DIR ?? "data";
mkdirSync(dataDir, { recursive: true });

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./prisma/contract.prisma",
    db: { connection: `${dataDir}/gigorga.db` },
    migrations: { dir: "prisma/migrations" },
  }),
});
