import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { config } from "./config";
import { createDb, type Db } from "./db";
import { createOidc, type Oidc } from "./oidc";

let db: Db | undefined;
let oidc: Oidc | undefined;

export function getDb(): Db {
  if (!db) {
    mkdirSync(config.dataDir, { recursive: true });
    db = createDb(join(config.dataDir, "gigorga.db"));
  }
  return db;
}

export const redirectUri = `${config.origin}/auth/callback`;

export function getOidc(): Oidc {
  if (!config.oidcIssuer || !config.oidcClientId) {
    throw new Error("OIDC_ISSUER and OIDC_CLIENT_ID must be set");
  }
  oidc ??= createOidc({
    issuer: config.oidcIssuer,
    clientId: config.oidcClientId,
    clientSecret: config.oidcClientSecret,
    redirectUri,
  });
  return oidc;
}
