import { getGig, updateGig } from "$lib/server/services/gigs";
import { routeToGig, routeTour, type RoutingConfig } from "$lib/server/services/routing";
import { getSettings, updateSettings } from "$lib/server/services/settings";
import { createTour } from "$lib/server/services/tours";
import { getVenue } from "$lib/server/services/venues";
import { gigBasics, test } from "$lib/server/testing";
import { describe, expect, vi } from "vitest";

const settings = {
  homeAddress: "Proberaum, München",
  bandSize: 4,
  petrolPrice: 1.8,
  dieselPrice: 1.7,
};

function fakeServices(places: Record<string, [number, number] | undefined>) {
  const calls: string[] = [];
  const fetch = vi.fn<(input: URL) => Promise<Response>>((input) => {
    calls.push(input.pathname);
    if (input.pathname === "/search") {
      const place = places[input.searchParams.get("q") ?? ""];
      const hits = place === undefined ? [] : [{ lat: String(place[0]), lon: String(place[1]) }];
      return Promise.resolve(Response.json(hits));
    }
    return Promise.resolve(Response.json({ routes: [{ distance: 123_456, duration: 5430 }] }));
  });
  const config: RoutingConfig = {
    geocoderUrl: "https://geo.test",
    routerUrl: "https://route.test",
    fetch: fetch as unknown as typeof globalThis.fetch,
  };
  return { config, calls };
}

describe("routeToGig", () => {
  test("geocodes both ends, caches the coordinates and stores the route", async ({
    db,
    insertGig,
    insertVenue,
  }) => {
    await updateSettings(db, settings);
    const venue = await insertVenue({ address: "Hauptstr. 1", city: "Augsburg" });
    const { id } = await insertGig({ venueId: venue.id });
    const { config, calls } = fakeServices({
      "Proberaum, München": [48.1, 11.5],
      "Hauptstr. 1, Augsburg": [48.3, 10.9],
    });

    expect(await routeToGig(db, config, id)).toEqual({
      ok: true,
      distanceKm: 123.5,
      durationMin: 91,
    });
    expect(await getGig(db, id)).toMatchObject({ distanceKm: 123.5, durationMin: 91 });
    expect(await getVenue(db, venue.id)).toMatchObject({ lat: 48.3, lon: 10.9 });
    expect(await getSettings(db)).toMatchObject({ homeLat: 48.1, homeLon: 11.5 });

    await routeToGig(db, config, id);
    expect(calls.filter((path) => path === "/search")).toHaveLength(2);
  });

  test("needs a venue and a home address", async ({ db, insertGig, insertVenue }) => {
    const { config } = fakeServices({});
    const withoutVenue = await insertGig();
    expect(await routeToGig(db, config, withoutVenue.id)).toMatchObject({ ok: false });
    const venue = await insertVenue();
    const withVenue = await insertGig({ venueId: venue.id });
    expect(await routeToGig(db, config, withVenue.id)).toEqual({
      ok: false,
      message: "Bitte zuerst die Startadresse in den Einstellungen eintragen.",
    });
  });

  test("reports unknown addresses", async ({ db, insertGig, insertVenue }) => {
    await updateSettings(db, settings);
    const venue = await insertVenue({ address: "Nirgendwo", city: "" });
    const { id } = await insertGig({ venueId: venue.id });
    const { config } = fakeServices({ "Proberaum, München": [48.1, 11.5] });
    expect(await routeToGig(db, config, id)).toEqual({
      ok: false,
      message: "Die Adresse der Venue wurde nicht gefunden.",
    });
  });

  test("drives a tour from stop to stop and home after the last one", async ({
    db,
    insertGig,
    insertVenue,
  }) => {
    await updateSettings(db, settings);
    const tour = await createTour(db, { name: "Herbsttour" });
    const augsburg = await insertVenue({ address: "Hauptstr. 1", city: "Augsburg" });
    const ulm = await insertVenue({ address: "Donauweg 2", city: "Ulm" });
    const stops: string[] = [];
    for (const [date, venue] of [
      ["2026-11-01", augsburg],
      ["2026-11-02", ulm],
    ] as const) {
      const { id } = await insertGig({ date, venueId: venue.id });
      await updateGig(db, id, gigBasics({ date, venueId: venue.id, tourId: tour }));
      stops.push(id);
    }
    const { config, calls } = fakeServices({
      "Proberaum, München": [48.1, 11.5],
      "Hauptstr. 1, Augsburg": [48.3, 10.9],
      "Donauweg 2, Ulm": [48.4, 10],
    });

    expect(await routeTour(db, config, tour)).toEqual({ ok: true });
    expect(calls.filter((path) => path.startsWith("/route"))).toEqual([
      "/route/v1/driving/11.5,48.1;10.9,48.3",
      "/route/v1/driving/10.9,48.3;10,48.4",
      "/route/v1/driving/10,48.4;11.5,48.1",
    ]);
    const [first, last] = await Promise.all(stops.map((id) => getGig(db, id)));
    expect(first).toMatchObject({ distanceKm: 123.5 });
    expect(last).toMatchObject({ distanceKm: 123.5, returnKm: 123.5, returnMin: 91 });
  });

  test("needs a venue at the previous tour stop", async ({ db, insertGig, insertVenue }) => {
    await updateSettings(db, settings);
    const tour = await createTour(db, { name: "Herbsttour" });
    const venue = await insertVenue();
    const first = await insertGig({ date: "2026-11-01" });
    const second = await insertGig({ date: "2026-11-02", venueId: venue.id });
    await updateGig(db, first.id, gigBasics({ date: first.date, tourId: tour }));
    await updateGig(
      db,
      second.id,
      gigBasics({ date: second.date, venueId: venue.id, tourId: tour }),
    );
    const { config } = fakeServices({});
    expect(await routeToGig(db, config, second.id)).toEqual({
      ok: false,
      message: "Der vorherige Gig der Tour hat keine Venue.",
    });
  });
});
