import * as v from "valibot";

import { transaction } from "../db";
import type { Db } from "../db";
import { getGig } from "./gigs";
import { getSettings, setHomeLocation } from "./settings";
import { getTour } from "./tours";
import { setVenueLocation } from "./venues";

export type Point = { lat: number; lon: number };
export type RoutingConfig = { geocoderUrl: string; routerUrl: string; fetch: typeof fetch };
export type RouteResult =
  | { ok: true; distanceKm: number; durationMin: number }
  | { ok: false; message: string };

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lon: number | null;
};

const geocodeResponse = v.array(v.object({ lat: v.string(), lon: v.string() }));
const routeLeg = v.object({ distance: v.number(), duration: v.number() });
const routeResponse = v.object({ routes: v.optional(v.array(routeLeg)) });

const headers = { "User-Agent": "GigOrga/1.0 (self-hosted gig planner)", "Accept-Language": "de" };

export async function geocode(config: RoutingConfig, query: string): Promise<Point | undefined> {
  const url = new URL("/search", config.geocoderUrl);
  url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" }).toString();
  const response = await config.fetch(url, { headers });
  if (!response.ok) return undefined;
  const body = v.safeParse(geocodeResponse, await response.json());
  const hit = body.success ? body.output.at(0) : undefined;
  return hit ? { lat: Number(hit.lat), lon: Number(hit.lon) } : undefined;
}

export async function drivingRoute(config: RoutingConfig, from: Point, to: Point) {
  const path = `/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = new URL(path, config.routerUrl);
  url.searchParams.set("overview", "false");
  const response = await config.fetch(url, { headers });
  if (!response.ok) return;
  const body = v.safeParse(routeResponse, await response.json());
  const route = body.success ? body.output.routes?.at(0) : undefined;
  if (!route) return;
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMin: Math.round(route.duration / 60),
  };
}

async function locateHome(db: Db, config: RoutingConfig): Promise<Point | string> {
  const settings = await getSettings(db);
  if (!settings.homeAddress) {
    return "Bitte zuerst die Startadresse in den Einstellungen eintragen.";
  }
  if (settings.homeLat !== null && settings.homeLon !== null) {
    return { lat: settings.homeLat, lon: settings.homeLon };
  }
  const home = await geocode(config, settings.homeAddress);
  if (!home) return "Die Startadresse wurde nicht gefunden.";
  await setHomeLocation(db, home.lat, home.lon);
  return home;
}

async function locateVenue(db: Db, config: RoutingConfig, venue: Venue): Promise<Point | string> {
  if (venue.lat !== null && venue.lon !== null) return { lat: venue.lat, lon: venue.lon };
  const query = [venue.address, venue.city].filter(Boolean).join(", ") || venue.name;
  const point = await geocode(config, query);
  if (!point) return `Die Adresse der Venue ${venue.name} wurde nicht gefunden.`;
  await setVenueLocation(db, venue.id, point.lat, point.lon);
  return point;
}

async function locateOrigin(db: Db, config: RoutingConfig, fromGigId: string | undefined) {
  if (fromGigId === undefined) return locateHome(db, config);
  const previous = await db.orm.Gig.where({ id: fromGigId }).include("venue").first();
  if (!previous?.venue) return "Der vorherige Gig der Tour hat keine Venue.";
  return locateVenue(db, config, previous.venue);
}

const noRoute = { ok: false, message: "Es konnte keine Route berechnet werden." } as const;

export async function routeToGig(
  db: Db,
  config: RoutingConfig,
  gigId: string,
): Promise<RouteResult> {
  const gig = await getGig(db, gigId);
  if (!gig?.venue) return { ok: false, message: "Dem Gig ist keine Venue zugeordnet." };
  const leg = gig.tourLeg;

  const origin = await locateOrigin(db, config, leg?.from?.id);
  if (typeof origin === "string") return { ok: false, message: origin };
  const target = await locateVenue(db, config, gig.venue);
  if (typeof target === "string") {
    return { ok: false, message: "Die Adresse der Venue wurde nicht gefunden." };
  }

  const route = await drivingRoute(config, origin, target);
  if (!route) return noRoute;
  await transaction(db, (tx) => tx.orm.Gig.where({ id: gigId }).update(route));

  if (leg?.returnsHome === true) {
    const home = await locateHome(db, config);
    if (typeof home === "string") return { ok: false, message: home };
    const back = await drivingRoute(config, target, home);
    if (!back) return noRoute;
    await transaction(db, (tx) =>
      tx.orm.Gig.where({ id: gigId }).update({
        returnKm: back.distanceKm,
        returnMin: back.durationMin,
      }),
    );
  }
  return { ok: true, ...route };
}

export async function routeTour(
  db: Db,
  config: RoutingConfig,
  tourId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const tour = await getTour(db, tourId);
  for (const stop of tour?.stops ?? []) {
    // oxlint-disable-next-line no-await-in-loop -- each stop starts at the previous one; geocoder allows 1 req/s
    const result = await routeToGig(db, config, stop.id);
    if (!result.ok) return { ok: false, message: `${stop.title}: ${result.message}` };
  }
  return { ok: true };
}
