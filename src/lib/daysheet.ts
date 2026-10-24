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
