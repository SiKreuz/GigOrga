import * as v from "valibot";

import {
  accommodationTypes,
  backlineProviders,
  dealTypes,
  fuelTypes,
  gigStatuses,
  gigTypes,
  invoiceStatuses,
  keys,
  timetableKinds,
} from "./labels";

const text = (max: number) => v.optional(v.pipe(v.string(), v.trim(), v.maxLength(max)), "");
const required = (message: string, max = 200) =>
  v.pipe(v.string(), v.trim(), v.nonEmpty(message), v.maxLength(max));
const time = v.optional(
  v.pipe(v.string(), v.trim(), v.regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^$/u, "Ungültige Uhrzeit")),
  "",
);
const flag = v.pipe(
  v.optional(v.string(), ""),
  v.transform((value) => (value === "" ? 0 : 1)),
);
const number = v.pipe(
  v.optional(v.string(), ""),
  v.trim(),
  v.transform((value) => (value === "" ? null : Number(value.replace(",", ".")))),
  v.nullable(v.pipe(v.number("Keine gültige Zahl"), v.minValue(0, "Darf nicht negativ sein"))),
);
const integer = v.pipe(number, v.nullable(v.pipe(v.number(), v.integer("Ganze Zahl angeben"))));
const requiredNumber = (fallback: number) =>
  v.pipe(
    number,
    v.transform((value) => value ?? fallback),
  );
const jsonList = <T extends v.GenericSchema>(item: T) =>
  v.pipe(v.optional(v.string(), "[]"), v.parseJson(), v.array(item));
const flagValue = v.picklist([0, 1]);

export const newGigSchema = v.pipe(
  v.object({
    title: text(200),
    date: v.pipe(v.string(), v.isoDate("Bitte ein Datum angeben")),
    status: v.picklist(keys(gigStatuses)),
    venueName: text(200),
  }),
  v.forward(
    v.check((gig) => gig.title !== "" || gig.venueName !== "", "Bitte Venue oder Namen angeben"),
    ["venueName"],
  ),
);

export const gigBasicsSchema = v.object({
  title: required("Bitte einen Namen angeben"),
  date: v.pipe(v.string(), v.isoDate("Bitte ein Datum angeben")),
  status: v.picklist(keys(gigStatuses)),
  type: v.picklist(keys(gigTypes)),
  venueId: v.pipe(
    v.optional(v.string(), ""),
    v.transform((value) => (value === "" ? null : value)),
  ),
  notes: text(5000),
});

export const timetableSchema = v.object({
  entries: jsonList(
    v.object({
      kind: v.picklist(keys(timetableKinds)),
      start: time,
      end: time,
      label: text(200),
      fixed: flagValue,
    }),
  ),
});

export const supportActsSchema = v.object({
  acts: jsonList(
    v.object({
      name: required("Name fehlt"),
      link: text(500),
      contact: text(500),
      stageTime: time,
      sharesBackline: flagValue,
    }),
  ),
});

export const techSchema = v.object({
  ownFoh: flag,
  riderSent: flag,
  stagePlotSent: flag,
  inputListSent: flag,
  techNotes: text(5000),
  backline: jsonList(
    v.object({
      name: required("Bezeichnung fehlt"),
      provider: v.picklist(keys(backlineProviders)),
      note: text(500),
    }),
  ),
});

export const dealSchema = v.object({
  dealType: v.picklist(keys(dealTypes)),
  fee: number,
  doorPercent: v.pipe(number, v.nullable(v.pipe(v.number(), v.maxValue(100, "Höchstens 100 %")))),
  costs: number,
  rent: number,
  deposit: number,
  ticketPresale: number,
  ticketDoor: number,
  expectedAttendance: integer,
  invoiceStatus: v.picklist(keys(invoiceStatuses)),
  gemaReported: flag,
  dealNotes: text(5000),
  presaleLinks: jsonList(
    v.object({ label: text(100), url: v.pipe(v.string(), v.trim(), v.url("Ungültiger Link")) }),
  ),
});

export const travelSchema = v.object({
  distanceKm: number,
  durationMin: integer,
  people: integer,
  petrolPrice: number,
  dieselPrice: number,
  tolls: number,
  carIds: jsonList(v.string()),
});

export const carSchema = v.object({
  name: required("Bitte einen Namen angeben", 100),
  consumption: v.pipe(
    number,
    v.number("Bitte den Verbrauch angeben"),
    v.maxValue(50, "Unrealistischer Verbrauch"),
  ),
  fuel: v.picklist(keys(fuelTypes)),
  seats: integer,
  standard: flag,
});

export const hospitalitySchema = v.object({
  catering: flag,
  drinks: text(500),
  buyout: number,
  hospitalityNotes: text(5000),
});

export const accommodationSchema = v.object({
  accommodationType: v.picklist(keys(accommodationTypes)),
  accommodationName: text(200),
  accommodationAddress: text(500),
  accommodationLink: text(500),
  beds: integer,
  checkIn: time,
  breakfast: flag,
  accommodationPaid: flag,
  accommodationNotes: text(5000),
});

export const linkContactSchema = v.object({
  contactId: required("Bitte einen Kontakt wählen"),
  role: text(100),
});

export const venueSchema = v.object({
  name: required("Bitte einen Namen angeben"),
  address: text(500),
  city: text(200),
  capacity: integer,
  website: text(500),
  loadIn: text(2000),
  stage: text(500),
  notes: text(5000),
});

export const contactSchema = v.object({
  name: required("Bitte einen Namen angeben"),
  company: text(200),
  phone: text(100),
  email: text(200),
  notes: text(5000),
});

export const settingsSchema = v.object({
  homeAddress: text(500),
  bandSize: v.pipe(
    requiredNumber(4),
    v.integer("Ganze Zahl angeben"),
    v.minValue(1, "Mindestens 1"),
  ),
  petrolPrice: requiredNumber(1.8),
  dieselPrice: requiredNumber(1.7),
});

type Schema = v.GenericSchema<Record<string, unknown>, Record<string, unknown>>;

export type FormResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string>; values: Record<string, string> };

export function parseForm<S extends Schema>(
  schema: S,
  formData: FormData,
): FormResult<v.InferOutput<S>> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") values[key] = value;
  }
  const result = v.safeParse(schema, values);
  if (result.success) return { success: true, data: result.output };
  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key;
    if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
  }
  return { success: false, errors, values };
}
