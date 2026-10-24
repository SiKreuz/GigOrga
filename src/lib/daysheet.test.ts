import { describe, expect, test } from "vitest";

import { hasAccommodation, hasContacts, hasHospitality, playtime, timesOf } from "./daysheet";

const noHospitality = { catering: 0, buyout: null, drinks: "", hospitalityNotes: "" };

describe("timesOf", () => {
  test("drops entries without a start time", () => {
    const timetable = [
      { id: "a", start: "18:00" },
      { id: "b", start: "" },
    ];
    expect(timesOf({ timetable }).map((entry) => entry.id)).toEqual(["a"]);
  });
});

describe("hasContacts", () => {
  test("is empty without venue and contacts", () => {
    expect(hasContacts({ venue: null, contacts: [] })).toBe(false);
  });

  test("counts a venue alone", () => {
    expect(hasContacts({ venue: {}, contacts: [] })).toBe(true);
  });

  test("counts contacts alone", () => {
    expect(hasContacts({ venue: null, contacts: [{}] })).toBe(true);
  });
});

describe("hasHospitality", () => {
  test("is empty when nothing is set", () => {
    expect(hasHospitality(noHospitality)).toBe(false);
  });

  test.each([{ catering: 1 }, { buyout: 0 }, { drinks: "frei" }, { hospitalityNotes: "vegan" }])(
    "is filled with %o",
    (field) => {
      expect(hasHospitality({ ...noHospitality, ...field })).toBe(true);
    },
  );
});

describe("hasAccommodation", () => {
  test("is empty without accommodation", () => {
    expect(hasAccommodation({ accommodationType: "keine" })).toBe(false);
  });

  test("is filled with any accommodation type", () => {
    expect(hasAccommodation({ accommodationType: "hotel" })).toBe(true);
  });
});

describe("playtime", () => {
  test("is the length of the show slot in minutes", () => {
    expect(playtime({ timetable: [{ kind: "show", start: "21:00", end: "22:15" }] })).toBe(75);
  });

  test("runs past midnight", () => {
    expect(playtime({ timetable: [{ kind: "show", start: "23:30", end: "00:30" }] })).toBe(60);
  });

  test("adds up several show slots", () => {
    const timetable = [
      { kind: "show", start: "20:00", end: "20:45" },
      { kind: "show", start: "21:15", end: "22:00" },
    ];
    expect(playtime({ timetable })).toBe(90);
  });

  test("ignores other kinds and shows without an end", () => {
    const timetable = [
      { kind: "soundcheck", start: "17:00", end: "17:30" },
      { kind: "show", start: "21:00", end: "" },
    ];
    expect(playtime({ timetable })).toBeNull();
  });
});
