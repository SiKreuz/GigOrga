import {
  archiveSoundEngineer,
  createSoundEngineer,
  listSoundEngineers,
  updateSoundEngineer,
} from "$lib/server/services/soundEngineers";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

const kim = { name: "Kim", phone: "0171 123456", email: "kim@example.com" };

describe("sound engineers", () => {
  test("creates, lists by name and updates sound engineers", async ({ db }) => {
    const id = await createSoundEngineer(db, kim);
    await createSoundEngineer(db, { name: "alex", phone: "", email: "" });
    expect((await listSoundEngineers(db)).map((engineer) => engineer.name)).toStrictEqual([
      "alex",
      "Kim",
    ]);
    await updateSoundEngineer(db, id, { ...kim, phone: "0172 999" });
    expect((await listSoundEngineers(db)).find((engineer) => engineer.id === id)).toStrictEqual({
      id,
      ...kim,
      phone: "0172 999",
    });
  });

  test("hides archived sound engineers from the list", async ({ db }) => {
    const id = await createSoundEngineer(db, kim);
    await archiveSoundEngineer(db, id);
    expect(await listSoundEngineers(db)).toStrictEqual([]);
  });
});
