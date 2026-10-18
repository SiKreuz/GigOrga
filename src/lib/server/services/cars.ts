import { type Db, type Reader, transaction } from "../db";

export type CarInput = {
  name: string;
  consumption: number;
  seats: number | null;
  standard: number;
};

export function createCar(db: Db, input: CarInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Car.create({ id, ...input });
    return id;
  });
}

export async function updateCar(db: Db, id: string, input: CarInput) {
  await transaction(db, (tx) => tx.orm.Car.where({ id }).update(input));
}

export async function deleteCar(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Car.where({ id }).delete());
}

export async function listCars(db: Reader) {
  const cars = await db.orm.Car.select("id", "name", "consumption", "seats", "standard").all();
  return cars.toSorted((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export type CarSummary = Awaited<ReturnType<typeof listCars>>[number];
