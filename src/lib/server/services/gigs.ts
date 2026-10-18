import type {
  AccommodationType,
  BacklineProvider,
  DealType,
  FuelType,
  GigStatus,
  GigType,
  InvoiceStatus,
  TimetableKind,
} from "$lib/labels";
import { legOf } from "$lib/tour";

import { type Db, type Reader, transaction, type Tx } from "../db";

export type GigBasics = {
  title: string;
  date: string;
  status: GigStatus;
  type: GigType;
  venueId: string | null;
  tourId: string | null;
  notes: string;
};

export type NewGig = Pick<GigBasics, "title" | "date" | "status" | "venueId">;

export type TimetableRow = {
  kind: TimetableKind;
  start: string;
  end: string;
  label: string;
  fixed: number;
};

export type SupportActRow = {
  name: string;
  link: string;
  contact: string;
  stageTime: string;
  sharesBackline: number;
};

export type BacklineRow = { name: string; provider: BacklineProvider; note: string };
export type PresaleLinkRow = { label: string; url: string };

export type DealInput = {
  dealType: DealType;
  fee: number | null;
  doorPercent: number | null;
  costs: number | null;
  rent: number | null;
  deposit: number | null;
  ticketPresale: number | null;
  ticketDoor: number | null;
  expectedAttendance: number | null;
  invoiceStatus: InvoiceStatus;
  gemaReported: number;
  dealNotes: string;
  presaleLinks: PresaleLinkRow[];
};

export type TravelInput = {
  distanceKm: number | null;
  durationMin: number | null;
  returnKm: number | null;
  returnMin: number | null;
  people: number | null;
  petrolPrice: number | null;
  dieselPrice: number | null;
  tolls: number | null;
  carIds: string[];
};

export type TechInput = {
  ownFoh: number;
  riderSent: number;
  stagePlotSent: number;
  inputListSent: number;
  techNotes: string;
  backline: BacklineRow[];
};

export type HospitalityInput = {
  catering: number;
  drinks: string;
  buyout: number | null;
  hospitalityNotes: string;
};

export type AccommodationInput = {
  accommodationType: AccommodationType;
  accommodationName: string;
  accommodationAddress: string;
  accommodationLink: string;
  beds: number | null;
  checkIn: string;
  breakfast: number;
  accommodationPaid: number;
  accommodationNotes: string;
};

export const defaultTimetable: TimetableRow[] = [
  { kind: "getin", start: "", end: "", label: "", fixed: 1 },
  { kind: "soundcheck", start: "", end: "", label: "", fixed: 0 },
  { kind: "einlass", start: "", end: "", label: "", fixed: 0 },
  { kind: "show", start: "", end: "", label: "", fixed: 0 },
];

export const defaultBackline: BacklineRow[] = ["Drumset", "PA"].map((name) => ({
  name,
  provider: "unklar",
  note: "",
}));

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

async function replaceTimetable(tx: Tx, gigId: string, rows: TimetableRow[]) {
  await tx.orm.TimetableEntry.where({ gigId }).deleteAll();
  for (const [position, row] of rows.entries()) {
    await tx.orm.TimetableEntry.create({ id: Bun.randomUUIDv7(), gigId, position, ...row });
  }
}

async function replaceBackline(tx: Tx, gigId: string, rows: BacklineRow[]) {
  await tx.orm.BacklineItem.where({ gigId }).deleteAll();
  for (const [position, row] of rows.entries()) {
    await tx.orm.BacklineItem.create({ id: Bun.randomUUIDv7(), gigId, position, ...row });
  }
}

async function replacePresaleLinks(tx: Tx, gigId: string, rows: PresaleLinkRow[]) {
  await tx.orm.PresaleLink.where({ gigId }).deleteAll();
  for (const [position, row] of rows.entries()) {
    await tx.orm.PresaleLink.create({ id: Bun.randomUUIDv7(), gigId, position, ...row });
  }
}

async function replaceCars(tx: Tx, gigId: string, carIds: string[]) {
  await tx.orm.GigCar.where({ gigId }).deleteAll();
  for (const carId of new Set(carIds)) await tx.orm.GigCar.create({ gigId, carId });
}

export function createGig(db: Db, gig: NewGig): Promise<string> {
  return transaction(db, async (tx) => {
    const id = Bun.randomUUIDv7();
    await tx.orm.Gig.create({ id, ...gig });
    await replaceTimetable(tx, id, defaultTimetable);
    await replaceBackline(tx, id, defaultBackline);
    const cars = await tx.orm.Car.where({ standard: 1 }).select("id").all();
    await replaceCars(
      tx,
      id,
      cars.map((car) => car.id),
    );
    return id;
  });
}

export async function updateGig(
  db: Db,
  id: string,
  input: GigBasics | HospitalityInput | AccommodationInput,
) {
  await transaction(db, (tx) => tx.orm.Gig.where({ id }).update(input));
}

export async function updateTravel(db: Db, id: string, { carIds, ...travel }: TravelInput) {
  await transaction(db, async (tx) => {
    await tx.orm.Gig.where({ id }).update(travel);
    await replaceCars(tx, id, carIds);
  });
}

export async function updateDeal(db: Db, id: string, { presaleLinks, ...deal }: DealInput) {
  await transaction(db, async (tx) => {
    await tx.orm.Gig.where({ id }).update(deal);
    await replacePresaleLinks(tx, id, presaleLinks);
  });
}

export async function updateTech(db: Db, id: string, { backline, ...tech }: TechInput) {
  await transaction(db, async (tx) => {
    await tx.orm.Gig.where({ id }).update(tech);
    await replaceBackline(tx, id, backline);
  });
}

export async function updateTimetable(db: Db, id: string, rows: TimetableRow[]) {
  await transaction(db, (tx) => replaceTimetable(tx, id, rows));
}

export async function updateSupportActs(db: Db, gigId: string, rows: SupportActRow[]) {
  await transaction(db, async (tx) => {
    await tx.orm.SupportAct.where({ gigId }).deleteAll();
    for (const [position, row] of rows.entries()) {
      await tx.orm.SupportAct.create({ id: Bun.randomUUIDv7(), gigId, position, ...row });
    }
  });
}

export async function linkContact(db: Db, gigId: string, contactId: string, role: string) {
  await transaction(db, async (tx) => {
    await tx.orm.GigContact.where({ gigId, contactId }).delete();
    await tx.orm.GigContact.create({ gigId, contactId, role });
  });
}

export async function unlinkContact(db: Db, gigId: string, contactId: string) {
  await transaction(db, (tx) => tx.orm.GigContact.where({ gigId, contactId }).delete());
}

export async function deleteGig(db: Db, id: string) {
  await transaction(db, (tx) => tx.orm.Gig.where({ id }).delete());
}

export async function getGig(db: Reader, id: string) {
  const gig = await db.orm.Gig.where({ id })
    .include("venue")
    .include("contacts", (link) => link.include("contact"))
    .include("cars", (link) => link.include("car"))
    .include("timetable")
    .include("supportActs")
    .include("backline")
    .include("presaleLinks")
    .include("tour", (tour) =>
      tour
        .select("id", "name")
        .include("gigs", (stop) =>
          stop
            .select("id", "title", "date")
            .include("venue", (venue) => venue.select("name", "city")),
        ),
    )
    .first();
  if (!gig) return;
  const { tour, ...rest } = gig;
  return {
    ...rest,
    tourLeg: tour ? tourLegOf(tour, gig.id) : null,
    status: gig.status as GigStatus,
    type: gig.type as GigType,
    dealType: gig.dealType as DealType,
    invoiceStatus: gig.invoiceStatus as InvoiceStatus,
    accommodationType: gig.accommodationType as AccommodationType,
    cars: gig.cars
      .map((link) => ({ ...link.car, fuel: link.car.fuel as FuelType }))
      .toSorted((a, b) => a.name.localeCompare(b.name, "de")),
    contacts: gig.contacts.toSorted((a, b) => a.contact.name.localeCompare(b.contact.name, "de")),
    timetable: gig.timetable
      .toSorted(byPosition)
      .map((entry) => ({ ...entry, kind: entry.kind as TimetableKind })),
    supportActs: gig.supportActs.toSorted(byPosition),
    backline: gig.backline
      .toSorted(byPosition)
      .map((item) => ({ ...item, provider: item.provider as BacklineProvider })),
    presaleLinks: gig.presaleLinks.toSorted(byPosition),
  };
}

function tourLegOf(
  tour: {
    id: string;
    name: string;
    gigs: {
      id: string;
      title: string;
      date: string;
      venue: { name: string; city: string } | null;
    }[];
  },
  gigId: string,
) {
  const { from, returnsHome } = legOf(tour.gigs, gigId);
  return {
    tour: { id: tour.id, name: tour.name },
    from: from === null ? null : { id: from.id, title: from.title, venue: from.venue },
    returnsHome,
  };
}

export type GigDetail = NonNullable<Awaited<ReturnType<typeof getGig>>>;

export async function listGigs(db: Reader) {
  const gigs = await db.orm.Gig.select("id", "title", "date", "status", "type", "dealType", "fee")
    .include("venue", (venue) => venue.select("id", "name", "city"))
    .include("timetable", (entry) => entry.select("kind", "start", "fixed"))
    .all();
  return gigs
    .map(({ timetable, ...gig }) => ({
      ...gig,
      status: gig.status as GigStatus,
      type: gig.type as GigType,
      dealType: gig.dealType as DealType,
      getIn: timetable.find((entry) => entry.kind === "getin")?.start ?? "",
      showTime: timetable.find((entry) => entry.kind === "show")?.start ?? "",
    }))
    .toSorted((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "de"));
}

export type GigSummary = Awaited<ReturnType<typeof listGigs>>[number];
