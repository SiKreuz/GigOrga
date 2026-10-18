import { describe, expect, test } from "vitest";

import { formatDate, formatDuration, formatMoney, relativeDay, todayIso } from "./format";

describe("format", () => {
  test("formats dates in German", () => {
    expect(formatDate("2026-12-11")).toBe("Fr. 11.12.2026");
  });

  test("formats money in euros", () => {
    expect(formatMoney(1234.5).replaceAll(" ", " ")).toBe("1.234,5 €");
    expect(formatMoney(null)).toBe("–");
  });

  test("formats durations", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(91)).toBe("1 h 31 min");
  });

  test("describes days relative to today", () => {
    expect(relativeDay("2026-10-17", "2026-10-17")).toBe("Heute");
    expect(relativeDay("2026-10-18", "2026-10-17")).toBe("Morgen");
    expect(relativeDay("2026-10-27", "2026-10-17")).toBe("in 10 Tagen");
    expect(relativeDay("2026-10-15", "2026-10-17")).toBe("vor 2 Tagen");
  });

  test("uses the Berlin calendar day", () => {
    expect(todayIso(new Date("2026-10-17T22:30:00Z"))).toBe("2026-10-18");
  });
});

describe("numbers", () => {
  test("round-trips German decimals", async () => {
    const { formatNumber, parseNumber } = await import("./format");
    expect(formatNumber(12.5)).toBe("12,5");
    expect(formatNumber(null)).toBe("");
    expect(parseNumber("12,5")).toBe(12.5);
    expect(parseNumber(" ")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});
