import { type Db, type Reader, transaction } from "../db";

export type SongInput = {
  title: string;
  durationSec: number;
  notes: string;
};

export function createSong(db: Db, input: SongInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Song.create({ id, ...input });
    return id;
  });
}

export async function updateSong(db: Db, id: string, input: SongInput) {
  await transaction(db, (tx) => tx.orm.Song.where({ id }).update(input));
}

export async function deleteSong(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Song.where({ id }).delete());
}

export async function listSongs(db: Reader) {
  const songs = await db.orm.Song.select("id", "title", "durationSec", "notes").all();
  return songs.toSorted((a, b) => a.title.localeCompare(b.title, "de", { sensitivity: "base" }));
}

export async function getSetlist(db: Reader, gigId: string) {
  const entries = await db.orm.SetlistEntry.where({ gigId })
    .include("song", (song) => song.select("title", "durationSec"))
    .all();
  return entries
    .toSorted((a, b) => a.position - b.position)
    .map((entry) => ({ songId: entry.songId, ...entry.song }));
}

export async function updateSetlist(db: Db, gigId: string, songIds: string[]) {
  await transaction(db, async (tx) => {
    await tx.orm.SetlistEntry.where({ gigId }).deleteAll();
    for (const [position, songId] of songIds.entries()) {
      await tx.orm.SetlistEntry.create({ id: Bun.randomUUIDv7(), gigId, songId, position });
    }
  });
}

export type SongSummary = Awaited<ReturnType<typeof listSongs>>[number];
export type SetlistEntry = Awaited<ReturnType<typeof getSetlist>>[number];
