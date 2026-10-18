import type { DealType, FuelType } from "./labels";

export type DealTerms = {
  dealType: DealType;
  fee: number | null;
  doorPercent: number | null;
  costs: number | null;
  rent: number | null;
  ticketPresale: number | null;
  ticketDoor: number | null;
  expectedAttendance: number | null;
};

export type Trip = { distanceKm: number | null; returnKm: number | null; tolls: number | null };
export type FuelPrices = Record<FuelType, number>;

export type Estimate = {
  revenue: number | null;
  income: number | null;
  travel: number | null;
  net: number | null;
  perPerson: number | null;
  breakEven: number | null;
};

export function travelCost(
  trip: Trip,
  cars: { consumption: number; fuel: FuelType }[],
  prices: FuelPrices,
): number | null {
  const { distanceKm, returnKm } = trip;
  if (distanceKm === null || returnKm === null) return null;
  const km = distanceKm + returnKm;
  const fuel = cars.reduce(
    (sum, car) => sum + ((km * car.consumption) / 100) * prices[car.fuel],
    0,
  );
  return round(fuel + (trip.tolls ?? 0));
}

export function tripOf(gig: Trip, leg: { returnsHome: boolean } | null): Trip {
  if (leg === null) return { ...gig, returnKm: gig.distanceKm };
  return leg.returnsHome ? gig : { ...gig, returnKm: 0 };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function doorShare(revenue: number, deal: DealTerms) {
  return (Math.max(0, revenue - (deal.costs ?? 0)) * (deal.doorPercent ?? 0)) / 100;
}

function income(deal: DealTerms, revenue: number | null): number | null {
  switch (deal.dealType) {
    case "festgage":
    case "hut": {
      return deal.fee;
    }
    case "unbezahlt": {
      return 0;
    }
    case "tuerdeal": {
      return revenue === null ? null : doorShare(revenue, deal);
    }
    case "versus": {
      if (revenue === null) return deal.fee;
      return Math.max(deal.fee ?? 0, doorShare(revenue, deal));
    }
    case "saalmiete": {
      return revenue === null ? null : revenue - (deal.rent ?? 0) - (deal.costs ?? 0);
    }
  }
}

function breakEven(deal: DealTerms, price: number | null, travel: number): number | null {
  if (price === null || price <= 0) return null;
  const share = (deal.doorPercent ?? 0) / 100;
  const costs = deal.costs ?? 0;
  switch (deal.dealType) {
    case "tuerdeal": {
      return share > 0 ? Math.ceil((costs + travel / share) / price) : null;
    }
    case "versus": {
      return share > 0 ? Math.ceil((costs + (deal.fee ?? 0) / share) / price) : null;
    }
    case "saalmiete": {
      return Math.ceil(((deal.rent ?? 0) + costs + travel) / price);
    }
    case "festgage":
    case "hut":
    case "unbezahlt": {
      return null;
    }
  }
}

export function estimate(deal: DealTerms, travel: number | null, bandSize: number): Estimate {
  const price = deal.ticketPresale ?? deal.ticketDoor;
  const revenue =
    price === null || deal.expectedAttendance === null ? null : price * deal.expectedAttendance;
  const value = income(deal, revenue);
  const net = value === null ? null : round(value - (travel ?? 0));
  return {
    revenue: revenue === null ? null : round(revenue),
    income: value === null ? null : round(value),
    travel,
    net,
    perPerson: net === null || bandSize <= 0 ? null : round(net / bandSize),
    breakEven: breakEven(deal, price, travel ?? 0),
  };
}
