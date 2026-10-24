import { keyOf, roles, type Role } from "$lib/labels";

import { type Db, type Reader, transaction } from "../db";

export type UserClaims = { sub: string; email: string; name: string };

export class UserChangeRefused extends Error {}

const isAdminEmail = (email: string, adminEmail: string) =>
  adminEmail !== "" && email.toLowerCase() === adminEmail.toLowerCase();

export function upsertUserFromClaims(db: Db, { sub, email, name }: UserClaims, adminEmail = "") {
  return transaction(db, async (tx) => {
    const promote = isAdminEmail(email, adminEmail) ? { role: "admin" as const } : {};
    const existing = await tx.orm.User.where({ subject: sub }).select("id", "active").first();
    if (existing) {
      await tx.orm.User.where({ id: existing.id }).update({
        email,
        name,
        lastLoginAt: new Date(),
        ...promote,
      });
      return existing;
    }
    const id = Bun.randomUUIDv7();
    await tx.orm.User.create({ id, subject: sub, email, name, ...promote });
    return { id, active: 1 };
  });
}

const fields = ["id", "email", "name", "role", "active", "lastLoginAt"] as const;

export async function getUser(db: Reader, id: string) {
  const user = await db.orm.User.where({ id })
    .select(...fields)
    .first();
  return user && { ...user, role: keyOf(roles, user.role) };
}

export async function listUsers(db: Reader) {
  const users = await db.orm.User.select(...fields).all();
  return users
    .map((user) => ({ ...user, role: keyOf(roles, user.role) }))
    .toSorted((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export type UserSummary = Awaited<ReturnType<typeof listUsers>>[number];

function refuseSelf(actorId: string, id: string) {
  if (actorId === id)
    throw new UserChangeRefused("Dein eigenes Konto kannst du hier nicht ändern.");
}

export async function changeUser(
  db: Db,
  actorId: string,
  id: string,
  change: { role?: Role; active?: number },
) {
  refuseSelf(actorId, id);
  await transaction(db, async (tx) => {
    await tx.orm.User.where({ id }).update(change);
    if (change.active === 0) await tx.orm.Session.where({ userId: id }).deleteAll();
  });
}

export async function deleteUser(db: Db, actorId: string, id: string) {
  refuseSelf(actorId, id);
  await transaction(db, (tx) => tx.orm.User.where({ id }).delete());
}
