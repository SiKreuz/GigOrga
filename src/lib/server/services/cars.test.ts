import { createCar, deleteCar, listCars, updateCar } from "$lib/server/services/cars";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

const bus = { name: "Bandbus", consumption: 11, fuel: "diesel" as const, seats: 8, standard: 1 };

describe("cars", () => {
  test("creates, lists by name, updates and deletes cars", async ({ db }) => {
    const id = await createCar(db, bus);
    await createCar(db, {
      name: "auto von Max",
      consumption: 6,
      fuel: "benzin",
      seats: null,
      standard: 0,
    });
    expect((await listCars(db)).map((car) => car.name)).toEqual(["auto von Max", "Bandbus"]);
    await updateCar(db, id, { ...bus, consumption: 12, fuel: "benzin" });
    expect((await listCars(db)).find((car) => car.id === id)).toMatchObject({
      consumption: 12,
      fuel: "benzin",
    });
    await deleteCar(db, id);
    expect(await listCars(db)).toHaveLength(1);
  });
});
