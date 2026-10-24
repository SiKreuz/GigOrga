export function timesOf<T extends { start: string }>(gig: { timetable: T[] }): T[] {
  return gig.timetable.filter((entry) => entry.start);
}

export function hasContacts(gig: { venue: unknown; contacts: unknown[] }): boolean {
  return Boolean(gig.venue) || gig.contacts.length > 0;
}

export function hasHospitality(gig: {
  catering: number;
  buyout: number | null;
  drinks: string;
  hospitalityNotes: string;
}): boolean {
  return Boolean(gig.catering || gig.buyout !== null || gig.drinks || gig.hospitalityNotes);
}

export function hasAccommodation(gig: { accommodationType: string }): boolean {
  return gig.accommodationType !== "keine";
}

const minutesOf = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export function playtime(gig: {
  timetable: { kind: string; start: string; end: string }[];
}): number | null {
  const slots = gig.timetable.filter(
    (entry) => entry.kind === "show" && entry.start !== "" && entry.end !== "",
  );
  if (slots.length === 0) return null;
  return slots.reduce((total, slot) => {
    const length = minutesOf(slot.end) - minutesOf(slot.start);
    return total + (length < 0 ? length + 24 * 60 : length);
  }, 0);
}
