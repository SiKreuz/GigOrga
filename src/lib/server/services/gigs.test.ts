import { createCar } from "$lib/server/services/cars";
import {
  defaultBackline,
  defaultTimetable,
  deleteGig,
  getGig,
  linkContact,
  listGigs,
  type TechInput,
  unlinkContact,
  updateDeal,
  updateGig,
  updateSupportActs,
  updateTech,
  updateTimetable,
  updateTravel,
} from "$lib/server/services/gigs";
import { createSong, updateSetlist } from "$lib/server/services/songs";
import { archiveSoundEngineer, createSoundEngineer } from "$lib/server/services/soundEngineers";
import { createTour } from "$lib/server/services/tours";
import { deleteVenue } from "$lib/server/services/venues";
import { gigBasics, test } from "$lib/server/testing";
import { faker } from "@faker-js/faker";
import { describe, expect } from "vitest";

const techInput: TechInput = {
  soundEngineerId: null,
  houseEngineer: 0,
  riderSent: 0,
  stagePlotSent: 0,
  inputListSent: 0,
  techNotes: "",
  backline: [],
};

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
      returnKm: 110,
      returnMin: 80,
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

  test("knows where a tour stop arrives from and whether it returns home", async ({
    db,
    insertGig,
    insertVenue,
  }) => {
    const tour = await createTour(db, { name: "Herbsttour" });
    const venue = await insertVenue({ name: "Ampere", city: "München" });
    const first = await insertGig({ date: "2026-11-01", venueId: venue.id });
    const second = await insertGig({ date: "2026-11-02" });
    const { id: firstId, ...firstBasics } = first;
    const { id: secondId, ...secondBasics } = second;
    await updateGig(db, firstId, gigBasics({ ...firstBasics, tourId: tour }));
    await updateGig(db, secondId, gigBasics({ ...secondBasics, tourId: tour }));

    expect((await getGig(db, first.id))?.tourLeg).toEqual({
      tour: { id: tour, name: "Herbsttour" },
      from: null,
      returnsHome: false,
    });
    expect((await getGig(db, second.id))?.tourLeg).toEqual({
      tour: { id: tour, name: "Herbsttour" },
      from: { id: first.id, title: first.title, venue: { name: "Ampere", city: "München" } },
      returnsHome: true,
    });
    expect((await insertGig().then(({ id }) => getGig(db, id)))?.tourLeg).toBeNull();
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
    const tech: TechInput = {
      soundEngineerId: null,
      houseEngineer: 1,
      riderSent: 1,
      stagePlotSent: 0,
      inputListSent: 0,
      techNotes: "IEM",
      backline: [{ name: "Drumset", provider: "venue", note: "ohne Becken" }],
    };
    await updateTech(db, id, tech);
    const gig = await getGig(db, id);
    expect(gig).toMatchObject({ houseEngineer: 1, riderSent: 1, techNotes: "IEM" });
    expect(gig?.backline).toMatchObject(tech.backline);
  });

  test("keeps showing a sound engineer after they are archived", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    expect((await getGig(db, id))?.soundEngineer).toBeNull();
    const kim = { name: "Kim", phone: "0171 123456", email: "kim@example.com" };
    const engineerId = await createSoundEngineer(db, kim);
    const tech = { ...techInput, soundEngineerId: engineerId };
    await updateTech(db, id, tech);
    await archiveSoundEngineer(db, engineerId);
    expect((await getGig(db, id))?.soundEngineer).toEqual({ id: engineerId, ...kim });
    await updateTech(db, id, { ...tech, soundEngineerId: null });
    expect((await getGig(db, id))?.soundEngineer).toBeNull();
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

  test("marks gigs with a setlist in the overview", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    expect((await listGigs(db))[0]?.hasSetlist).toBe(false);
    await updateSetlist(db, id, [
      await createSong(db, { title: "Hit", durationSec: 200, notes: "" }),
    ]);
    expect((await listGigs(db))[0]?.hasSetlist).toBe(true);
  });

  test("deletes a gig", async ({ db, insertGig }) => {
    const { id } = await insertGig();
    await deleteGig(db, id);
    expect(await getGig(db, id)).toBeUndefined();
  });
});
