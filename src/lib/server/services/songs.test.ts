import {
  createSong,
  deleteSong,
  getSetlist,
  listSongs,
  updateSetlist,
  updateSong,
} from "$lib/server/services/songs";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

const intro = { title: "Intro", durationSec: 90, notes: "" };

describe("songs", () => {
  test("creates, lists by title, updates and deletes songs", async ({ db }) => {
    const id = await createSong(db, intro);
    await createSong(db, { title: "ausklang", durationSec: 240, notes: "Zugabe" });
    expect((await listSongs(db)).map((song) => song.title)).toEqual(["ausklang", "Intro"]);
    await updateSong(db, id, { ...intro, durationSec: 120 });
    expect((await listSongs(db)).find((song) => song.id === id)).toMatchObject({
      durationSec: 120,
    });
    await deleteSong(db, id);
    expect(await listSongs(db)).toHaveLength(1);
  });

  test("replaces the setlist in order and drops deleted songs", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    const first = await createSong(db, intro);
    const hit = await createSong(db, { title: "Hit", durationSec: 240, notes: "" });
    await updateSetlist(db, id, [first, hit, first]);
    await updateSetlist(db, id, [hit, first]);
    expect(await getSetlist(db, id)).toEqual([
      { songId: hit, title: "Hit", durationSec: 240 },
      { songId: first, title: "Intro", durationSec: 90 },
    ]);
    await deleteSong(db, first);
    expect((await getSetlist(db, id)).map((entry) => entry.songId)).toEqual([hit]);
  });
});
