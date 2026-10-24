import { describe, expect, test } from "vitest";

import { keyOf, roles } from "./labels";

describe("keyOf", () => {
  test("returns a known key", () => {
    expect(keyOf(roles, "admin")).toBe("admin");
  });

  test("throws for an unknown key", () => {
    expect(() => keyOf(roles, "owner")).toThrow("owner");
  });
});
