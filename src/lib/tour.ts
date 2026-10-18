export type Stop = { id: string; date: string };

export function orderStops<T extends Stop>(stops: readonly T[]): T[] {
  return stops.toSorted((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function legOf<T extends Stop>(stops: readonly T[], id: string) {
  const ordered = orderStops(stops);
  const index = ordered.findIndex((stop) => stop.id === id);
  return { from: ordered[index - 1] ?? null, returnsHome: index === ordered.length - 1 };
}
