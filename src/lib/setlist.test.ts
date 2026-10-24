import { describe, expect, test } from "vitest";

import { formatSongDuration, overrun, parseSongDuration, slotOf } from "./setlist";

const entry = (kind: string, start: string, end: string) => ({ kind, start, end });

describe("setlist", () => {
  test("parses song durations as minutes and seconds", () => {
    expect(parseSongDuration("3:45")).toBe(225);
    expect(parseSongDuration(" 12:05 ")).toBe(725);
    expect(parseSongDuration("4")).toBe(240);
  });

  test("rejects malformed durations", () => {
    expect(parseSongDuration("")).toBeNull();
    expect(parseSongDuration("3:75")).toBeNull();
    expect(parseSongDuration("abc")).toBeNull();
    expect(parseSongDuration("0:00")).toBeNull();
  });

  test("formats durations as minutes and seconds", () => {
    expect(formatSongDuration(225)).toBe("3:45");
    expect(formatSongDuration(60)).toBe("1:00");
    expect(formatSongDuration(3725)).toBe("62:05");
  });

  test("takes the slot in seconds from the playtime of all shows", () => {
    expect(
      slotOf({
        timetable: [
          entry("getin", "17:00", "18:00"),
          entry("show", "21:00", "21:45"),
          entry("show", "23:30", "00:15"),
        ],
      }),
    ).toBe(5400);
    expect(slotOf({ timetable: [entry("show", "21:00", "")] })).toBeNull();
  });

  test("reports only a positive overrun", () => {
    expect(overrun(3000, 2700)).toBe(300);
    expect(overrun(2700, 2700)).toBeNull();
    expect(overrun(2000, 2700)).toBeNull();
    expect(overrun(3000, null)).toBeNull();
  });
});
