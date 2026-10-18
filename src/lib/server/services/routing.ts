import { type Db, transaction } from "../db";
import { setHomeLocation, getSettings } from "./settings";
import { setVenueLocation } from "./venues";

export type Point = { lat: number; lon: number };
export type RoutingConfig = { geocoderUrl: string; routerUrl: string; fetch: typeof fetch };
export type RouteResult =
  | { ok: true; distanceKm: number; durationMin: number }
  | { ok: false; message: string };

const headers = { "User-Agent": "GigOrga/1.0 (self-hosted gig planner)", "Accept-Language": "de" };

export async function geocode(config: RoutingConfig, query: string): Promise<Point | undefined> {
  const url = new URL("/search", config.geocoderUrl);
  url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" }).toString();
  const response = await config.fetch(url, { headers });
  if (!response.ok) return undefined;
  const hit = ((await response.json()) as { lat: string; lon: string }[]).at(0);
  return hit ? { lat: Number(hit.lat), lon: Number(hit.lon) } : undefined;
}

export async function drivingRoute(config: RoutingConfig, from: Point, to: Point) {
  const path = `/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = new URL(path, config.routerUrl);
  url.searchParams.set("overview", "false");
  const response = await config.fetch(url, { headers });
  if (!response.ok) return;
  const body = (await response.json()) as { routes?: { distance: number; duration: number }[] };
  const route = body.routes?.at(0);
  if (!route) return;
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMin: Math.round(route.duration / 60),
  };
}

export async function routeToGig(
  db: Db,
  config: RoutingConfig,
  gigId: string,
): Promise<RouteResult> {
  const gig = await db.orm.Gig.where({ id: gigId }).include("venue").first();
  const venue = gig?.venue;
  if (!venue) return { ok: false, message: "Dem Gig ist keine Venue zugeordnet." };
  const settings = await getSettings(db);
  if (!settings.homeAddress) {
    return { ok: false, message: "Bitte zuerst die Startadresse in den Einstellungen eintragen." };
  }

  let home =
    settings.homeLat === null || settings.homeLon === null
      ? undefined
      : { lat: settings.homeLat, lon: settings.homeLon };
  if (!home) {
    home = await geocode(config, settings.homeAddress);
    if (!home) return { ok: false, message: "Die Startadresse wurde nicht gefunden." };
    await setHomeLocation(db, home.lat, home.lon);
  }

  let target =
    venue.lat === null || venue.lon === null ? undefined : { lat: venue.lat, lon: venue.lon };
  if (!target) {
    const query = [venue.address, venue.city].filter(Boolean).join(", ") || venue.name;
    target = await geocode(config, query);
    if (!target) return { ok: false, message: "Die Adresse der Venue wurde nicht gefunden." };
    await setVenueLocation(db, venue.id, target.lat, target.lon);
  }

  const route = await drivingRoute(config, home, target);
  if (!route) return { ok: false, message: "Es konnte keine Route berechnet werden." };
  await transaction(db, (tx) => tx.orm.Gig.where({ id: gigId }).update(route));
  return { ok: true, ...route };
}
