import { describe, expect, test } from "vitest";

import { estimate, travelCost, tripOf } from "./deal";
import type { DealTerms } from "./deal";

const terms = (overrides: Partial<DealTerms> = {}): DealTerms => ({
  dealType: "festgage",
  fee: null,
  doorPercent: null,
  costs: null,
  rent: null,
  ticketPresale: null,
  ticketDoor: null,
  expectedAttendance: null,
  ...overrides,
});

const prices = { benzin: 2, diesel: 2 };

describe("travelCost", () => {
  test("is unknown without a distance", () => {
    const cars = [{ consumption: 10, fuel: "diesel" as const }];
    expect(travelCost({ distanceKm: null, returnKm: null, tolls: null }, cars, prices)).toBeNull();
  });

  test("counts the round trip for every car with its own consumption plus tolls", () => {
    const cars = [
      { consumption: 10, fuel: "diesel" as const },
      { consumption: 5, fuel: "diesel" as const },
    ];
    expect(travelCost({ distanceKm: 100, returnKm: 100, tolls: 15 }, cars, prices)).toBe(75);
  });

  test("prices every car by its fuel type", () => {
    const cars = [
      { consumption: 10, fuel: "diesel" as const },
      { consumption: 5, fuel: "benzin" as const },
    ];
    expect(
      travelCost({ distanceKm: 100, returnKm: 100, tolls: null }, cars, { benzin: 2, diesel: 1.5 }),
    ).toBe(50);
  });

  test("is unknown while the return leg is missing", () => {
    const cars = [{ consumption: 10, fuel: "diesel" as const }];
    expect(travelCost({ distanceKm: 100, returnKm: null, tolls: null }, cars, prices)).toBeNull();
  });

  test("only counts tolls without cars", () => {
    expect(travelCost({ distanceKm: 50, returnKm: 50, tolls: 8 }, [], prices)).toBe(8);
  });
});

describe("tripOf", () => {
  const gig = { distanceKm: 100, returnKm: 80, tolls: 5 };

  test("drives back the same way without a tour", () => {
    expect(tripOf(gig, null)).toStrictEqual({ distanceKm: 100, returnKm: 100, tolls: 5 });
  });

  test("drives on to the next tour stop without returning", () => {
    expect(tripOf(gig, { returnsHome: false })).toStrictEqual({
      distanceKm: 100,
      returnKm: 0,
      tolls: 5,
    });
  });

  test("drives home after the last tour stop", () => {
    expect(tripOf(gig, { returnsHome: true })).toStrictEqual({
      distanceKm: 100,
      returnKm: 80,
      tolls: 5,
    });
  });
});

describe("estimate", () => {
  test("pays the fixed fee", () => {
    expect(estimate(terms({ fee: 500 }), 100, 4)).toMatchObject({
      income: 500,
      net: 400,
      perPerson: 100,
    });
  });

  test("uses the presale price for ticket revenue, falling back to the door price", () => {
    expect(
      estimate(terms({ ticketPresale: 10, ticketDoor: 12, expectedAttendance: 50 }), null, 4),
    ).toMatchObject({ revenue: 500 });
    expect(estimate(terms({ ticketDoor: 12, expectedAttendance: 50 }), null, 4)).toMatchObject({
      revenue: 600,
    });
  });

  test("pays the door percentage after costs", () => {
    const deal = terms({
      dealType: "tuerdeal",
      doorPercent: 70,
      costs: 200,
      ticketPresale: 10,
      expectedAttendance: 100,
    });
    expect(estimate(deal, 0, 4)).toMatchObject({ income: 560 });
  });

  test("never pays a negative door share", () => {
    const deal = terms({
      dealType: "tuerdeal",
      doorPercent: 70,
      costs: 500,
      ticketPresale: 10,
      expectedAttendance: 10,
    });
    expect(estimate(deal, 0, 4)).toMatchObject({ income: 0 });
  });

  test("computes the attendance needed to cover travel on a door deal", () => {
    const deal = terms({ dealType: "tuerdeal", doorPercent: 50, costs: 100, ticketPresale: 10 });
    expect(estimate(deal, 100, 4)).toMatchObject({ income: null, breakEven: 30 });
  });

  test("pays whichever is higher on a versus deal", () => {
    const deal = terms({
      dealType: "versus",
      fee: 300,
      doorPercent: 80,
      ticketPresale: 10,
      expectedAttendance: 20,
    });
    expect(estimate(deal, 0, 4)).toMatchObject({ income: 300, breakEven: 38 });
    expect(estimate({ ...deal, expectedAttendance: 100 }, 0, 4)).toMatchObject({ income: 800 });
  });

  test("keeps the ticket revenue minus rent and costs on a rental", () => {
    const deal = terms({
      dealType: "saalmiete",
      rent: 400,
      costs: 100,
      ticketPresale: 15,
      expectedAttendance: 60,
    });
    expect(estimate(deal, 50, 4)).toMatchObject({ income: 400, net: 350, breakEven: 37 });
  });

  test("counts an expected hat collection as income and unpaid gigs as zero", () => {
    expect(estimate(terms({ dealType: "hut", fee: 120 }), 20, 4)).toMatchObject({ net: 100 });
    expect(estimate(terms({ dealType: "unbezahlt", fee: 120 }), 20, 4)).toMatchObject({
      income: 0,
      net: -20,
    });
  });

  test("leaves net open while income is unknown", () => {
    expect(estimate(terms(), 20, 4)).toMatchObject({ income: null, net: null, perPerson: null });
  });
});
