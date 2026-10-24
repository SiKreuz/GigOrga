import {
  findOrCreateVenue,
  getVenue,
  listVenues,
  setVenueLocation,
  updateVenue,
} from "$lib/server/services/venues";
import { test, venueInput } from "$lib/server/testing";
import { describe, expect } from "vitest";

describe("venues", () => {
  test("creates and lists venues by name", async ({ db, insertVenue }) => {
    const b = await insertVenue({ name: "backstage" });
    const a = await insertVenue({ name: "Ampere" });
    expect((await listVenues(db)).map((venue) => venue.id)).toStrictEqual([a.id, b.id]);
  });

  test("finds a venue by name ignoring case or creates it", async ({ db, insertVenue }) => {
    const { id } = await insertVenue({ name: "Backstage" });
    expect(await findOrCreateVenue(db, "backstage")).toBe(id);
    const created = await findOrCreateVenue(db, "Ampere");
    expect(await getVenue(db, created)).toMatchObject({ name: "Ampere", address: "" });
  });

  test("forgets the cached location when the address changes", async ({ db, insertVenue }) => {
    const { id, ...input } = await insertVenue();
    await setVenueLocation(db, id, 48, 11);
    await updateVenue(db, id, { ...input, notes: "neu" });
    expect(await getVenue(db, id)).toMatchObject({ lat: 48, lon: 11, notes: "neu" });
    await updateVenue(db, id, venueInput());
    expect(await getVenue(db, id)).toMatchObject({ lat: null, lon: null });
  });

  test("lists the gigs at a venue, newest first", async ({ db, insertVenue, insertGig }) => {
    const venue = await insertVenue();
    const old = await insertGig({ venueId: venue.id, date: "2025-01-01" });
    const recent = await insertGig({ venueId: venue.id, date: "2026-01-01" });
    expect((await getVenue(db, venue.id))?.gigs.map((gig) => gig.id)).toStrictEqual([
      recent.id,
      old.id,
    ]);
  });
});
