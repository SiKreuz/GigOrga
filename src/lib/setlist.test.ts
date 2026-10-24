import { describe, expect, test } from "vitest";

import { formatSongDuration, overrun, parseSongDuration, showSlot } from "./setlist";

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

  test("takes the slot from the first show with start and end", () => {
    expect(
      showSlot([
        entry("getin", "17:00", "18:00"),
        entry("show", "21:00", ""),
        entry("show", "21:00", "21:45"),
      ]),
    ).toBe(2700);
  });

  test("handles a show running past midnight", () => {
    expect(showSlot([entry("show", "23:30", "00:45")])).toBe(4500);
  });

  test("has no slot without a complete show entry", () => {
    expect(showSlot([entry("show", "21:00", "")])).toBeNull();
    expect(showSlot([])).toBeNull();
  });

  test("reports only a positive overrun", () => {
    expect(overrun(3000, 2700)).toBe(300);
    expect(overrun(2700, 2700)).toBeNull();
    expect(overrun(2000, 2700)).toBeNull();
    expect(overrun(3000, null)).toBeNull();
  });
});
