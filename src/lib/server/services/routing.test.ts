import { getGig } from "$lib/server/services/gigs";
import { routeToGig, type RoutingConfig } from "$lib/server/services/routing";
import { getSettings, updateSettings } from "$lib/server/services/settings";
import { getVenue } from "$lib/server/services/venues";
import { test } from "$lib/server/testing";
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
});
