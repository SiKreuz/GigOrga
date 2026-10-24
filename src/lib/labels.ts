export const gigStatuses = {
  anfrage: "Anfrage",
  option: "Option",
  bestaetigt: "Bestätigt",
  vertrag: "Vertrag",
  gespielt: "Gespielt",
  abgesagt: "Abgesagt",
} as const;

export const gigTypes = {
  club: "Club",
  festival: "Festival",
  privat: "Privat",
  support: "Support",
  headliner: "Headliner",
} as const;

export const dealTypes = {
  festgage: "Festgage",
  tuerdeal: "Türdeal",
  versus: "Garantie vs. Prozent",
  saalmiete: "Saalmiete",
  hut: "Hut / Spende",
  unbezahlt: "Unbezahlt",
} as const;

export const invoiceStatuses = {
  offen: "Offen",
  gestellt: "Gestellt",
  bezahlt: "Bezahlt",
} as const;

export const accommodationTypes = {
  keine: "Keine",
  hotel: "Hotel",
  pension: "Pension",
  privat: "Privat / Pennplatz",
  veranstalter: "Veranstalter stellt",
} as const;

export const timetableKinds = {
  abfahrt: "Abfahrt",
  getin: "Get-in",
  aufbau: "Aufbau",
  soundcheck: "Soundcheck",
  einlass: "Einlass",
  support: "Support",
  show: "Show",
  umbau: "Umbau",
  curfew: "Curfew",
  abbau: "Abbau",
  sonstiges: "Sonstiges",
} as const;

export const backlineProviders = {
  unklar: "Unklar",
  venue: "Venue stellt",
  wir: "Wir bringen",
  support: "Support stellt",
} as const;

export const fuelTypes = {
  diesel: "Diesel",
  benzin: "Benzin",
} as const;

export const roles = {
  admin: "Admin",
  editor: "Bearbeiten",
  viewer: "Nur lesen",
} as const;

export type GigStatus = keyof typeof gigStatuses;
export type GigType = keyof typeof gigTypes;
export type DealType = keyof typeof dealTypes;
export type InvoiceStatus = keyof typeof invoiceStatuses;
export type AccommodationType = keyof typeof accommodationTypes;
export type TimetableKind = keyof typeof timetableKinds;
export type BacklineProvider = keyof typeof backlineProviders;
export type FuelType = keyof typeof fuelTypes;
export type Role = keyof typeof roles;

export const keys = <T extends Record<string, string>>(labels: T) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.keys loses the key type
  Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]];

const isKey = <K extends string>(labels: Record<K, string>, value: string): value is K =>
  Object.hasOwn(labels, value);

export function keyOf<K extends string>(labels: Record<K, string>, value: string): K {
  if (isKey(labels, value)) return value;
  throw new Error(`Unknown value: ${value}`);
}
