import { transaction } from "../db";
import type { Db, Reader } from "../db";

export type SoundEngineerInput = { name: string; phone: string; email: string };

export function createSoundEngineer(db: Db, input: SoundEngineerInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.SoundEngineer.create({ id, ...input });
    return id;
  });
}

export async function updateSoundEngineer(db: Db, id: string, input: SoundEngineerInput) {
  await transaction(db, (tx) => tx.orm.SoundEngineer.where({ id }).update(input));
}

export async function archiveSoundEngineer(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.SoundEngineer.where({ id }).update({ active: 0 }));
}

export async function listSoundEngineers(db: Reader) {
  const engineers = await db.orm.SoundEngineer.where({ active: 1 })
    .select("id", "name", "phone", "email")
    .all();
  return engineers.toSorted((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export type SoundEngineerSummary = Awaited<ReturnType<typeof listSoundEngineers>>[number];
