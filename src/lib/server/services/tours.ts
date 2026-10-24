import { fuelTypes, gigStatuses, keyOf } from "$lib/labels";
import { orderStops } from "$lib/tour";

import { transaction } from "../db";
import type { Db, Reader } from "../db";

export type TourInput = { name: string };

export function createTour(db: Db, input: TourInput): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Tour.create({ id, ...input });
    return id;
  });
}

export async function updateTour(db: Db, id: string, input: TourInput) {
  await transaction(db, (tx) => tx.orm.Tour.where({ id }).update(input));
}

export async function deleteTour(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Tour.where({ id }).delete());
}

export async function listTours(db: Reader) {
  const tours = await db.orm.Tour.select("id", "name")
    .include("gigs", (gig) => gig.select("date"))
    .all();
  return tours
    .map(({ gigs, ...tour }) => {
      const dates = gigs.map((gig) => gig.date).toSorted();
      return {
        ...tour,
        gigCount: gigs.length,
        start: dates.at(0) ?? null,
        end: dates.at(-1) ?? null,
      };
    })
    .toSorted((a, b) => {
      if (a.start === b.start) return a.name.localeCompare(b.name, "de");
      if (a.start === null) return 1;
      if (b.start === null) return -1;
      return a.start.localeCompare(b.start);
    });
}

export type TourSummary = Awaited<ReturnType<typeof listTours>>[number];

export async function getTour(db: Reader, id: string) {
  const tour = await db.orm.Tour.where({ id })
    .include("gigs", (gig) => gig.include("venue").include("cars", (link) => link.include("car")))
    .first();
  if (!tour) return;
  const { gigs, ...rest } = tour;
  return {
    ...rest,
    stops: orderStops(gigs).map((gig) => ({
      ...gig,
      status: keyOf(gigStatuses, gig.status),
      cars: gig.cars.map((link) => ({ ...link.car, fuel: keyOf(fuelTypes, link.car.fuel) })),
    })),
  };
}

export type TourDetail = NonNullable<Awaited<ReturnType<typeof getTour>>>;
