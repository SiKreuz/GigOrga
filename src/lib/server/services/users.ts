import { type Db, type Reader, transaction } from "../db";

export type UserClaims = { sub: string; email: string; name: string };

export function upsertUserFromClaims(db: Db, { sub, email, name }: UserClaims): Promise<string> {
  return transaction(db, async (tx) => {
    const existing = await tx.orm.User.where({ subject: sub }).select("id").first();
    if (existing) {
      await tx.orm.User.where({ id: existing.id }).update({
        email,
        name,
        lastLoginAt: new Date(),
      });
      return existing.id;
    }
    const id = Bun.randomUUIDv7();
    await tx.orm.User.create({ id, subject: sub, email, name });
    return id;
  });
}

export function getUser(db: Reader, id: string) {
  return db.orm.User.where({ id }).select("id", "email", "name").first();
}
