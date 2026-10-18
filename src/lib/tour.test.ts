import { describe, expect, test } from "vitest";

import { legOf, orderStops } from "./tour";

const stops = [
  { id: "c", date: "2026-11-03" },
  { id: "a2", date: "2026-11-01" },
  { id: "a1", date: "2026-11-01" },
];

describe("orderStops", () => {
  test("orders by date, then by creation", () => {
    expect(orderStops(stops).map((stop) => stop.id)).toEqual(["a1", "a2", "c"]);
  });
});

describe("legOf", () => {
  test("starts the first stop at home", () => {
    expect(legOf(stops, "a1")).toEqual({ from: null, returnsHome: false });
  });

  test("arrives from the previous stop", () => {
    expect(legOf(stops, "a2")).toEqual({
      from: { id: "a1", date: "2026-11-01" },
      returnsHome: false,
    });
  });

  test("drives home after the last stop", () => {
    expect(legOf(stops, "c")).toEqual({
      from: { id: "a2", date: "2026-11-01" },
      returnsHome: true,
    });
  });

  test("drives home after a tour with a single stop", () => {
    expect(legOf([{ id: "x", date: "2026-11-01" }], "x")).toEqual({
      from: null,
      returnsHome: true,
    });
  });
});
