import type { GigStatus } from "$lib/labels";

import { type Db, type Reader, transaction } from "../db";

export type VenueInput = {
  name: string;
  address: string;
  city: string;
  capacity: number | null;
  website: string;
  loadIn: string;
  stage: string;
  notes: string;
};

const byText = (a: string, b: string) => a.localeCompare(b, "de", { sensitivity: "base" });

export function createVenue(db: Db, input: VenueInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Venue.create({ id, ...input });
    return id;
  });
}

export async function findOrCreateVenue(db: Db, name: string): Promise<string> {
  const venues = await db.orm.Venue.select("id", "name").all();
  const existing = venues.find((venue) => byText(venue.name, name) === 0);
  if (existing) return existing.id;
  return createVenue(db, {
    name,
    address: "",
    city: "",
    capacity: null,
    website: "",
    loadIn: "",
    stage: "",
    notes: "",
  });
}

export async function updateVenue(db: Db, id: string, input: VenueInput) {
  await transaction(db, async (tx) => {
    const current = await tx.orm.Venue.where({ id }).select("address", "city").first();
    const moved = current?.address !== input.address || current.city !== input.city;
    await tx.orm.Venue.where({ id }).update(moved ? { ...input, lat: null, lon: null } : input);
  });
}

export async function setVenueLocation(db: Db, id: string, lat: number, lon: number) {
  await transaction(db, (tx) => tx.orm.Venue.where({ id }).update({ lat, lon }));
}

export async function deleteVenue(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Venue.where({ id }).delete());
}

export async function listVenues(db: Reader) {
  const venues = await db.orm.Venue.select("id", "name", "city", "capacity").all();
  return venues.toSorted((a, b) => byText(a.name, b.name));
}

export async function getVenue(db: Reader, id: string) {
  const venue = await db.orm.Venue.where({ id })
    .include("gigs", (gig) => gig.select("id", "title", "date", "status"))
    .first();
  if (!venue) return;
  return {
    ...venue,
    gigs: venue.gigs
      .map((gig) => ({ ...gig, status: gig.status as GigStatus }))
      .toSorted((a, b) => b.date.localeCompare(a.date)),
  };
}
