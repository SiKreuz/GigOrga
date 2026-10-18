import { getSettings, setHomeLocation, updateSettings } from "$lib/server/services/settings";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

const input = { homeAddress: "München", bandSize: 5, petrolPrice: 1.9, dieselPrice: 1.7 };

describe("settings", () => {
  test("starts with defaults", async ({ db }) => {
    expect(await getSettings(db)).toMatchObject({
      homeAddress: "",
      bandSize: 4,
      petrolPrice: 1.8,
      dieselPrice: 1.7,
    });
  });

  test("forgets the home location only when the address changes", async ({ db }) => {
    await updateSettings(db, input);
    await setHomeLocation(db, 48, 11);
    await updateSettings(db, { ...input, bandSize: 4 });
    expect(await getSettings(db)).toMatchObject({ bandSize: 4, homeLat: 48 });
    await updateSettings(db, { ...input, homeAddress: "Augsburg" });
    expect(await getSettings(db)).toMatchObject({ homeAddress: "Augsburg", homeLat: null });
  });
});
