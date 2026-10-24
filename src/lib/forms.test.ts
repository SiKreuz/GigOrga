import { describe, expect, test } from "vitest";

import {
  carSchema,
  dealSchema,
  gigBasicsSchema,
  newGigSchema,
  parseForm,
  settingsSchema,
  soundEngineerSchema,
  techSchema,
  tourSchema,
  travelSchema,
  userChangeSchema,
} from "./forms";

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

describe("parseForm", () => {
  test("parses gig basics and maps an empty venue to null", () => {
    const result = parseForm(
      gigBasicsSchema,
      form({ title: " Club ", date: "2026-12-11", status: "option", type: "club", venueId: "" }),
    );
    expect(result).toEqual({
      success: true,
      data: {
        title: "Club",
        date: "2026-12-11",
        status: "option",
        type: "club",
        venueId: null,
        tourId: null,
        notes: "",
      },
    });
  });

  test("reports German errors per field", () => {
    const result = parseForm(
      gigBasicsSchema,
      form({ title: "", date: "", status: "x", type: "club" }),
    );
    expect(result).toMatchObject({
      success: false,
      errors: { title: "Bitte einen Namen angeben", date: "Bitte ein Datum angeben" },
    });
  });

  test("accepts decimal commas, empty numbers and checkboxes", () => {
    const result = parseForm(
      dealSchema,
      form({
        dealType: "tuerdeal",
        doorPercent: "70",
        ticketPresale: "12,50",
        fee: "",
        invoiceStatus: "offen",
        gemaReported: "on",
        presaleLinks: '[{"label":"Eventim","url":"https://example.com"}]',
      }),
    );
    expect(result).toMatchObject({
      success: true,
      data: {
        doorPercent: 70,
        ticketPresale: 12.5,
        fee: null,
        gemaReported: 1,
        presaleLinks: [{ label: "Eventim", url: "https://example.com" }],
      },
    });
  });

  test("rejects invalid numbers and percentages", () => {
    const result = parseForm(
      dealSchema,
      form({ dealType: "tuerdeal", doorPercent: "120", fee: "abc", invoiceStatus: "offen" }),
    );
    expect(result).toMatchObject({
      success: false,
      errors: { doorPercent: "Höchstens 100 %", fee: "Keine gültige Zahl" },
    });
  });

  test("parses list sections from JSON", () => {
    const result = parseForm(
      techSchema,
      form({ backline: '[{"name":"Drumset","provider":"venue","note":""}]' }),
    );
    expect(result).toMatchObject({
      success: true,
      data: { riderSent: 0, backline: [{ name: "Drumset", provider: "venue" }] },
    });
  });

  test("falls back to defaults for empty settings", () => {
    expect(parseForm(settingsSchema, form({}))).toEqual({
      success: true,
      data: { homeAddress: "", bandSize: 4, petrolPrice: 1.8, dieselPrice: 1.7 },
    });
  });

  test("needs a venue or a title for a new gig", () => {
    expect(parseForm(newGigSchema, form({ date: "2026-12-11", status: "anfrage" }))).toMatchObject({
      success: false,
      errors: { venueName: "Bitte Venue oder Namen angeben" },
    });
    expect(
      parseForm(newGigSchema, form({ date: "2026-12-11", status: "option", venueName: "Ampere" })),
    ).toMatchObject({ success: true, data: { title: "", venueName: "Ampere" } });
  });

  test("parses travel with the selected cars", () => {
    expect(
      parseForm(
        travelSchema,
        form({
          people: "3",
          returnKm: "88,5",
          petrolPrice: "1,89",
          dieselPrice: "1,69",
          carIds: '["a","b"]',
        }),
      ),
    ).toMatchObject({
      success: true,
      data: {
        people: 3,
        returnKm: 88.5,
        returnMin: null,
        petrolPrice: 1.89,
        dieselPrice: 1.69,
        carIds: ["a", "b"],
      },
    });
  });

  test("parses a car with its fuel type", () => {
    expect(
      parseForm(carSchema, form({ name: "Bus", consumption: "9,5", fuel: "benzin" })),
    ).toMatchObject({ success: true, data: { consumption: 9.5, fuel: "benzin" } });
  });

  test("parses gig basics with an optional tour", () => {
    const basics = { title: "Ampere", date: "2026-12-11", status: "option", type: "club" };
    expect(parseForm(gigBasicsSchema, form({ ...basics, tourId: "" }))).toMatchObject({
      success: true,
      data: { tourId: null },
    });
    expect(parseForm(gigBasicsSchema, form({ ...basics, tourId: "t1" }))).toMatchObject({
      success: true,
      data: { tourId: "t1" },
    });
  });

  test("requires a tour name", () => {
    expect(parseForm(tourSchema, form({ name: " " }))).toMatchObject({
      success: false,
      errors: { name: "Bitte einen Namen angeben" },
    });
  });

  test("parses a sound engineer and requires a name", () => {
    expect(parseForm(soundEngineerSchema, form({ name: " Kim ", phone: "0171 123456" }))).toEqual({
      success: true,
      data: { name: "Kim", phone: "0171 123456", email: "" },
    });
    expect(parseForm(soundEngineerSchema, form({ name: "" }))).toMatchObject({
      success: false,
      errors: { name: "Bitte einen Namen angeben" },
    });
  });

  test("requires a consumption for cars", () => {
    expect(parseForm(carSchema, form({ name: "Bus" }))).toMatchObject({
      success: false,
      errors: { consumption: "Bitte den Verbrauch angeben" },
    });
  });

  test("parses a role change and an activation flag", () => {
    expect(parseForm(userChangeSchema, form({ id: "u1", role: "editor" }))).toEqual({
      success: true,
      data: { id: "u1", role: "editor" },
    });
    expect(parseForm(userChangeSchema, form({ id: "u1", active: "0" }))).toEqual({
      success: true,
      data: { id: "u1", active: 0 },
    });
    expect(parseForm(userChangeSchema, form({ id: "u1", role: "chef" })).success).toBe(false);
  });
});
