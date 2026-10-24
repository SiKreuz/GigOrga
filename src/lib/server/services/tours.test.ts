import { getGig, updateGig } from "$lib/server/services/gigs";
import { createTour, deleteTour, getTour, listTours, updateTour } from "$lib/server/services/tours";
import { gigBasics, test } from "$lib/server/testing";
import { describe, expect } from "vitest";

describe("tours", () => {
  test("lists tours with their dates and number of gigs", async ({ db, insertGig }) => {
    const autumn = await createTour(db, { name: "Herbsttour" });
    const empty = await createTour(db, { name: "Frühjahr" });
    for (const date of ["2026-11-03", "2026-11-01"]) {
      const { id } = await insertGig({ date });
      await updateGig(db, id, gigBasics({ date, tourId: autumn }));
    }
    expect(await listTours(db)).toStrictEqual([
      { id: autumn, name: "Herbsttour", gigCount: 2, start: "2026-11-01", end: "2026-11-03" },
      { id: empty, name: "Frühjahr", gigCount: 0, start: null, end: null },
    ]);
  });

  test("returns the stops in driving order with venue and cars", async ({
    db,
    insertGig,
    insertVenue,
  }) => {
    const tour = await createTour(db, { name: "Herbsttour" });
    const venue = await insertVenue({ name: "Ampere" });
    const later = await insertGig({ date: "2026-11-03" });
    const earlier = await insertGig({ date: "2026-11-01", venueId: venue.id });
    await updateGig(db, later.id, gigBasics({ date: "2026-11-03", tourId: tour }));
    await updateGig(
      db,
      earlier.id,
      gigBasics({ date: "2026-11-01", venueId: venue.id, tourId: tour }),
    );

    const detail = await getTour(db, tour);
    expect(detail?.name).toBe("Herbsttour");
    expect(detail?.stops.map((stop) => stop.id)).toStrictEqual([earlier.id, later.id]);
    expect(detail?.stops[0]).toMatchObject({ venue: { name: "Ampere" }, cars: [] });
  });

  test("renames and deletes a tour but keeps its gigs", async ({ db, insertGig }) => {
    const tour = await createTour(db, { name: "Herbsttour" });
    const { id, date } = await insertGig();
    await updateGig(db, id, gigBasics({ date, tourId: tour }));
    await updateTour(db, tour, { name: "Herbst 2026" });
    expect(await getTour(db, tour)).toMatchObject({ name: "Herbst 2026" });
    await deleteTour(db, tour);
    expect(await getTour(db, tour)).toBeUndefined();
    expect(await getGig(db, id)).toMatchObject({ tourId: null, tourLeg: null });
  });
});
