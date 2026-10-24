import type { techSchema } from "$lib/forms";
import type {
  AccommodationType,
  BacklineProvider,
  DealType,
  GigStatus,
  GigType,
  InvoiceStatus,
  TimetableKind,
} from "$lib/labels";
import type * as v from "valibot";

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

export type TechInput = v.InferOutput<typeof techSchema>;

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
