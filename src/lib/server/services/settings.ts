import { type Db, transaction } from "../db";

export type SettingsInput = {
  homeAddress: string;
  bandSize: number;
  fuelPrice: number;
};

const id = "default";

export async function getSettings(db: Db) {
  const existing = await db.orm.Settings.where({ id }).first();
  if (existing) return existing;
  await transaction(db, (tx) => tx.orm.Settings.create({ id }));
  const created = await db.orm.Settings.where({ id }).first();
  if (!created) throw new Error("Settings could not be created");
  return created;
}

export async function updateSettings(db: Db, input: SettingsInput) {
  const current = await getSettings(db);
  const moved = current.homeAddress !== input.homeAddress;
  await transaction(db, (tx) =>
    tx.orm.Settings.where({ id }).update(
      moved ? { ...input, homeLat: null, homeLon: null } : input,
    ),
  );
}

export async function setHomeLocation(db: Db, homeLat: number, homeLon: number) {
  await transaction(db, (tx) => tx.orm.Settings.where({ id }).update({ homeLat, homeLon }));
}
