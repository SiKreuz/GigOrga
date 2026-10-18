import { createCar } from "$lib/server/services/cars";
import {
  defaultBackline,
  defaultTimetable,
  deleteGig,
  getGig,
  linkContact,
  listGigs,
  unlinkContact,
  updateDeal,
  updateGig,
  updateSupportActs,
  updateTech,
  updateTimetable,
  updateTravel,
} from "$lib/server/services/gigs";
import { deleteVenue } from "$lib/server/services/venues";
import { gigBasics, test } from "$lib/server/testing";
import { faker } from "@faker-js/faker";
import { describe, expect } from "vitest";

describe("gigs", () => {
  test("creates a gig with the default timetable and backline", async ({ db, insertGig }) => {
    const { id, ...basics } = await insertGig();
    const gig = await getGig(db, id);
    expect(gig).toMatchObject({
      id,
      ...basics,
      type: "club",
      dealType: "festgage",
      accommodationType: "keine",
    });
    expect(gig?.timetable).toMatchObject(defaultTimetable);
    expect(gig?.backline).toMatchObject(defaultBackline);
    expect(gig?.backline.map((item) => item.name)).toEqual(["Drumset", "PA"]);
  });

  test("preselects the standard cars", async ({ db, insertGig }) => {
    await createCar(db, { name: "Bus", consumption: 10, fuel: "diesel", seats: 8, standard: 1 });
    await createCar(db, { name: "Kombi", consumption: 6, fuel: "benzin", seats: 5, standard: 0 });
    const { id } = await insertGig();
    expect((await getGig(db, id))?.cars.map((car) => car.name)).toEqual(["Bus"]);
  });

  test("updates travel with people, fuel prices and cars", async ({ db, insertGig }) => {
    const bus = await createCar(db, {
      name: "Bus",
      consumption: 10,
      fuel: "diesel",
      seats: 8,
      standard: 1,
    });
    const kombi = await createCar(db, {
      name: "Kombi",
      consumption: 6,
      fuel: "benzin",
      seats: 5,
      standard: 0,
    });
    const { id } = await insertGig();
    const travel = {
      distanceKm: 120,
      durationMin: 90,
      people: 3,
      petrolPrice: 1.85,
      dieselPrice: 1.65,
      tolls: 5,
    };
    await updateTravel(db, id, { ...travel, carIds: [kombi] });
    const gig = await getGig(db, id);
    expect(gig).toMatchObject(travel);
    expect(gig?.cars).toMatchObject([{ id: kombi, fuel: "benzin" }]);
    expect(gig?.cars.map((car) => car.id)).not.toContain(bus);
  });

  test("returns undefined for unknown gigs", async ({ db }) => {
    expect(await getGig(db, faker.string.uuid())).toBeUndefined();
  });

  test("updates the basics and loads the venue", async ({ db, insertGig, insertVenue }) => {
    const { id } = await insertGig();
    const venue = await insertVenue();
    const basics = gigBasics({ venueId: venue.id, status: "bestaetigt" });
    await updateGig(db, id, basics);
    const gig = await getGig(db, id);
    expect(gig).toMatchObject(basics);
    expect(gig?.venue?.name).toBe(venue.name);
  });

  test("keeps the gig when its venue is deleted", async ({ db, insertGig, insertVenue }) => {
    const venue = await insertVenue();
    const { id } = await insertGig({ venueId: venue.id });
    await deleteVenue(db, venue.id);
    expect(await getGig(db, id)).toMatchObject({ venueId: null, venue: null });
  });

  test("replaces the timetable in the given order", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    const rows = [
      { kind: "abfahrt" as const, start: "14:00", end: "", label: "Proberaum", fixed: 0 },
      { kind: "getin" as const, start: "17:00", end: "", label: "", fixed: 1 },
    ];
    await updateTimetable(db, id, rows);
    expect((await getGig(db, id))?.timetable).toMatchObject(rows);
  });

  test("replaces support acts", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    const acts = [
      { name: "Vorband", link: "", contact: "", stageTime: "20:00", sharesBackline: 1 },
    ];
    await updateSupportActs(db, id, acts);
    await updateSupportActs(db, id, acts);
    expect((await getGig(db, id))?.supportActs).toMatchObject(acts);
  });

  test("updates the deal with presale links", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    const deal = {
      dealType: "saalmiete" as const,
      fee: null,
      doorPercent: null,
      costs: 50,
      rent: 400,
      deposit: null,
      ticketPresale: 15,
      ticketDoor: 18,
      expectedAttendance: 80,
      invoiceStatus: "offen" as const,
      gemaReported: 0,
      dealNotes: "",
      presaleLinks: [{ label: "Eventim", url: "https://example.com" }],
    };
    await updateDeal(db, id, deal);
    const { presaleLinks, ...fields } = deal;
    const gig = await getGig(db, id);
    expect(gig).toMatchObject(fields);
    expect(gig?.presaleLinks).toMatchObject(presaleLinks);
  });

  test("updates tech and backline", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    const tech = {
      ownFoh: 1,
      riderSent: 1,
      stagePlotSent: 0,
      inputListSent: 0,
      techNotes: "IEM",
      backline: [{ name: "Drumset", provider: "venue" as const, note: "ohne Becken" }],
    };
    await updateTech(db, id, tech);
    const gig = await getGig(db, id);
    expect(gig).toMatchObject({ ownFoh: 1, riderSent: 1, techNotes: "IEM" });
    expect(gig?.backline).toMatchObject(tech.backline);
  });

  test("links and unlinks contacts", async ({ db, insertGig, insertContact }) => {
    const { id } = await insertGig();
    const contact = await insertContact();
    await linkContact(db, id, contact.id, "Veranstalter");
    await linkContact(db, id, contact.id, "Technik");
    expect((await getGig(db, id))?.contacts).toMatchObject([
      { role: "Technik", contact: { name: contact.name } },
    ]);
    await unlinkContact(db, id, contact.id);
    expect((await getGig(db, id))?.contacts).toEqual([]);
  });

  test("lists gigs by date with get-in and show time", async ({ db, insertGig }) => {
    const late = await insertGig({ date: "2027-05-01" });
    const early = await insertGig({ date: "2027-01-01" });
    await updateTimetable(db, early.id, [
      { kind: "getin", start: "16:30", end: "", label: "", fixed: 1 },
      { kind: "show", start: "21:00", end: "", label: "", fixed: 0 },
    ]);
    const gigs = await listGigs(db);
    expect(gigs.map((gig) => gig.id)).toEqual([early.id, late.id]);
    expect(gigs[0]).toMatchObject({ getIn: "16:30", showTime: "21:00" });
  });

  test("deletes a gig", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    await deleteGig(db, id);
    expect(await getGig(db, id)).toBeUndefined();
  });
});
