import { keyOf, roles } from "$lib/labels";

import { type Db, transaction } from "../db";

const lifetime = 30 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return new Bun.CryptoHasher("sha256").update(token).digest("hex");
}

export function createSession(db: Db, userId: string, now = new Date()) {
  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const expiresAt = new Date(now.getTime() + lifetime);
  const id = hashToken(token);
  return transaction(db, async (tx) => {
    await tx.orm.Session.create({ id, userId, expiresAt });
    return { id, token, expiresAt };
  });
}

export async function validateSession(db: Db, token: string, now = new Date()) {
  const id = hashToken(token);
  const found = await db.orm.Session.where({ id })
    .include("user", (user) => user.select("id", "email", "name", "role", "active"))
    .first();
  if (!found) return null;
  const { user: row, ...session } = found;
  if (row === null || row.active === 0 || now >= session.expiresAt) {
    await invalidateSession(db, id);
    return null;
  }
  if (session.expiresAt.getTime() - now.getTime() < lifetime / 2) {
    session.expiresAt = new Date(now.getTime() + lifetime);
    await transaction(db, (tx) =>
      tx.orm.Session.where({ id }).update({ expiresAt: session.expiresAt }),
    );
  }
  const { active: _active, ...user } = row;
  return { user: { ...user, role: keyOf(roles, user.role) }, session };
}

export type Auth = NonNullable<Awaited<ReturnType<typeof validateSession>>>;

export async function invalidateSession(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Session.where({ id }).delete());
}
